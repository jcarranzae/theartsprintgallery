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

    // Obtener parámetros
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = page * limit;
    const search = searchParams.get('search') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    // Construir query base
    let query = supabase
      .from('images')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Aplicar búsqueda (en nombre O prompt)
    if (search) {
      query = query.or(`original_name.ilike.%${search}%,prompt.ilike.%${search}%`);
    }

    // Aplicar filtro de fecha
    if (dateFrom && dateTo) {
      // Rango de fechas
      query = query
        .gte('created_at', `${dateFrom}T00:00:00`)
        .lte('created_at', `${dateTo}T23:59:59`);
    } else if (dateFrom) {
      // Solo fecha desde (ese día completo)
      query = query
        .gte('created_at', `${dateFrom}T00:00:00`)
        .lte('created_at', `${dateFrom}T23:59:59`);
    }

    // Ejecutar query con paginación
    const { data: images, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error al obtener imágenes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
