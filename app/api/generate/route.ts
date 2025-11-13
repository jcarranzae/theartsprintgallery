import { NextResponse } from 'next/server';
import axios from 'axios';

// Aumentar el tiempo máximo de ejecución para esta ruta (en segundos)
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.json();
  const { model, ...payload } = body;

  if (!payload.prompt || !model) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }

  // Usar las mismas variables de entorno que Kontext (que funcionan)
  const baseUrl = process.env.BFL_BASE_URL || process.env.NEXT_PUBLIC_BFL_BASE_URL;
  const apiKey = process.env.BFL_API_KEY || process.env.NEXT_PUBLIC_BFL_API_KEY;

  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: 'BFL API configuration not found' },
      { status: 500 }
    );
  }

  const modelPaths: Record<string, string> = {
    'flux-dev': 'flux-dev',
    'flux-pro': 'flux-pro',
    'flux-pro-1.1': 'flux-pro-1.1',
    'flux-pro-1.1-ultra': 'flux-pro-1.1-ultra',
  };

  const endpoint = `${baseUrl}/${modelPaths[model]}`;

  console.log('📤 Enviando a API:', endpoint);
  console.log('🧾 Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Key': apiKey,
      },
      timeout: 50000, // 50 segundos de timeout total
      // Axios maneja automáticamente el timeout de conexión
    });

    console.log('✅ Respuesta de API:', response.data);

    // Asegurarse de devolver tanto el id como la polling_url
    const result = {
      id: response.data.id,
      polling_url: response.data.polling_url
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ Error en request:', error);

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return NextResponse.json(
          {
            error: 'Timeout',
            details: 'La solicitud tardó demasiado tiempo. Por favor, verifica tu conexión a internet e intenta de nuevo.'
          },
          { status: 504 }
        );
      }

      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        console.error('❌ Error de API:', error.response.data);
        return NextResponse.json(
          { error: 'API Error', details: error.response.data },
          { status: error.response.status }
        );
      }

      if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta
        return NextResponse.json(
          {
            error: 'Network Error',
            details: 'No se pudo conectar con la API. Verifica tu conexión a internet o si hay un firewall bloqueando la conexión.'
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Server Error', details: error.message || 'Error desconocido' },
      { status: 500 }
    );
  }
}
