'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface AilmResponse {
  id: string;
  status: string;
  video?: {
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
  };
}

export default function VideoForm() {
  const router = useRouter();
  const [prompt, setPrompt] = useState<string>('');
  const [duration, setDuration] = useState<string>('5');
  const [ratio, setRatio] = useState<string>('16:9');
  const [model] = useState<string>('kling-video/v1.6/standard/text-to-video');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Almacena el ID de la tarea (si lo hay)
  const [taskId, setTaskId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1) Llamamos al endpoint interno que inicia la generación
      const response = await fetch("https://api.aimlapi.com/v2/generate/video/kling/generation", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AIML_API_KEY}`
        },
        body: JSON.stringify({
          'prompt': prompt,
          'duration': duration,
          'ratio': ratio,
          'model': model,
        }),
      });
      console.log('response:', response);

      if (!response.ok) {
        throw new Error('Error al iniciar la generación del video.');
      }

      const data: AilmResponse = await response.json();
      const { id, status } = data;

      if (!id) {
        throw new Error('No se recibió un ID de la API.');
      }

      // Guardamos el ID en el estado, para pruebas o debug
      setTaskId(id);

      // 2) Si el status devuelto es "queued", comenzamos el polling cada 2s
      if (status === 'queued') {
        pollStatus(id);
      }
      // En caso de que ya venga "completed" de inmediato (poco probable),
      // podemos manejarlo también:
      else if (status === 'completed' && data.video) {
        handleVideoReady(data.video.url);
      }
    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al generar el video.');
    } finally {
      setLoading(false);
    }
  };

  // Función que consulta el estado con un setInterval
  const pollStatus = (id: string) => {
    const intervalId = setInterval(async () => {
      try {
        // Llamamos a la API (o tu endpoint) que verifica el estado
        // Por ejemplo, '/api/getVideoStatus?id=xxx'
        const resp = await fetch(`https://api.aimlapi.com/v2/generate/video/kling/generation?generation_id=${id}`, { 
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AIML_API_KEY}`
          },  
        });
        
          //const datos = resp.json()


       // const resp = await fetch(`('https://api.aimlapi.com/v2/generate/video/kling/generation?generation_id=${id}`);
        if (!resp.ok) {
          throw new Error('Error al consultar el estado del video.');
        }

        const data: AilmResponse = await resp.json();
        console.log('polling status:', data.status);

        // Si el status es "completed", detenemos el polling
        if (data.status === 'completed' && data.video?.url) {
          clearInterval(intervalId);
          handleVideoReady(data.video.url);
        }
        // También podrías manejar otros estados (p.ej. "error") con else if
      } catch (error) {
        console.error(error);
        clearInterval(intervalId);
        alert('Ocurrió un error consultando el estado. Revisa la consola.');
      }
    }, 2000); // Cada 2 segundos
  };

  // Función para manejar el caso en que ya tenemos la URL del video
  const handleVideoReady = async (videoUrl: string) => {
    try {
      setSaving(true);
      
      // Convertir la URL del video a blob
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      
      // Crear un nombre de archivo seguro
      const timestamp = new Date().getTime();
      const safeFileName = `video_${timestamp}.mp4`;

      // Convertir blob a base64
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.readAsDataURL(blob);
      });

      // 1. Subir el archivo al bucket
      const buffer = Buffer.from(base64Data, 'base64');
      const path = `videos/${safeFileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('ai-generated-media')
        .upload(path, buffer, {
          contentType: 'video/mp4',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Error al subir el video: ${uploadError.message}`);
      }

      // 2. Obtener la URL pública
      const { data: urlData } = supabase.storage
        .from('ai-generated-media')
        .getPublicUrl(path);

      if (!urlData?.publicUrl) {
        throw new Error('No se pudo obtener la URL pública del video');
      }

      // 3. Insertar en ai_media_assets
      const { data: assetData, error: assetError } = await supabase
        .from('ai_media_assets')
        .insert({
          bucket_path: path,
          file_name: safeFileName,
          file_type: 'video',
          mime_type: 'video/mp4',
          size_in_bytes: blob.size,
          metadata: {
            duration: Number(duration),
            aspect_ratio: ratio,
            prompt: prompt,
            model: model,
            aiml_generation_id: taskId,
            generation_status: 'completed'
          },
          user_id: 2 // Temporal, deberías obtener el ID del usuario actual
        })
        .select()
        .single();

      if (assetError || !assetData) {
        throw new Error(`Error al guardar en ai_media_assets: ${assetError?.message}`);
      }

      // 4. Insertar en ai_media_asset_relations (nota: el nombre de la tabla también cambió)
      const { error: relationError } = await supabase
        .from('ai_media_asset_relations')
        .insert({
          media_asset_id: assetData.id,
          related_table: 'aiml_generations',
          related_id: 1, // Temporal, deberías tener el ID correcto
          relation_type: 'generation'
        });

      if (relationError) {
        throw new Error(`Error al guardar la relación: ${relationError.message}`);
      }

      console.log('Video guardado exitosamente:', urlData.publicUrl);
      router.push(`/success?videoUrl=${encodeURIComponent(urlData.publicUrl)}`);
    } catch (error) {
      console.error('Error al guardar el video:', error);
      alert('Error al guardar el video. Se mostrará el video original.');
      router.push(`/success?videoUrl=${encodeURIComponent(videoUrl)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-semibold">Texto / Prompt</label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Describe el contenido del video..."
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Duration</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="5"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Aspect Ratio</label>
        <select
          value={ratio}
          onChange={(e) => setRatio(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="16:9">16:9</option>
          <option value="9:16">9:16</option>
          <option value="1:1">1:1</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded"
        disabled={loading || saving}
      >
        {loading ? 'Generando...' : saving ? 'Guardando...' : 'Generar Video'}
      </button>

      {/* Mostrar el ID temporalmente para debug */}
      {taskId && <p className="text-gray-500 text-sm">Task ID: {taskId}</p>}
    </form>
  );
}
