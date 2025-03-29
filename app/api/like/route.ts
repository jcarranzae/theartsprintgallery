import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUser } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  try {
    const { imageId } = await req.json();
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verificar si el usuario ya dio like
    const { data: existingLike, error: likeError } = await supabase
      .from('image_likes')
      .select('*')
      .eq('user_id', user.id)
      .eq('image_id', imageId)
      .single();

    if (likeError && likeError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Error verificando like' }, { status: 500 });
    }

    if (existingLike) {
      return NextResponse.json({ message: 'Ya diste like a esta imagen' }, { status: 400 });
    }

    // Insertar nuevo like
    const { error: insertError } = await supabase.from('image_likes').insert([
      { user_id: user.id, image_id: imageId }
    ]);

    if (insertError) {
      throw insertError;
    }

    // Incrementar likes en la tabla de imágenes
    await supabase.rpc('increment_likes', { image_id: imageId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
