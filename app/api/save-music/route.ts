import { NextRequest, NextResponse } from 'next/server';
import { MediaService } from '@/lib/services/mediaService';

export async function POST(req: NextRequest) {
  try {
    const { audioUrl, metadata } = await req.json();

    if (!audioUrl || !metadata) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    // Puedes quitar userId si no lo necesitas, o poner uno fijo para pruebas
    const userId = 1;

    const mediaService = new MediaService();
    const asset = await mediaService.uploadAudioFromUrl({
      audioUrl,
      userId,
      metadata,
      relatedTable: 'ai_media_assets',
      relatedId: userId,
    });

    return NextResponse.json({ success: true, asset });
  } catch (error) {
    console.error('Error al guardar música:', error);
    return NextResponse.json({ error: 'Error interno al guardar música' }, { status: 500 });
  }
}
