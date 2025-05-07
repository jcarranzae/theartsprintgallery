import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  //const id = params.id;
  if (!id) return NextResponse.json({ error: 'Falta el ID de la imagen' }, { status: 400 });

  const apiUrl = `https://api.us1.bfl.ai/v1/get_result?id=${id}`;
  const apiRes = await fetch(apiUrl, {
    headers: {
      Accept: 'application/json',
      'x-key': process.env.NEXT_PUBLIC_BFL_API_KEY ?? '',
    },
  });
  const apiData = await apiRes.json();

  if (apiData.status === 'Ready' && apiData.result?.sample) {
    // Descargar la imagen
    const imgRes = await fetch(apiData.result.sample);
    const buffer = await imgRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return NextResponse.json({ completed: true, sample: base64, id });
  }
  return NextResponse.json({ completed: false, id });
}
