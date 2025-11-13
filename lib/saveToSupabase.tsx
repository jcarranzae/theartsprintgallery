import { supabase } from './supabase';


interface SaveOptions {
  base64Data: string;
  folder: string;
  bucket: string;
  table: string;
  prompt: string;
  originalName: string;
  imageId?: string | null;
  contentType?: string;
}

export async function saveToSupabase({
  base64Data,
  folder,
  bucket,
  table,
  prompt,
  originalName,
  imageId,
  contentType = 'image/jpeg',
}: SaveOptions): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // En lugar de llamar directamente a getUser() aquí (que causa error en el cliente),
    // llamaremos a un API endpoint que maneje la autenticación
    const response = await fetch('/api/save-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Data,
        folder,
        bucket,
        table,
        prompt,
        originalName,
        imageId,
        contentType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Error al guardar la imagen' };
    }

    const data = await response.json();
    return { success: true, url: data.url };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
