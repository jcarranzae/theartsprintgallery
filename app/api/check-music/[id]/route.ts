import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { MediaService } from '@/lib/services/mediaService';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  console.log('Entrando en /api/check-music/[id] con id:', id);
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Falta el ID de la generación' }, { status: 400 });
    }

    const response = await fetch(`https://api.aimlapi.com/v2/generate/audio?generation_id=${id}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AIML_API_KEY}`
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'API error', details: errorText }, { status: 500 });
    }

    const result = await response.json();
    //console.log('Resultado de la API:', result);

    // Si la generación está completa, guardamos el audio
    if (result.status === 'completed' && result.audio_file?.url) {
      try {
       /* const mediaService = new MediaService();
        const mediaAsset = await mediaService.uploadAudioFromUrl({
          audioUrl: result.audio_file.url,
          userId: session.user.id,
          metadata: {
            generatedAt: new Date().toISOString()
          },
          relatedTable: 'ai_media_assets',
          relatedId: session.user.id
        });*/

        return NextResponse.json({
          completed: true,
          sample: result.audio_file.url,
          id
        });
      } catch (error) {
        console.error('Error al guardar el audio:', error);
        return NextResponse.json({
          completed: false,
          error: 'Error al guardar el audio'
        });
      }
    }

    // Si aún está en proceso
    return NextResponse.json({
      completed: false,
      id
    });

  } catch (error) {
    console.error('Error al verificar estado de música:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
