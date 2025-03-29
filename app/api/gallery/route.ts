import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const bucket = process.env.SUPABASE_BUCKET!;
    //const bucket = bucketDB + '/public';

    // 1. Obtener imágenes del Storage
    const { data: files, error: storageError } = await supabase.storage.from(bucket).list('public');
    if (storageError) throw new Error('Error obteniendo imágenes del bucket: ' + storageError.message);

    // 2. Obtener imágenes desde la base de datos
    const { data: images, error: dbError } = await supabase.from('images').select('*');
    if (dbError) throw new Error('Error obteniendo datos de la base de datos: ' + dbError.message);

    // 3. Combinar la data
    const imagesWithDetails = files.map((file) => {
      const dbData = images.find((img) => img.original_name === file.name);
      console.log('dbData: ', dbData);
      return {
        image_id: dbData?.id || '', // Agregar el ID de la imagen
        url: supabase.storage.from(bucket).getPublicUrl('public/'+file.name).data.publicUrl,
        original_name: dbData?.original_name || file.name,
        created_at: dbData?.created_at || null,
        prompt: dbData?.prompt || '',
        likes: dbData?.likes || 0,
      };
    });

    return NextResponse.json(imagesWithDetails);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
