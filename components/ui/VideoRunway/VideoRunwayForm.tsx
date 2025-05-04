'use client';

import React, { useState } from 'react';
import VideoRunwayViewer from './VideoRunwayViewer';
import ImageUploader from '../FluxGenerator/ImageUploader';

// Interface para la request
export interface RunwayVideoRequest {
  model: 'runway/gen4_turbo';
  prompt: string;
  image_url: string;
  duration: 5 | 10;
  ratio: '16:9' | '9:16' | '4:3' | '3:4' | '1:12' | '1:9';
  seed?: number;
}

export default function VideoRunwayForm() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<5 | 10>(5);
  const [ratio, setRatio] = useState<'16:9' | '9:16' | '4:3' | '3:4' | '1:12' | '1:9'>('16:9');
  const [model] = useState<'runway/gen4_turbo'>('runway/gen4_turbo');
  const [seed, setSeed] = useState<number | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string>('');

  // Convertir imagen a data URL
  const handleImageFileChange = async (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Por favor, sube una imagen.');
      return;
    }
    setLoading(true);
    setIsGenerating(true);
    setVideoUrl(null);
    setTaskId('');
    try {
      const body: RunwayVideoRequest = {
        model,
        prompt,
        image_url: imageUrl,
        duration,
        ratio,
      };
      if (seed !== '') body.seed = Number(seed);

      // Verificar que la API key esté disponible
      if (!process.env.NEXT_PUBLIC_AIML_API_KEY) {
        throw new Error('API key no configurada. Por favor, verifica las variables de entorno.');
      }

      console.log('Enviando petición con body:', body);
      console.log('API Key:', process.env.NEXT_PUBLIC_AIML_API_KEY ? 'Presente' : 'Ausente');

      const response = await fetch('https://api.aimlapi.com/v2/generate/video/runway/generation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AIML_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('Data Devuelta del POST: ', data);
      
      if (!response.ok) {
        throw new Error(`Error al iniciar la generación del video: ${data.message || 'Error desconocido'}`);
      }

      const { id, status } = data;
      if (!id) throw new Error('No se recibió un ID de la API.');
      setTaskId(id);
      if (status === 'queued') {
        pollStatus(id);
      } else if (status === 'completed' && data.video) {
        setVideoUrl(data.video.url);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Error completo:', error);
      alert(error instanceof Error ? error.message : 'Ocurrió un error al generar el video.');
      setIsGenerating(false);
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = (id: string) => {
    let elapsed = 0;
    const interval = 10000; // 10 segundos
    const maxTime = 300000; // 5 minutos en milisegundos

    const intervalId = setInterval(async () => {
      elapsed += interval;
      try {
        const resp = await fetch(`https://api.aimlapi.com/v2/generate/video/runway/generation?generation_id=${id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AIML_API_KEY}`
          },
        });
        if (!resp.ok) throw new Error('Error al consultar el estado del video.');
        const data = await resp.json();
        if (data.status === 'completed' && Array.isArray(data.video) && data.video[0]) {
          clearInterval(intervalId);
          setVideoUrl(data.video[0]);
          setIsGenerating(false);
        } else if (elapsed >= maxTime) {
          clearInterval(intervalId);
          alert('El tiempo máximo de espera ha sido alcanzado. Intenta nuevamente más tarde.');
          setIsGenerating(false);
        }
      } catch (error) {
        console.error(error);
        clearInterval(intervalId);
        alert('Ocurrió un error consultando el estado. Revisa la consola.');
        setIsGenerating(false);
      }
    }, interval);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      {/* Panel izquierdo - Controles */}
      <div className="flex-1 space-y-6 max-w-xl mx-auto lg:mx-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-[#8C1AD9] font-semibold text-lg">
              Imagen inicial (primer frame)
            </label>
            <ImageUploader imageFile={imageFile} setImageFile={handleImageFileChange} />
          </div>
          <div>
            <label className="block mb-2 text-[#8C1AD9] font-semibold text-lg">
              Texto / Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-3 bg-[#121559] text-white border-2 border-[#8C1AD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C1AD9] focus:border-transparent transition-all"
              placeholder="Describe el contenido del video..."
              rows={4}
              maxLength={1000}
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-[#8C1AD9] font-semibold text-lg">
              Duración (segundos)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) as 5 | 10)}
              className="w-full px-4 py-3 bg-[#121559] text-white border-2 border-[#8C1AD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C1AD9] focus:border-transparent transition-all"
            >
              <option value={5}>5 segundos</option>
              <option value={10}>10 segundos</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-[#8C1AD9] font-semibold text-lg">
              Formato de Video
            </label>
            <select
              value={ratio}
              onChange={(e) => setRatio(e.target.value as any)}
              className="w-full px-4 py-3 bg-[#121559] text-white border-2 border-[#8C1AD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C1AD9] focus:border-transparent transition-all"
            >
              <option value="16:9">Horizontal (16:9)</option>
              <option value="9:16">Vertical (9:16)</option>
              <option value="4:3">4:3</option>
              <option value="3:4">3:4</option>
              <option value="1:12">1:12</option>
              <option value="1:9">1:9</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-[#8C1AD9] font-semibold text-lg">
              Seed (opcional)
            </label>
            <input
              type="number"
              value={seed}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') setSeed('');
                else if (Number(val) <= 4294967295) setSeed(Number(val));
              }}
              className="w-full px-4 py-3 bg-[#121559] text-white border-2 border-[#8C1AD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C1AD9] focus:border-transparent transition-all"
              placeholder="Número aleatorio para reproducibilidad"
              min={0}
              max={4294967295}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: "linear-gradient(90deg, #8C1AD9 30%, #2C2A59 80%)",
              boxShadow: "0 0 16px 3px #8C1AD9",
              borderRadius: "12px",
            }}
          >
            {loading ? 'Generando...' : 'Generar Video'}
          </button>
          {taskId && (
            <p className="text-[#8C1AD9] text-sm mt-4 text-center">
              ID de la tarea: {taskId}
            </p>
          )}
        </form>
      </div>
      {/* Panel derecho - Vista previa */}
      <div className="flex-1 flex items-center justify-center">
        <VideoRunwayViewer
          videoUrl={videoUrl}
          prompt={prompt}
          isLoading={isGenerating}
          duration={duration}
          ratio={ratio}
          model={model}
          taskId={taskId}
        />
      </div>
    </div>
  );
} 