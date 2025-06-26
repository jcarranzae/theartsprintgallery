// api/unified-optimize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UnifiedPromptSystem } from '@/lib/unified-prompt-system';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { existing_prompt, content_type, platform, target_model } = body;

        // Validate required fields
        if (!existing_prompt || !content_type || !platform || !target_model) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: existing_prompt, content_type, platform, target_model'
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

        // Initialize unified system and optimize prompt
        const unifiedSystem = new UnifiedPromptSystem(apiKey);

        console.log(`⚡ Optimizing ${content_type} prompt for ${platform} using ${target_model}`);

        const optimizedPrompt = await unifiedSystem.optimizeExistingPrompt(
            existing_prompt,
            platform,
            content_type,
            target_model
        );

        return NextResponse.json({
            success: true,
            data: {
                optimized_prompt: optimizedPrompt
            }
        });

    } catch (error) {
        console.error('❌ Unified optimization error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        }, { status: 500 });
    }
}