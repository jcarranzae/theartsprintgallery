import axios from 'axios';
import { getUser } from '@/lib/db/queries';
import { createClient } from '@supabase/supabase-js';
//import { createClient } from '@/utils/supabase/client';
import { NextResponse } from 'next/server';
//import { createClient } from '@/utils/supabase/static-props';
//import { getUser } from '@/utils/supabase/queries';
//import { cookies } from 'next/headers';
//import { SupabaseAuthClient } from '@supabase/supabase-js/dist/module/lib/SupabaseAuthClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Key is not defined in environment variables.");
}
const supabase = createClient(supabaseUrl, supabaseKey);



export async function POST(request: Request) {
  //const supabase = await createClient();
  
  const user = await getUser();
  
    //console.log('👤 Usuario: ', user?.id);
    try {
      const { imageUrl } = await request.json();
      //console.log('✅ URL imagen:', imageUrl);
      if (!imageUrl) {
        throw new Error("You must select an image to upload.");
      }
      const date = new Date();
      const fileName = `imagen_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours()}${date.getMinutes()}.jpg`;
      // Descargar y guardar la imagen
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const file = response.data;
      const dir = user?.id;

      const { data: image, error: uploadError } = await supabase.storage.from("Theartprintgallery_images").upload(`${dir}/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      });
      
      if (uploadError) {
        throw uploadError;
      }

      if (image) {
        return NextResponse.json({ success: true, fileName });
      }
    } catch (error) {
      console.log(error);
    }

  /*try {
    const { imageUrl } = await request.json();
    
    // Crear directorio si no existe
    const publicDir = path.join(process.cwd(), 'public', 'imagenes');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Generar nombre de archivo con la fecha
    const date = new Date();
    const fileName = `imagen_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours()}${date.getMinutes()}.jpg`;
    const filePath = path.join(publicDir, fileName);

    // Descargar y guardar la imagen
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(filePath, response.data);

    return NextResponse.json({ success: true, fileName });
  } catch (error) {
    console.error('Error al guardar la imagen:', error);
    return NextResponse.json({ success: false, error: 'Error al guardar la imagen' }, { status: 500 });
  }*/
} 