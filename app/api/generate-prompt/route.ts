// app/api/generate-prompt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PromptAgentSystem } from '@/lib/prompt-agent-system';
import { PromptGenerationRequest } from '@/types/agents';

export async function POST(request: NextRequest) {
  try {
    const body: PromptGenerationRequest = await request.json();
    
    // Validación básica
    if (!body.user_input || !body.platform) {
      return NextResponse.json(
        { error: 'user_input and platform are required' },
        { status: 400 }
      );
    }

    // Obtener API key del environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Inicializar sistema de agentes
    const promptSystem = new PromptAgentSystem(apiKey);

    // Generar prompt
    const result = await promptSystem.generatePrompt(body);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

