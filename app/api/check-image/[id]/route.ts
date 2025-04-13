import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } 
) {
  //const id = context?.params?.id;
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: 'Falta el ID de la imagen' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.us1.bfl.ai/v1/get_result?id=${id}`, {
      headers: {
        Accept: 'application/json',
        'x-key': process.env.NEXT_PUBLIC_BFL_API_KEY || '',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'API error', details: errorText }, { status: 500 });
    }

    const result = await response.json();

    if (result.status === 'Ready' && result.result?.sample) {
      const imgRes = await fetch(result.result.sample);
      const buffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      return NextResponse.json({
        completed: true,
        sample: base64,
        id,
      });
    }

    return NextResponse.json({ completed: false, id });
  } catch (err) {
    return NextResponse.json(
      { error: 'Error al obtener imagen', details: (err as Error).message },
      { status: 500 }
    );
  }
}
