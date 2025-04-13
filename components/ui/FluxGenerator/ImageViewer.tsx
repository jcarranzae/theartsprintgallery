'use client';

import { useState } from 'react';
import SaveButton from '../saveButton';
import { saveToSupabase } from '@/lib/saveToSupabase';

interface ImageViewerProps {
  result: string | null;
}
const prompt = 'flux_output';
const imageId = 'flux_output';

export default function ImageViewer({ result }: ImageViewerProps) {
  if (!result) return null;
  const [saving, setSaving] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    setSavedUrl(null);

    const { success, url, error } = await saveToSupabase({
      base64Data: result.split(',')[1],
      folder: 'public',
      bucket: 'Theartprintgallery_images',
      table: 'images',
      prompt,
      originalName: 'flux_output',
      imageId,
    });

    if (success && url) setSavedUrl(url);
    else alert('Error al guardar en Supabase: ' + error);

    setSaving(false);
  };

  return (
    <div className="mt-4">
      <p className="text-sm font-medium mb-2">Resultado:</p>
      <img
        src={result}
        alt="Resultado generado"
        className="rounded shadow max-w-full h-auto"
      />

      {result && (
        <div className="mt-6">
          <p className="text-sm mb-2 font-semibold">Resultado:</p>
          <img src={result} alt="Resultado generado" className="rounded shadow-md max-w-full h-auto" />
          <div className="mt-4">
            {!savedUrl && (
              <SaveButton onClick={handleSave} loading={saving} label="Guardar en Supabase" />
            )}
            {savedUrl && (
              <p className="mt-2 text-sm text-green-700">
                Imagen guardada correctamente. <a href={savedUrl} target="_blank" className="underline">Ver imagen</a>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
