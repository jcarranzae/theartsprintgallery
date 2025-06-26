// api/unified-generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UnifiedPromptSystem } from '@/lib/unified-prompt-system';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_input, content_type, platform, target_model } = body;

        // Validate required fields
        if (!user_input || !content_type || !platform || !target_model) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: user_input, content_type, platform, target_model'
            }, { status: 400 });
        }

        // Validate content type
        if (!['image', 'video'].includes(content_type)) {
            return NextResponse.json({
                success: false,
                error: 'content_type must be either "image" or "video"'
            }, { status: 400 });
        }

        // Validate platform
        const validPlatforms = ['instagram', 'youtube_shorts', 'tiktok', 'twitter', 'linkedin'];
        if (!validPlatforms.includes(platform)) {
            return NextResponse.json({
                success: false,
                error: `platform must be one of: ${validPlatforms.join(', ')}`
            }, { status: 400 });
        }

        // Validate model based on content type
        const validFluxModels = ['flux-pro', 'flux-dev', 'flux-schnell'];
        const validKlingModels = ['kling-1-0', 'kling-1-5', 'kling-1-6', 'kling-2-0', 'kling-2-1'];

        if (content_type === 'image' && !validFluxModels.includes(target_model)) {
            return NextResponse.json({
                success: false,
                error: `For image generation, target_model must be one of: ${validFluxModels.join(', ')}`
            }, { status: 400 });
        }

        if (content_type === 'video' && !validKlingModels.includes(target_model)) {
            return NextResponse.json({
                success: false,
                error: `For video generation, target_model must be one of: ${validKlingModels.join(', ')}`
            }, { status: 400 });
        }

        // Get OpenAI API key
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                success: false,
                error: 'OpenAI API key not configured'
            }, { status: 500 });
        }

        // Initialize unified system and generate prompt
        const unifiedSystem = new UnifiedPromptSystem(apiKey);

        console.log(`🚀 Generating ${content_type} prompt for ${platform} using ${target_model}`);

        const result = await unifiedSystem.generatePrompt({
            user_input,
            content_type,
            platform,
            target_model
        });

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('❌ Unified generation error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        }, { status: 500 });
    }
}