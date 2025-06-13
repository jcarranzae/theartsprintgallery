// lib/saveVideoToSupabase.ts - VERSIÓN CORREGIDA
import { supabase } from './supabase';
import { getUser } from '@/lib/db/queries'; // Usar el sistema de auth personalizado

interface SaveVideoParams {
    videoUrl: string;
    prompt: string;
    model: string;
    taskId?: string | null;
    metadata?: {
        duration?: string;
        aspectRatio?: string;
        type?: string;
        mode?: string;
        cfg_scale?: number;
        camera_control?: any;
        inputImage?: string | null;  // ✅ AGREGADA para Image-to-Video
        [key: string]: any;
    };
}

interface SaveVideoResponse {
    success: boolean;
    url?: string;
    error?: string;
}

export async function saveKlingVideoToSupabase({
    videoUrl,
    prompt,
    model,
    taskId,
    metadata = {}
}: SaveVideoParams): Promise<SaveVideoResponse> {
    try {
        // 1. Obtener usuario autenticado usando el sistema JWT personalizado
        const user = await getUser();
        if (!user) {
            return {
                success: false,
                error: 'Usuario no autenticado'
            };
        }

        console.log('🎬 Saving Kling video for user:', user.id);

        // 2. Descargar el video desde la URL
        console.log('⬇️ Downloading video from:', videoUrl);
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
            throw new Error(`No se pudo descargar el video: ${videoResponse.statusText}`);
        }

        const videoBlob = await videoResponse.blob();
        console.log('✅ Video downloaded:', `${Math.round(videoBlob.size / 1024 / 1024)}MB`);

        // 3. Crear nombre de archivo único
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const randomId = Math.random().toString(36).substring(2, 8);
        const fileName = `kling_${model}_${timestamp}_${randomId}.mp4`;
        const filePath = `videos/${fileName}`;

        // 4. Subir a Supabase Storage
        console.log('📤 Uploading to Supabase Storage:', filePath);
        const { error: uploadError } = await supabase.storage
            .from('ai-generated-media')
            .upload(filePath, videoBlob, {
                contentType: 'video/mp4',
                upsert: false
            });

        if (uploadError) {
            console.error('❌ Upload error:', uploadError);
            return {
                success: false,
                error: `Error al subir el video: ${uploadError.message}`
            };
        }

        // 5. Obtener URL pública
        const { data: urlData } = supabase.storage
            .from('ai-generated-media')
            .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;
        console.log('✅ Video uploaded successfully:', publicUrl);

        // 6. Guardar metadatos en la tabla ai_media_assets (esquema correcto)
        const videoRecord = {
            bucket_path: filePath,
            file_name: fileName,
            file_type: 'VIDEO',
            mime_type: 'video/mp4',
            size_in_bytes: videoBlob.size,
            user_id: user.id, // Usar el user_id del sistema JWT personalizado
            metadata: {
                ...metadata,
                model,
                prompt,
                taskId,
                source: 'kling',
                public_url: publicUrl,
                generated_at: new Date().toISOString(),
                generation_type: metadata.inputImage ? 'image-to-video' : 'text-to-video'  // ✅ Identificar tipo
            }
        };

        console.log('💾 Saving to ai_media_assets table...');
        const { error: insertError } = await supabase
            .from('ai_media_assets')
            .insert(videoRecord);

        if (insertError) {
            console.error('❌ Database error:', insertError);
            // Limpiar archivo subido si falla la BD
            await supabase.storage.from('ai-generated-media').remove([filePath]);
            return {
                success: false,
                error: `Error al guardar en la base de datos: ${insertError.message}`
            };
        }

        console.log('✅ Video metadata saved to database');

        return {
            success: true,
            url: publicUrl
        };

    } catch (error) {
        console.error('❌ Save Kling video error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

// Función alternativa para videos de otros proveedores
export async function saveVideoToSupabase({
    videoUrl,
    prompt,
    model,
    source = 'unknown',
    metadata = {}
}: {
    videoUrl: string;
    prompt: string;
    model: string;
    source?: string;
    metadata?: any;
}): Promise<SaveVideoResponse> {
    return saveKlingVideoToSupabase({
        videoUrl,
        prompt,
        model,
        metadata: {
            ...metadata,
            source,
            generation_type: metadata.inputImage ? 'image-to-video' : 'text-to-video'  // ✅ Identificar tipo
        }
    });
}