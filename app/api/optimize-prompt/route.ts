// app/api/optimize-prompt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PromptAgentSystem } from '@/lib/prompt-agent-system';
import { Platform, FluxModel } from '@/types/agents';

interface OptimizeRequest {
  existing_prompt: string;
  platform: Platform;
  target_model?: FluxModel;
}

export async function POST(request: NextRequest) {
  try {
    const body: OptimizeRequest = await request.json();
    
    if (!body.existing_prompt || !body.platform) {
      return NextResponse.json(
        { error: 'existing_prompt and platform are required' },
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
    const optimizedPrompt = await promptSystem.optimizeExistingPrompt(
      body.existing_prompt,
      body.platform,
      body.target_model || 'flux-pro'
    );

    return NextResponse.json({
      success: true,
      data: {
        original_prompt: body.existing_prompt,
        optimized_prompt: optimizedPrompt,
        platform: body.platform,
        flux_model: body.target_model || 'flux-pro'
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to optimize prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}