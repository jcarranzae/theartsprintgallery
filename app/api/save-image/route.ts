// app/api/save-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { base64ToBuffer, generateFilename } from '@/utils/image';

export async function POST(req: NextRequest) {
  try {
    const { base64, prompt, imageId } = await req.json();

    // Obtener la sesión del usuario
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const buffer = base64ToBuffer(base64);
    const filename = generateFilename();
    const bucket = 'ai-generated-media';
    const path = `images/${filename}`;

    // 1. Subir al storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (storageError) {
      throw new Error('Error al subir al storage: ' + storageError.message);
    }

    // 2. Obtener URL pública
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = publicUrlData.publicUrl;

    // 3. Guardar en la base de datos
    const { error: dbError } = await supabase.from('images').insert([
      {
        url: publicUrl,
        prompt: prompt,
        original_name: filename,
        image_id: imageId,
        user_id: session.user.id,
        likes: 0
      },
    ]);

    if (dbError) {
      throw new Error('Error al guardar en la base de datos: ' + dbError.message);
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error('Error al guardar imagen:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
