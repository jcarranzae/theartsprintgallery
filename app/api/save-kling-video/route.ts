// app/api/save-kling-video/route.ts - Nueva API optimizada para Kling
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUser } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
    try {
        // 1. Obtener usuario autenticado
        const user = await getUser();
        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'Usuario no autenticado. Por favor, inicia sesión.'
            }, { status: 401 });
        }

        // 2. Obtener datos del request
        const body = await req.json();
        const {
            videoUrl,
            prompt,
            model = 'kling-v2-master',
            taskId,
            duration,
            aspectRatio,
            mode,
            cfgScale,
            cameraControl,
            inputImage  // ✅ AGREGADA para Image-to-Video
        } = body;

        if (!videoUrl || !prompt) {
            return NextResponse.json({
                success: false,
                error: 'Faltan parámetros requeridos: videoUrl y prompt'
            }, { status: 400 });
        }

        console.log('🎬 Saving Kling video for user:', user.id, {
            model,
            taskId,
            videoUrl: videoUrl.substring(0, 50) + '...'
        });

        // 3. Descargar el video desde la URL
        let videoResponse;
        try {
            // Si la URL es externa, usar proxy si es necesario
            let fetchUrl = videoUrl;
            if (videoUrl.includes('klingai.com') || videoUrl.includes('replicate.delivery')) {
                fetchUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/proxy-video?url=${encodeURIComponent(videoUrl)}`;
            }

            videoResponse = await fetch(fetchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; Video-Saver/1.0)'
                }
            });

            if (!videoResponse.ok) {
                throw new Error(`HTTP ${videoResponse.status}: ${videoResponse.statusText}`);
            }
        } catch (fetchError) {
            console.error('❌ Error downloading video:', fetchError);
            return NextResponse.json({
                success: false,
                error: `No se pudo descargar el video: ${fetchError instanceof Error ? fetchError.message : 'Error desconocido'}`
            }, { status: 400 });
        }

        const videoBlob = await videoResponse.blob();
        const videoSizeMB = Math.round(videoBlob.size / 1024 / 1024);
        console.log('✅ Video downloaded successfully:', `${videoSizeMB}MB`);

        // 4. Validar tamaño del video (límite de 100MB)
        if (videoBlob.size > 100 * 1024 * 1024) {
            return NextResponse.json({
                success: false,
                error: `Video demasiado grande (${videoSizeMB}MB). Límite: 100MB.`
            }, { status: 400 });
        }

        // 5. Crear nombre de archivo único
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const randomId = Math.random().toString(36).substring(2, 8);
        const modelSafe = model.replace(/[^a-zA-Z0-9]/g, '-');
        const fileName = `kling_${modelSafe}_${timestamp}_${randomId}.mp4`;
        const filePath = `videos/${fileName}`;

        // 6. Subir a Supabase Storage
        console.log('📤 Uploading to Supabase Storage:', filePath);
        const { error: uploadError } = await supabase.storage
            .from('ai-generated-media')
            .upload(filePath, videoBlob, {
                contentType: 'video/mp4',
                upsert: false,
                duplex: 'half' // Necesario para algunos entornos
            });

        if (uploadError) {
            console.error('❌ Supabase upload error:', uploadError);
            return NextResponse.json({
                success: false,
                error: `Error al subir el video: ${uploadError.message}`
            }, { status: 500 });
        }

        // 7. Obtener URL pública
        const { data: urlData } = supabase.storage
            .from('ai-generated-media')
            .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;
        console.log('✅ Video uploaded successfully:', publicUrl);

        // 8. Preparar metadatos completos
        const videoMetadata = {
            model,
            prompt,
            taskId,
            duration,
            aspectRatio,
            mode,
            cfgScale,
            cameraControl,
            inputImage,  // ✅ AGREGADA para Image-to-Video
            source: 'kling',
            original_url: videoUrl,
            public_url: publicUrl,
            generated_at: new Date().toISOString(),
            file_size_mb: videoSizeMB,
            generation_type: inputImage ? 'image-to-video' : 'text-to-video'  // ✅ Identificar tipo de generación
        };

        // 9. Guardar metadatos en la tabla ai_media_assets
        const videoRecord = {
            bucket_path: filePath,
            file_name: fileName,
            file_type: 'VIDEO',
            mime_type: 'video/mp4',
            size_in_bytes: videoBlob.size,
            user_id: user.id,
            metadata: videoMetadata
        };

        console.log('💾 Saving to ai_media_assets table...');
        const { data: insertData, error: insertError } = await supabase
            .from('ai_media_assets')
            .insert(videoRecord)
            .select();

        if (insertError) {
            console.error('❌ Database error:', insertError);
            // Limpiar archivo subido si falla la BD
            await supabase.storage.from('ai-generated-media').remove([filePath]);
            return NextResponse.json({
                success: false,
                error: `Error al guardar en la base de datos: ${insertError.message}`
            }, { status: 500 });
        }

        console.log('✅ Video metadata saved to database:', insertData?.[0]?.id);

        return NextResponse.json({
            success: true,
            data: {
                id: insertData?.[0]?.id,
                url: publicUrl,
                filePath,
                fileName,
                sizeMB: videoSizeMB,
                metadata: videoMetadata
            }
        });

    } catch (error) {
        console.error('❌ Save Kling video API error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Error interno del servidor'
        }, { status: 500 });
    }
}