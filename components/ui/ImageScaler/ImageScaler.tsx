'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ImageDiff from './ImageDiff';

interface ImageScalerProps {
  imageUrl?: string;
}

export default function ImageScaler({ imageUrl: initialImageUrl }: ImageScalerProps) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(2);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setOriginalImage(imageUrl);

    try {
      // 1. Llamar a la API de Replicate
      const response = await fetch('/api/imageScale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          scale
        }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar la imagen');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.output) {
        throw new Error('No se recibió una URL válida del servicio');
      }

      // Mostrar la imagen escalada inmediatamente con la URL de Replicate
      setResult(data.output);

      // 2. Guardar en Supabase (en segundo plano)
      try {
        const timestamp = new Date().getTime();
        const fileName = `scaled_image_${timestamp}.png`;
        const path = `images/${fileName}`;

        // Descargar la imagen escalada
        const imageResponse = await fetch(data.output);
        if (!imageResponse.ok) {
          throw new Error('Error al descargar la imagen escalada');
        }
        
        const blob = await imageResponse.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());

        // Subir a Supabase
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('ai-generated-media')
          .upload(path, buffer, {
            contentType: 'image/png',
            upsert: false,
          });

        if (uploadError) {
          console.error('Error al subir a Supabase:', uploadError.message);
          return;
        }

        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from('ai-generated-media')
          .getPublicUrl(path);

        // Guardar en ai_media_assets
        const { error: assetError } = await supabase
          .from('ai_media_assets')
          .insert({
            bucket_path: path,
            file_name: fileName,
            file_type: 'image/png',
            mime_type: 'image/png',
            size_in_bytes: blob.size,
            metadata: {
              original_url: imageUrl,
              scale_factor: scale,
              model: 'clarity-upscaler',
              generation_status: 'completed'
            },
            user_id: 2
          });

        if (assetError) {
          console.error('Error al guardar en base de datos:', assetError.message);
        }
      } catch (saveError) {
        console.error('Error al guardar en Supabase:', saveError);
        // No lanzamos el error para no interrumpir la experiencia del usuario
      }
    } catch (err: any) {
      console.error('Error completo:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Escalador de Imágenes</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL de la imagen
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="https://ejemplo.com/imagen.jpg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Factor de escala
          </label>
          <select
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-full p-2 border rounded-md"
          >
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !imageUrl}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Escalar Imagen'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {(originalImage || result) && (
        <div className="space-y-8">
          {originalImage && result && (
            <ImageDiff originalImage={originalImage} scaledImage={result} />
          )}
        </div>
      )}
    </div>
  );
} 