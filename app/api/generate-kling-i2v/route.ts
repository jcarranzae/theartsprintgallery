// app/api/generate-kling-i2v/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getKlingAuthHeader } from '@/lib/klingJwtUtils';

const KLING_BASE_URL = 'https://api.klingai.com';

interface ImageToVideoRequest {
    model_name: string;
    input_image: string; // Base64 string
    prompt?: string;
    negative_prompt?: string;
    cfg_scale?: number;
    mode?: string;
    duration?: string;
    camera_control?: {
        type: string;
        config?: {
            horizontal?: number;
            vertical?: number;
            pan?: number;
            tilt?: number;
            roll?: number;
            zoom?: number;
        };
    };
    aspect_ratio?: string;
    external_task_id?: string;
    image_tail?: string; // Base64 string for end frame control
    static_mask?: string; // Base64 string for static brush
    dynamic_masks?: Array<{
        mask: string; // Base64 string
        trajectories: Array<{ x: number; y: number }>;
    }>;
}

// Helper function to convert base64 data URL to pure base64
function extractBase64FromDataUrl(dataUrl: string): string {
    if (dataUrl.startsWith('data:')) {
        // Remove the data:image/png;base64, prefix
        const base64Index = dataUrl.indexOf(',');
        if (base64Index !== -1) {
            return dataUrl.substring(base64Index + 1);
        }
    }
    return dataUrl; // Already pure base64
}

// Helper function to validate image constraints
function validateImageConstraints(base64: string): { valid: boolean; error?: string } {
    try {
        // Check if it's a valid base64
        const buffer = Buffer.from(base64, 'base64');
        const sizeInMB = buffer.length / (1024 * 1024);

        if (sizeInMB > 10) {
            return { valid: false, error: 'Image size exceeds 10MB limit' };
        }

        // For more thorough validation, we'd need to decode the image to check dimensions
        // For now, we'll rely on client-side validation and server response
        return { valid: true };
    } catch (error) {
        return { valid: false, error: 'Invalid base64 image data' };
    }
}

