import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const maxDuration = 60;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: 'Falta el ID de la imagen' }, { status: 400 });
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

  try {
    console.log('Consultando estado de imagen:', id);
    const response = await axios.get(`${baseUrl}/get_result?id=${id}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Key': apiKey,
      },
      timeout: 50000,
    });

    const result = response.data;
    console.log('Estado de la imagen:', JSON.stringify(result, null, 2));

    if (result.status === 'Ready' && result.result?.sample) {
      console.log('Imagen lista, descargando desde:', result.result.sample);
      const imgRes = await axios.get(result.result.sample, {
        responseType: 'arraybuffer',
        timeout: 50000,
      });
      console.log('Imagen descargada, tamaño:', imgRes.data.length, 'bytes');
      const base64 = Buffer.from(imgRes.data).toString('base64');
      console.log('Base64 generado, longitud:', base64.length);

      const response = {
        completed: true,
        sample: base64,
        id,
      };
      console.log('✅ Devolviendo respuesta exitosa al cliente');
      return NextResponse.json(response);
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
  } catch (error: any) {
    console.error('Error al obtener imagen:', error);

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return NextResponse.json(
          {
            error: 'Timeout',
            details: 'La solicitud tardó demasiado tiempo.'
          },
          { status: 504 }
        );
      }

      if (error.response) {
        return NextResponse.json(
          { error: 'API Error', details: error.response.data },
          { status: error.response.status }
        );
      }

      if (error.request) {
        return NextResponse.json(
          { error: 'Network Error', details: 'No se pudo conectar con la API.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Error al obtener imagen', details: error.message || 'Error desconocido' },
      { status: 500 }
    );
  }
}
