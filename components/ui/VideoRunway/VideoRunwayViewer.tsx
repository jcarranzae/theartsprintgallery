import Image from 'next/image';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import SaveButton from '../../ui/saveButton';
import { supabase } from '@/lib/supabase';

interface VideoRunwayViewerProps {
  videoUrl: string | null;
  prompt: string;
  isLoading: boolean;
  duration: number;
  ratio: string;
  model: string;
  taskId: string;
}

export default function VideoRunwayViewer({ 
  videoUrl, 
  prompt, 
  isLoading,
  duration,
  ratio,
  model,
  taskId
}: VideoRunwayViewerProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!videoUrl) return;
    setSaving(true);
    try {
      const response = await fetch('/api/save-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl,
          prompt,
          model,
          duration,
          ratio,
          taskId,
          userId: 2 // Puedes cambiar esto si tienes auth
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar el video');
      }
      setSaved(true);
    } catch (error) {
      console.error('Error al guardar el video:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar el video');
    }
    setSaving(false);
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