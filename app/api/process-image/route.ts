// app/api/process-image/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image, mask, prompt } = await req.json();

    if (!image || !mask || !prompt) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos (imagen, máscara o prompt)' },
        { status: 400 }
      );
    }

    const payload = {
      image,
      mask,
      prompt,
      steps: 50,
      prompt_upsampling: false,
      seed: 1,
      guidance: 60,
      output_format: 'jpeg',
      safety_tolerance: 2,
    };


    
    const response = await fetch('https://api.us1.bfl.ai/v1/flux-pro-1.0-fill', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Key': process.env.NEXT_PUBLIC_BFL_API_KEY!,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Error en API externa: ${errorText}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error en el servidor: ' + error.message },
      { status: 500 }
    );
  }
}
