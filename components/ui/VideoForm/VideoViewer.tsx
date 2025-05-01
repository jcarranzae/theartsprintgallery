import Image from 'next/image';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import SaveButton from '../../ui/saveButton';
import { supabase } from '@/lib/supabase';

interface VideoViewerProps {
  videoUrl: string | null;
  prompt: string;
  isLoading: boolean;
  duration: string;
  ratio: string;
  model: string;
  taskId: string;
}

export default function VideoViewer({ 
  videoUrl, 
  prompt, 
  isLoading,
  duration,
  ratio,
  model,
  taskId
}: VideoViewerProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!videoUrl) return;
    setSaving(true);

    try {
      // 1. Descargar el video
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      
      // 2. Crear nombre de archivo único
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `video_${timestamp}.mp4`;
      const filePath = `videos/${fileName}`;

      // 3. Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('ai-generated-media')
        .upload(filePath, blob, {
          contentType: 'video/mp4',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Error al subir el video: ${uploadError.message}`);
      }

      // 4. Insertar en ai_media_assets
      const { error: insertError } = await supabase
        .from('ai_media_assets')
        .insert({
          bucket_path: filePath,
          file_name: fileName,
          file_type: 'VIDEO',
          mime_type: 'video/mp4',
          size_in_bytes: blob.size,
          user_id: 2,
          metadata: {
            model: model,
            prompt: prompt,
            duration: Number(duration),
            aspect_ratio: ratio,
            generation_status: 'completed',
            aiml_generation_id: taskId
          }
        });

      if (insertError) {
        throw new Error(`Error al guardar en la base de datos: ${insertError.message}`);
      }

      setSaved(true);
    } catch (error) {
      console.error('Error al guardar el video:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar el video');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      {videoUrl ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            src={videoUrl}
            controls
            className="max-w-full max-h-[600px] rounded-lg shadow-2xl"
            style={{
              boxShadow: "0 0 16px 3px #8C1AD9",
            }}
          >
            Tu navegador no soporta el elemento video.
          </video>
          <div className="absolute bottom-4 right-4">
            <SaveButton 
              onClick={handleSave} 
              loading={saving}
              label="Guardar video"
            />
          </div>
          {saved && (
            <div className="absolute bottom-16 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
              Video guardado correctamente...
              <a href="/dashboard/createVideo" className="block text-center hover:text-white text-[#8C1AD9] font-semibold">
                Crear otro video
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full h-full">
          <Image
            src="/images/FondoVideo.png"
            alt="Fondo"
            fill
            className="rounded-lg object-contain"
            priority
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[#8C1AD9] text-xl font-semibold bg-[#121559] px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                <span>Generando video</span>
                <Loader2 className="animate-spin" size={24} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 