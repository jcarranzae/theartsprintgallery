import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUser } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  try {
    // Obtener usuario autenticado
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    // Obtener parámetros de paginación
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = page * limit;

    // Obtener imágenes del usuario con paginación
    const { data: images, error } = await supabase
      .from('images')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error al obtener imágenes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Obtener total de imágenes para saber si hay más
    const { count } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return NextResponse.json({
      images: images || [],
      hasMore: (offset + limit) < (count || 0),
      total: count || 0
    });
  } catch (error: any) {
    console.error('Error en user-images:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
