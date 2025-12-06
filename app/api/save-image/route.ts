// app/api/save-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';
import { getUser } from '@/lib/db/queries'; // Sistema de auth JWT personalizado

export async function POST(req: NextRequest) {
  try {
    const {
      base64Data,
      folder,
      bucket,
      table,
      prompt,
      originalName,
      imageId,
      contentType = 'image/jpeg'
    } = await req.json();

    // Obtener usuario autenticado usando el sistema JWT personalizado
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    console.log('📸 Saving image for user:', user.id);

    // Generar nombre de archivo y path
    const now = new Date();
    const extension = contentType === 'video/mp4' ? 'mp4' : 'jpg';
    const filename = `${originalName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${now.toISOString().replace(/[:.]/g, '-')}.${extension}`;
    const path = `${folder}/${filename}`;

    // Convertir base64 a buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // 1. Subir al storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 2. Obtener URL pública
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    // 3. Guardar en la base de datos con user_id
    const { error: insertError } = await supabase.from(table).insert({
      bucket_path: path,
      file_name: filename,
      file_type: 'IMAGE',
      mime_type: contentType,
      size_in_bytes: buffer.length,
      user_id: user.id,
      image_id: imageId || null,
      likes: 0,
      original_name: originalName,
      prompt: prompt,
      url: publicUrl,
      metadata: {
        source: 'flux',
        generated_at: new Date().toISOString()
      }
    });

    if (insertError) {
      console.error('❌ Database error:', insertError);
      // Limpiar archivo subido si falla la BD
      await supabase.storage.from(bucket).remove([path]);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log('✅ Image saved successfully with user_id:', user.id);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error('❌ Error al guardar imagen:', error);
    return NextResponse.json({ error: error.message || 'Error desconocido' }, { status: 500 });
  }
}
