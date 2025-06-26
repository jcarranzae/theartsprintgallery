// utils/api-helpers.ts - Utilidades para la API
import {
    NextResponse

} from "next/server";
export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export function handleApiError(error: unknown): NextResponse {
    console.error('API Error:', error);

    if (error instanceof ApiError) {
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code
        }, { status: error.statusCode });
    }

    if (error instanceof Error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }

    return NextResponse.json({
        success: false,
        error: 'Internal server error'
    }, { status: 500 });
}

export function validateRequestBody(body: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
        throw new ApiError(
            `Missing required fields: ${missingFields.join(', ')}`,
            400,
            'MISSING_FIELDS'
        );
    }
}

export function validateContentType(contentType: string): void {
    if (!['image', 'video'].includes(contentType)) {
        throw new ApiError(
            'content_type must be either "image" or "video"',
            400,
            'INVALID_CONTENT_TYPE'
        );
    }
}

export function validatePlatform(platform: string): void {
    const validPlatforms = ['instagram', 'youtube_shorts', 'tiktok', 'twitter', 'linkedin'];

    if (!validPlatforms.includes(platform)) {
        throw new ApiError(
            `platform must be one of: ${validPlatforms.join(', ')}`,
            400,
            'INVALID_PLATFORM'
        );
    }
}

export function validateModel(model: string, contentType: string): void {
    const validFluxModels = ['flux-pro', 'flux-dev', 'flux-schnell'];
    const validKlingModels = ['kling-1-0', 'kling-1-5', 'kling-1-6', 'kling-2-0', 'kling-2-1'];

    if (contentType === 'image' && !validFluxModels.includes(model)) {
        throw new ApiError(
            `For image generation, target_model must be one of: ${validFluxModels.join(', ')}`,
            400,
            'INVALID_FLUX_MODEL'
        );
    }

    if (contentType === 'video' && !validKlingModels.includes(model)) {
        throw new ApiError(
            `For video generation, target_model must be one of: ${validKlingModels.join(', ')}`,
            400,
            'INVALID_KLING_MODEL'
        );
    }
}