export async function POST(req: NextRequest) {
    try {
        const body: ImageToVideoRequest = await req.json();

        console.log('🎬 Kling I2V API Request:', {
            model: body.model_name,
            prompt: body.prompt?.substring(0, 100) + '...',
            mode: body.mode,
            duration: body.duration,
            hasImage: !!body.input_image,
            hasImageTail: !!body.image_tail,
            hasStaticMask: !!body.static_mask,
            hasDynamicMasks: !!(body.dynamic_masks && body.dynamic_masks.length > 0),
            hasCameraControl: !!body.camera_control
        });

        // Validate required fields
        if (!body.input_image && !body.image_tail) {
            return NextResponse.json({
                success: false,
                error: 'At least one of input_image or image_tail must be provided',
                details: 'Either image or image_tail parameter is required'
            }, { status: 400 });
        }

        // Process and validate input image
        let processedImage = '';
        if (body.input_image) {
            processedImage = extractBase64FromDataUrl(body.input_image);
            const validation = validateImageConstraints(processedImage);
            if (!validation.valid) {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid input image',
                    details: validation.error
                }, { status: 400 });
            }
        }

        // Process image_tail if provided
        let processedImageTail = '';
        if (body.image_tail) {
            processedImageTail = extractBase64FromDataUrl(body.image_tail);
            const validation = validateImageConstraints(processedImageTail);
            if (!validation.valid) {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid image_tail',
                    details: validation.error
                }, { status: 400 });
            }
        }

        // Process masks if provided
        let processedStaticMask = '';
        let processedDynamicMasks: Array<{ mask: string; trajectories: Array<{ x: number; y: number }> }> = [];

        if (body.static_mask) {
            processedStaticMask = extractBase64FromDataUrl(body.static_mask);
        }

        if (body.dynamic_masks && body.dynamic_masks.length > 0) {
            processedDynamicMasks = body.dynamic_masks.map(dm => ({
                mask: extractBase64FromDataUrl(dm.mask),
                trajectories: dm.trajectories
            }));
        }

        // Validate conflicting parameters
        const hasImageTail = !!processedImageTail;
        const hasMasks = !!processedStaticMask || processedDynamicMasks.length > 0;
        const hasCameraControl = !!body.camera_control;

        if (hasImageTail && (hasMasks || hasCameraControl)) {
            return NextResponse.json({
                success: false,
                error: 'Conflicting parameters',
                details: 'image_tail cannot be used with dynamic_masks/static_mask or camera_control'
            }, { status: 400 });
        }

        // Build the request payload for Kling API
        const klingPayload: any = {
            model_name: body.model_name || 'kling-v1',
            mode: body.mode || 'std',
            duration: body.duration || '5',
            prompt: body.prompt || '',
            cfg_scale: body.cfg_scale ?? 0.5
        };

        // Add images
        if (processedImage) {
            klingPayload.image = processedImage;
        }
        if (processedImageTail) {
            klingPayload.image_tail = processedImageTail;
        }

        // Add optional parameters
        if (body.negative_prompt) {
            klingPayload.negative_prompt = body.negative_prompt;
        }

        if (processedStaticMask) {
            klingPayload.static_mask = processedStaticMask;
        }

        if (processedDynamicMasks.length > 0) {
            klingPayload.dynamic_masks = processedDynamicMasks;
        }

        if (body.camera_control) {
            klingPayload.camera_control = body.camera_control;
        }

        if (body.external_task_id) {
            klingPayload.external_task_id = body.external_task_id;
        }

        console.log('🚀 Sending request to Kling I2V API:', {
            url: `${KLING_BASE_URL}/v1/videos/image2video`,
            model: klingPayload.model_name,
            hasImage: !!klingPayload.image,
            hasImageTail: !!klingPayload.image_tail,
            imageSize: klingPayload.image ? `${Math.round(klingPayload.image.length / 1024)}KB` : 'N/A'
        });

        // Get authentication header
        const authHeader = getKlingAuthHeader();

        // Make request to Kling API
        const response = await fetch(`${KLING_BASE_URL}/v1/videos/image2video`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeader
            },
            body: JSON.stringify(klingPayload)
        });

        const responseData = await response.json();

        console.log('📥 Kling I2V API Response:', {
            status: response.status,
            ok: response.ok,
            code: responseData.code,
            message: responseData.message,
            hasTaskId: !!responseData.data?.task_id
        });

        if (!response.ok || responseData.code !== 0) {
            console.error('❌ Kling I2V API Error:', responseData);

            // Handle specific error cases
            let errorMessage = responseData.message || 'Unknown error from Kling API';
            let suggestions: string[] = [];

            if (responseData.code === 400001) {
                errorMessage = 'Invalid request parameters';
                suggestions = [
                    'Check that your image is valid and under 10MB',
                    'Ensure image dimensions are at least 300px',
                    'Verify prompt is under 2500 characters'
                ];
            } else if (responseData.code === 400002) {
                errorMessage = 'Image content policy violation';
                suggestions = [
                    'Ensure your image follows content guidelines',
                    'Remove any inappropriate or sensitive content',
                    'Try with a different image'
                ];
            } else if (responseData.code === 429001) {
                errorMessage = 'Rate limit exceeded';
                suggestions = [
                    'Wait a few minutes before trying again',
                    'Check your API quota and usage limits'
                ];
            }

            return NextResponse.json({
                success: false,
                error: errorMessage,
                details: responseData.message,
                code: responseData.code,
                suggestions,
                step: 'api_request'
            }, { status: response.status });
        }

        // Success response
        console.log('✅ Kling I2V task created successfully:', responseData.data.task_id);

        return NextResponse.json({
            success: true,
            data: {
                task_id: responseData.data.task_id,
                task_status: responseData.data.task_status,
                created_at: responseData.data.created_at,
                updated_at: responseData.data.updated_at,
                external_task_id: responseData.data.task_info?.external_task_id
            },
            message: 'Image-to-video generation task created successfully'
        });

    } catch (error) {
        console.error('❌ Kling I2V API Error:', error);

        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error',
            step: 'server_error'
        }, { status: 500 });
    }
}