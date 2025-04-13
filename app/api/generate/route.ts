import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { model, ...payload } = body;

  if (!payload.prompt || !model) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }

  const modelPaths: Record<string, string> = {
    'flux-dev': 'flux-dev',
    'flux-pro': 'flux-pro',
    'flux-pro-1.1': 'flux-pro-1.1',
    'flux-pro-1.1-ultra': 'flux-pro-1.1-ultra',
  };

  const endpoint = `https://api.us1.bfl.ai/v1/${modelPaths[model]}`;

  console.log('📤 Enviando a API:', endpoint);
  console.log('🧾 Payload:', JSON.stringify(payload, null, 2));

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-key': process.env.NEXT_PUBLIC_BFL_API_KEY || '',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('❌ Error de API:', text);
    return NextResponse.json({ error: 'API Error', details: text }, { status: 500 });
  }

  const result = await response.json();
  console.log('✅ Respuesta de API:', result);
  return NextResponse.json(result);
}
