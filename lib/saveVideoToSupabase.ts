// lib/saveVideoToSupabase.ts
import { supabase } from './supabase';

interface SaveVideoParams {
    base64Data: string;
    folder: string;
    bucket: string;
    table: string;
    prompt: string;
    originalName: string;
    videoId?: string | null;
    metadata?: {
        duration?: string;
        aspectRatio?: string;
        model?: string;
        type?: string;
        mode?: string;
        cfg_scale?: number;
        camera_control?: any;
        [key: string]: any;
    };
}

interface SaveVideoResponse {
    success: boolean;
    url?: string;
    error?: string;
}

export async function saveVideoToSupabase({
    base64Data,
    folder,
    bucket,
    table,
    prompt,
    originalName,
    videoId,
    metadata = {}
}: SaveVideoParams): Promise<SaveVideoResponse> {
    try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return {
                success: false,
                error: 'Usuario no autenticado'
            };
        }

        // Convert base64 to blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'video/mp4' });

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const fileName = `${originalName}_${timestamp}_${randomString}.mp4`;
        const filePath = `${folder}/${fileName}`;

        console.log('🎬 Uploading video to Supabase:', {
            bucket,
            filePath,
            size: blob.size,
            user: user.id
        });

        // Upload video file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, blob, {
                contentType: 'video/mp4',
                upsert: false
            });

        if (uploadError) {
            console.error('❌ Upload error:', uploadError);
            return {
                success: false,
                error: `Error uploading video: ${uploadError.message}`
            };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        console.log('✅ Video uploaded successfully:', publicUrl);

        // Save metadata to database
        const videoRecord = {
            id: videoId || `video_${timestamp}_${randomString}`,
            user_id: user.id,
            prompt: prompt,
            file_path: filePath,
            public_url: publicUrl,
            original_name: originalName,
            created_at: new Date().toISOString(),
            metadata: {
                ...metadata,
                file_size: blob.size,
                mime_type: 'video/mp4'
            }
        };

        const { data: dbData, error: dbError } = await supabase
            .from(table)
            .insert([videoRecord])
            .select();

        if (dbError) {
            console.error('❌ Database error:', dbError);
            // Try to clean up uploaded file
            await supabase.storage.from(bucket).remove([filePath]);
            return {
                success: false,
                error: `Error saving video metadata: ${dbError.message}`
            };
        }

        console.log('✅ Video metadata saved to database');

        return {
            success: true,
            url: publicUrl
        };

    } catch (error) {
        console.error('❌ Save video error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// Alternative function that extends the existing saveToSupabase for videos
export async function saveKlingVideoToSupabase({
    videoUrl,
    prompt,
    model,
    taskId,
    metadata = {}
}: {
    videoUrl: string;
    prompt: string;
    model: string;
    taskId?: string | null;
    metadata?: any;
}): Promise<SaveVideoResponse> {
    try {
        // Fetch video as blob
        const response = await fetch(videoUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }

        const blob = await response.blob();

        // Convert to base64
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const result = reader.result as string;
                const base64Data = result.split(',')[1];

                const saveResult = await saveVideoToSupabase({
                    base64Data,
                    folder: 'videos',
                    bucket: 'ai-generated-media',
                    table: 'videos',
                    prompt,
                    originalName: `kling_${model}`,
                    videoId: taskId,
                    metadata: {
                        ...metadata,
                        model,
                        source: 'kling'
                    }
                });

                resolve(saveResult);
            };
            reader.readAsDataURL(blob);
        });

    } catch (error) {
        console.error('❌ Save Kling video error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}