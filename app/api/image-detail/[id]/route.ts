import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUser } from '@/lib/db/queries';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Obtener usuario autenticado
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    // Obtener la imagen verificando que pertenece al usuario
    const { data: image, error } = await supabase
      .from('images')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !image) {
      return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 });
    }

    return NextResponse.json(image);
  } catch (error: any) {
    console.error('Error en image-detail:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
