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
    const now = new Date();
    const extension = contentType === 'video/mp4' ? 'mp4' : 'jpg';
    const filename = `${originalName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${now.toISOString().replace(/[:.]/g, '-')}.${extension}`;
    const path = `${folder}/${filename}`;

    const buffer = Buffer.from(base64Data, 'base64');

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) return { success: false, error: uploadError.message };

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    const { error: insertError } = await supabase.from(table).insert({
      url: publicUrl,
      prompt: prompt,
      original_name: filename,
      image_id: imageId,
      likes: 0,
    });

    if (insertError) return { success: false, error: insertError.message };

    return { success: true, url: publicUrl };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
