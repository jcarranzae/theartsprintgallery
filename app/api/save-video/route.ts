import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, prompt, model, duration, ratio, taskId, userId = 2 } = await req.json();
    if (!videoUrl) {
      return NextResponse.json({ error: 'Falta la URL del video.' }, { status: 400 });
    }

    // Descargar el video desde la URL
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) {
      return NextResponse.json({ error: 'No se pudo descargar el video.' }, { status: 400 });
    }
    const blob = await videoRes.blob();

    // Crear nombre de archivo único
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `video_runway_${timestamp}.mp4`;
    const filePath = `videos/${fileName}`;

    // Subir a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('ai-generated-media')
      .upload(filePath, blob, {
        contentType: 'video/mp4',
        upsert: false
      });
    if (uploadError) {
      return NextResponse.json({ error: `Error al subir el video: ${uploadError.message}` }, { status: 500 });
    }

    // Guardar metadatos en la base de datos
    const { error: insertError } = await supabase
      .from('ai_media_assets')
      .insert({
        bucket_path: filePath,
        file_name: fileName,
        file_type: 'VIDEO',
        mime_type: 'video/mp4',
        size_in_bytes: blob.size,
        user_id: userId,
        metadata: {
          model,
          prompt,
          duration: Number(duration),
          aspect_ratio: ratio,
          generation_status: 'completed',
          aiml_generation_id: taskId
        }
      });
    if (insertError) {
      return NextResponse.json({ error: `Error al guardar en la base de datos: ${insertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, filePath });
  } catch (error) {
    console.error('Error en /api/save-video:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
} 