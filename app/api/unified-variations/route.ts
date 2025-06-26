// api/unified-variations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UnifiedPromptSystem } from '@/lib/unified-prompt-system';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_input, content_type, platform, target_model, count = 3 } = body;

        // Validate required fields
        if (!user_input || !content_type || !platform || !target_model) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: user_input, content_type, platform, target_model'
            }, { status: 400 });
        }

        // Validate count
        if (count < 1 || count > 5) {
            return NextResponse.json({
                success: false,
                error: 'count must be between 1 and 5'
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

        // Initialize unified system and generate variations
        const unifiedSystem = new UnifiedPromptSystem(apiKey);

        console.log(`🔄 Generating ${count} ${content_type} variations for ${platform} using ${target_model}`);

        const variations = await unifiedSystem.generateVariations({
            user_input,
            content_type,
            platform,
            target_model
        }, count);

        return NextResponse.json({
            success: true,
            data: {
                variations
            }
        });

    } catch (error) {
        console.error('❌ Unified variations error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        }, { status: 500 });
    }
}