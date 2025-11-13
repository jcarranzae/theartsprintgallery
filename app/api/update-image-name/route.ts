import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUser } from '@/lib/db/queries';

export async function PATCH(req: NextRequest) {
  try {
    // Obtener usuario autenticado
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const { imageId, newName } = await req.json();

    if (!imageId || !newName || !newName.trim()) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Verificar que la imagen pertenece al usuario antes de actualizar
    const { data: existingImage } = await supabase
      .from('images')
      .select('id')
      .eq('id', imageId)
      .eq('user_id', user.id)
      .single();

    if (!existingImage) {
      return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 });
    }

    // Actualizar el nombre
    const { error } = await supabase
      .from('images')
      .update({ original_name: newName.trim() })
      .eq('id', imageId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error al actualizar nombre:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error en update-image-name:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
