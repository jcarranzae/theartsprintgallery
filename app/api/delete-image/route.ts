import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUser } from '@/lib/db/queries';

export async function DELETE(req: NextRequest) {
  try {
    // Obtener usuario autenticado
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const { imageId } = await req.json();

    if (!imageId) {
      return NextResponse.json({ error: 'ID de imagen requerido' }, { status: 400 });
    }

    // Obtener la imagen para verificar que pertenece al usuario y obtener la URL
    const { data: image, error: fetchError } = await supabase
      .from('images')
      .select('id, url, user_id')
      .eq('id', imageId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !image) {
      return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 });
    }

    // Extraer el path del archivo desde la URL
    // URL típica: https://[PROJECT].supabase.co/storage/v1/object/public/[bucket]/[path]
    const urlParts = image.url.split('/storage/v1/object/public/');
    if (urlParts.length === 2) {
      const fullPath = urlParts[1]; // bucket/path
      const pathParts = fullPath.split('/');
      const bucket = pathParts[0]; // primer segmento es el bucket
      const filePath = pathParts.slice(1).join('/'); // resto es el path del archivo

      // Eliminar el archivo del storage
      const { error: storageError } = await supabase
        .storage
        .from(bucket)
        .remove([filePath]);

      if (storageError) {
        console.error('Error al eliminar archivo del storage:', storageError);
        // Continuar con la eliminación del registro aunque falle el storage
      }
    }

    // Eliminar el registro de la base de datos
    const { error: deleteError } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error al eliminar registro de imagen:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error en delete-image:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
