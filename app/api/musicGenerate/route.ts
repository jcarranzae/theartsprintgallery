import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { MediaService } from '@/lib/services/mediaService';

export async function POST(req: Request) {
  try {
    // Obtener la sesión del usuario
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const {...payload } = body;

    if (!payload.prompt || !payload.model) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const endpoint = `https://api.aimlapi.com/v2/generate/audio`;

    console.log('📤 Enviando a API:', endpoint);
    console.log('🧾 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AIML_API_KEY}`
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
    
    // Devolver el ID que espera el componente
    return NextResponse.json({ id: result.id });

  } catch (error) {
    console.error('Error al generar música:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
