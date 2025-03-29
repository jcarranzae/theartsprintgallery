// app/api/check-image/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const imageId = params.id;

  try {
    const response = await fetch(`https://api.us1.bfl.ai/v1/get_result?id=${imageId}`, {
      headers: {
        Accept: 'application/json',
        'X-Key': process.env.NEXT_PUBLIC_BFL_API_KEY!,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Error al consultar estado: ${response.status}. ${errorText}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Si ya está listo
    if (result.status === 'Ready') {
      const imageUrl = result.result.sample;

      // Descargar la imagen en base64
      const imageRes = await fetch(imageUrl);
      const buffer = await imageRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      return NextResponse.json({
        completed: true,
        sample: base64,
        id: imageId,
        message: 'Proceso completado',
      });
    }

    // Aún en proceso
    return NextResponse.json({
      completed: false,
      status: result.status,
      message: 'Procesando...',
    }, { status: 202 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error en la consulta: ' + error.message },
      { status: 500 }
    );
  }
}
