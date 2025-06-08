// app/api/generate-kontext-pro/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface KontextProRequest {
  prompt: string;
  input_image?: string | null;
  seed?: number;
  aspect_ratio?: string;
  output_format?: 'jpg' | 'png';
  webhook_url?: string | null;
  webhook_secret?: string | null;
  prompt_upsampling?: boolean;
  safety_tolerance?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: KontextProRequest = await request.json();
    
    // Validación básica
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      );
    }

    // Obtener configuración del environment
    const baseUrl = process.env.BFL_BASE_URL;
    const apiKey = process.env.BFL_API_KEY;
    
    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { error: 'BFL API configuration not found' },
        { status: 500 }
      );
    }

    // Preparar payload con valores por defecto
    const payload = {
      prompt: body.prompt,
      input_image: body.input_image || null,
      seed: body.seed || 42,
      aspect_ratio: body.aspect_ratio || '16:9',
      output_format: body.output_format || 'png',
      webhook_url: body.webhook_url || null,
      webhook_secret: body.webhook_secret || null,
      prompt_upsampling: body.prompt_upsampling || false,
      safety_tolerance: body.safety_tolerance || 2
    };

    console.log('🚀 Sending request to Flux Kontext Pro:', payload);

    // Realizar request a BFL API
    const response = await fetch(`${baseUrl}/flux-kontext-pro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Key': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('BFL API Error:', response.status, errorText);
      return NextResponse.json(
        { 
          error: 'Failed to generate image with Flux Kontext Pro',
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Flux Kontext Pro response:', result);

    return NextResponse.json({
      success: true,
      data: result,
      model: 'flux-kontext-pro'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}