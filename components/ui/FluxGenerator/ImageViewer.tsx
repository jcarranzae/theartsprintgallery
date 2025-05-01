'use client';

import React, { useState } from 'react';
import SaveButton from '../../ui/saveButton';
import { saveToSupabase } from '@/lib/saveToSupabase';
import Image from 'next/image';

interface ImageViewerProps {
  imageUrl: string | null;
  alt?: string;
  onDownload?: () => void;
  prompt?: string;
  imageId?: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ 
  imageUrl, 
  alt = 'Imagen generada', 
  onDownload,
  prompt = '',
  imageId = null
}) => {
  const [saving, setSaving] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [saved, setSavedState] = useState(false);

  const handleSave = async () => {
    if (!imageUrl) return;
    setSaving(true);
    
    const base64Data = imageUrl.split(',')[1];
    const { success, url, error } = await saveToSupabase({
      base64Data,
      folder: 'images',
      bucket: 'ai-generated-media',
      table: 'images',
      prompt: prompt || '',
      originalName: 'flux_output',
      imageId,
    });
    
    setSaving(false);
    if (success && url) {
      setSavedUrl(url);
      setSavedState(true);
    } else {
      if (error === 'Usuario no autenticado') {
        alert('Debes estar autenticado para guardar imágenes. Por favor, inicia sesión.');
      } else {
        alert(error || 'Error al guardar la imagen');
      }
    }
  };

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-[600px] rounded-lg shadow-2xl"
          />
          <div className="absolute bottom-4 right-4">
            {onDownload && (
              <button
                onClick={onDownload}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-800 text-white font-semibold rounded-lg transition-colors"
              >
                Descargar
              </button>
            )}
            {!savedUrl && (
              <SaveButton 
                onClick={handleSave} 
                loading={saving}
                label="Guardar imagen"
              />
            )}
          </div>
          {saved && (
            <div className="absolute bottom-16 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
              Imagen guardada correctamente...
              <a href="/dashboard/createImage" className="block text-center hover:text-white text-[#8C1AD9] font-semibold">
                Crear otra imagen
              </a>
            </div>
          )}
        </>
      ) : (
        <div className="relative w-full h-full">
          <Image
            src="/images/FondoImagen.png"
            alt="Fondo"
            fill
            className="rounded-lg object-contain"
            priority
          />
        </div>
      )}
    </div>
  );
};

export default ImageViewer;
