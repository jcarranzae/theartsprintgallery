// app/api/generate-kontext-max/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface KontextMaxRequest {
  prompt: string;
  input_image?: string | null;
  input_image_2?: string | null; // Experimental Multiref
  input_image_3?: string | null; // Experimental Multiref
  input_image_4?: string | null; // Experimental Multiref
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
    const body: KontextMaxRequest = await request.json();

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
      input_image_2: body.input_image_2 || null,
      input_image_3: body.input_image_3 || null,
      input_image_4: body.input_image_4 || null,
      seed: body.seed || 42,
      aspect_ratio: body.aspect_ratio || '16:9',
      output_format: body.output_format || 'png',
      webhook_url: body.webhook_url || null,
      webhook_secret: body.webhook_secret || null,
      prompt_upsampling: body.prompt_upsampling || false,
      safety_tolerance: body.safety_tolerance || 2
    };

    const imageCount = [payload.input_image, payload.input_image_2, payload.input_image_3, payload.input_image_4]
      .filter(img => img !== null).length;
    console.log(`🚀 Sending request to Flux Kontext Max with ${imageCount} context image(s)`);

    // Realizar request a BFL API
    const response = await fetch(`${baseUrl}/flux-kontext-max`, {
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
          error: 'Failed to generate image with Flux Kontext Max',
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Flux Kontext Max response:', result);

    return NextResponse.json({
      success: true,
      data: result,
      model: 'flux-kontext-max'
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