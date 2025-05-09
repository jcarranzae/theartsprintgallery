'use client';

import { useEffect, useState } from 'react';
import SaveButton from '../saveButton';
import { saveToSupabase } from '@/lib/saveToSupabase';

interface Props {
  result: any; // respuesta de la API tras generar
  controlImageUrl: string;
  prompt: string;
}

export default function CannyResult({ result, controlImageUrl, prompt }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!result?.id) return;

    let tries = 0;
    const poll = async () => {
      tries++;
      const res = await fetch(`/api/canny/${result.id}`);
      const data = await res.json();
      if (data.completed && data.sample) {
        setImageUrl(`data:image/jpeg;base64,${data.sample}`);
      } else if (tries < 15) {
        setTimeout(poll, 2000);
      }
    };
    poll();
    // eslint-disable-next-line
  }, [result?.id]);

  const handleSave = async () => {
    if (!imageUrl) return;
    setSaving(true);
    const { success, url, error } = await saveToSupabase({
      base64Data: imageUrl.split(',')[1],
      folder: 'images',
      bucket: 'ai-generated-media',
      table: 'images',
      prompt,
      originalName: 'canny_output',
      imageId: result.id,
    });
    setSaving(false);
    if (success && url) setSavedUrl(url);
    else alert(error);
  };

  return (
    <div className="mt-8 text-center">
      {imageUrl ? (
        <div className="bg-[#121559] rounded-2xl p-6 border-2 border-[#8C1AD9] shadow-2xl max-w-xl mx-auto flex flex-col items-center">
          <img src={imageUrl} alt="Canny Output" className="mx-auto rounded-lg border-4 border-[#8C1AD9] shadow-2xl mb-4" />
          {!savedUrl && (
            <SaveButton onClick={handleSave} loading={saving} label="Guardar en Supabase" />
          )}
          {savedUrl && (
            <p className="mt-2 text-[#8C1AD9] font-semibold">
              Imagen guardada correctamente. <a href={savedUrl} target="_blank" className="underline hover:text-white transition-colors">Ver imagen</a>
            </p>
          )}
        </div>
      ) : (
        <p className="text-[#8C1AD9]">Esperando a que la imagen esté lista...</p>
      )}
    </div>
  );
}
