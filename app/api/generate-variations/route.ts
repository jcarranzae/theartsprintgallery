// app/api/generate-variations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PromptAgentSystem } from '@/lib/prompt-agent-system';
import { PromptGenerationRequest } from '@/types/agents';

export async function POST(request: NextRequest) {
  try {
    const body: PromptGenerationRequest & { count?: number } = await request.json();
    
    if (!body.user_input || !body.platform) {
      return NextResponse.json(
        { error: 'user_input and platform are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const promptSystem = new PromptAgentSystem(apiKey);
    const variations = await promptSystem.generateVariations(body, body.count || 3);

    return NextResponse.json({
      success: true,
      data: {
        variations,
        count: variations.length
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate variations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

