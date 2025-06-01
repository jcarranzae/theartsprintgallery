import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } 
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: 'Falta el ID de la imagen' }, { status: 400 });
  }

  try {
    console.log('Consultando estado de imagen:', id);
    const response = await fetch(`https://api.us1.bfl.ai/v1/get_result?id=${id}`, {
      headers: {
        Accept: 'application/json',
        'x-key': process.env.NEXT_PUBLIC_BFL_API_KEY || '',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en API externa:', errorText);
      return NextResponse.json({ error: 'API error', details: errorText }, { status: 500 });
    }

    const result = await response.json();
    console.log('Estado de la imagen:', result);

    if (result.status === 'Ready' && result.result?.sample) {
      console.log('Imagen lista, descargando...');
      const imgRes = await fetch(result.result.sample);
      if (!imgRes.ok) {
        throw new Error('Error al descargar la imagen');
      }
      const buffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      return NextResponse.json({
        completed: true,
        sample: base64,
        id,
      });
    }

    if (result.status === 'error') {
      console.error('Error en la generación:', result);
      return NextResponse.json({ 
        error: 'Error en la generación', 
        details: result.error || 'Error desconocido' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      completed: false, 
      id,
      status: result.status,
      progress: result.progress || 0
    });
  } catch (err) {
    console.error('Error al obtener imagen:', err);
    return NextResponse.json(
      { error: 'Error al obtener imagen', details: (err as Error).message },
      { status: 500 }
    );
  }
}
