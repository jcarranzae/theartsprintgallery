// lib/utils/validation.ts
export class ValidationError extends Error {
    constructor(message: string, public field?: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export function validatePromptRequest(request: any): void {
    const { user_input, content_type, platform, target_model } = request;

    // Required fields validation
    if (!user_input?.trim()) {
        throw new ValidationError('User input is required and cannot be empty', 'user_input');
    }

    if (!content_type) {
        throw new ValidationError('Content type is required', 'content_type');
    }

    if (!platform) {
        throw new ValidationError('Platform is required', 'platform');
    }

    if (!target_model) {
        throw new ValidationError('Target model is required', 'target_model');
    }

    // Content type validation
    if (!['image', 'video'].includes(content_type)) {
        throw new ValidationError('Content type must be either "image" or "video"', 'content_type');
    }

    // Platform validation
    const validPlatforms = ['instagram', 'youtube_shorts', 'tiktok', 'twitter', 'linkedin'];
    if (!validPlatforms.includes(platform)) {
        throw new ValidationError(`Platform must be one of: ${validPlatforms.join(', ')}`, 'platform');
    }

    // Model validation
    const validFluxModels = ['flux-pro', 'flux-dev', 'flux-schnell'];
    const validKlingModels = ['kling-1-0', 'kling-1-5', 'kling-1-6', 'kling-2-0', 'kling-2-1'];

    if (content_type === 'image' && !validFluxModels.includes(target_model)) {
        throw new ValidationError(`For image generation, target_model must be one of: ${validFluxModels.join(', ')}`, 'target_model');
    }

    if (content_type === 'video' && !validKlingModels.includes(target_model)) {
        throw new ValidationError(`For video generation, target_model must be one of: ${validKlingModels.join(', ')}`, 'target_model');
    }

    // Input length validation
    if (user_input.length > 2000) {
        throw new ValidationError('User input must be less than 2000 characters', 'user_input');
    }

    if (user_input.length < 10) {
        throw new ValidationError('User input must be at least 10 characters long', 'user_input');
    }
}
