// lib/saveI2VVideoToSupabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface SaveI2VVideoParams {
    videoUrl: string;
    prompt: string;
    model: string;
    taskId?: string | null;
    metadata?: {
        duration?: string;
        aspectRatio?: string;
        type?: string;
        source?: string;
        input_image_provided?: boolean;
        has_image_tail?: boolean;
        has_static_mask?: boolean;
        has_dynamic_masks?: boolean;
        dynamic_masks_count?: number;
        has_camera_control?: boolean;
        camera_control_type?: string;
        generation_mode?: string;
        cfg_scale?: number;
        negative_prompt?: string;
    };
}

interface SaveVideoResponse {
    success: boolean;
    url?: string;
    error?: string;
    id?: string;
}

export async function saveI2VVideoToSupabase({
    videoUrl,
    prompt,
    model,
    taskId,
    metadata = {}
}: SaveI2VVideoParams): Promise<SaveVideoResponse> {
    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('❌ Auth error:', authError);
            return {
                success: false,
                error: 'Usuario no autenticado'
            };
        }

        console.log('💾 Saving I2V video to Supabase:', {
            userId: user.id,
            model,
            hasMetadata: Object.keys(metadata).length > 0,
            taskId,
            url: videoUrl.substring(0, 50) + '...'
        });

        // Download video content
        let videoBlob: Blob;
        try {
            // Handle proxied URLs
            const fetchUrl = videoUrl.startsWith('/api/proxy-video')
                ? videoUrl
                : videoUrl.startsWith('http')
                    ? `/api/proxy-video?url=${encodeURIComponent(videoUrl)}`
                    : videoUrl;

            const response = await fetch(fetchUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            videoBlob = await response.blob();
            console.log('✅ Video downloaded:', Math.round(videoBlob.size / 1024), 'KB');
        } catch (downloadError) {
            console.error('❌ Error downloading video:', downloadError);
            return {
                success: false,
                error: 'Error al descargar el video'
            };
        }

        // Generate filename
        const timestamp = new Date().getTime();
        const modelSlug = model.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const filename = `i2v-${modelSlug}-${timestamp}-${taskId || 'unknown'}.mp4`;
        const filePath = `${user.id}/videos/i2v/${filename}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('videos')
            .upload(filePath, videoBlob, {
                contentType: 'video/mp4',
                upsert: false
            });

        if (uploadError) {
            console.error('❌ Upload error:', uploadError);
            return {
                success: false,
                error: 'Error al subir el video a Supabase'
            };
        }

        console.log('✅ Video uploaded to storage:', uploadData.path);

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('videos')
            .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        // Prepare enhanced metadata for I2V
        const enhancedMetadata = {
            ...metadata,
            type: 'image_to_video',
            source: 'kling',
            file_size: videoBlob.size,
            file_path: filePath,
            filename,
            created_at: new Date().toISOString(),
            model_version: model,
            task_id: taskId,
            original_url: videoUrl,

            // I2V specific metadata
            generation_type: 'image_to_video',
            prompt_length: prompt.length,
            has_negative_prompt: !!(metadata.negative_prompt && metadata.negative_prompt.length > 0),

            // Feature flags
            features_used: {
                image_tail: metadata.has_image_tail || false,
                static_mask: metadata.has_static_mask || false,
                dynamic_masks: metadata.has_dynamic_masks || false,
                camera_control: metadata.has_camera_control || false,
                advanced_mode: metadata.has_image_tail || metadata.has_static_mask || metadata.has_dynamic_masks
            }
        };

        // Save to database
        const { data: dbData, error: dbError } = await supabase
            .from('generated_videos')
            .insert([
                {
                    user_id: user.id,
                    url: publicUrl,
                    prompt,
                    model,
                    metadata: enhancedMetadata,
                    created_at: new Date().toISOString(),
                    file_size: videoBlob.size,
                    file_path: filePath,
                    source: 'kling_i2v',
                    task_id: taskId,
                    generation_type: 'image_to_video'
                }
            ])
            .select()
            .single();

        if (dbError) {
            console.error('❌ Database error:', dbError);
            // Try to cleanup uploaded file
            await supabase.storage
                .from('videos')
                .remove([filePath]);

            return {
                success: false,
                error: 'Error al guardar en la base de datos'
            };
        }

        console.log('✅ I2V Video saved successfully:', {
            id: dbData.id,
            url: publicUrl,
            features: enhancedMetadata.features_used
        });

        return {
            success: true,
            url: publicUrl,
            id: dbData.id
        };

    } catch (error) {
        console.error('❌ Error saving I2V video:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// Enhanced function that also saves input image for comparison
export async function saveI2VVideoWithInputImage({
    videoUrl,
    inputImageDataUrl,
    prompt,
    model,
    taskId,
    metadata = {}
}: SaveI2VVideoParams & { inputImageDataUrl?: string }): Promise<SaveVideoResponse> {
    try {
        // First save the video
        const videoResult = await saveI2VVideoToSupabase({
            videoUrl,
            prompt,
            model,
            taskId,
            metadata
        });

        if (!videoResult.success || !inputImageDataUrl) {
            return videoResult;
        }

        // Save input image for comparison
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user } } = await supabase.auth.getUser();

        if (user && inputImageDataUrl) {
            try {
                // Convert data URL to blob
                const response = await fetch(inputImageDataUrl);
                const imageBlob = await response.blob();

                const timestamp = new Date().getTime();
                const imageFilename = `i2v-input-${timestamp}-${taskId || 'unknown'}.jpg`;
                const imageFilePath = `${user.id}/images/i2v-inputs/${imageFilename}`;

                const { data: imageUpload } = await supabase.storage
                    .from('images')
                    .upload(imageFilePath, imageBlob, {
                        contentType: 'image/jpeg',
                        upsert: false
                    });

                if (imageUpload) {
                    const { data: imageUrlData } = supabase.storage
                        .from('images')
                        .getPublicUrl(imageFilePath);

                    // Update video record with input image URL
                    await supabase
                        .from('generated_videos')
                        .update({
                            metadata: {
                                ...metadata,
                                input_image_url: imageUrlData.publicUrl,
                                input_image_path: imageFilePath
                            }
                        })
                        .eq('id', videoResult.id);

                    console.log('✅ Input image saved for comparison:', imageUrlData.publicUrl);
                }
            } catch (imageError) {
                console.warn('⚠️ Failed to save input image, but video was saved successfully:', imageError);
            }
        }

        return videoResult;
    } catch (error) {
        console.error('❌ Error in enhanced I2V save:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// Function to save I2V video using the existing saveKlingVideoToSupabase (compatibility wrapper)
export async function saveKlingVideoToSupabase(params: SaveI2VVideoParams): Promise<SaveVideoResponse> {
    return saveI2VVideoToSupabase(params);
}