'use client';

import React, { useState } from 'react';
import VideoViewer from './VideoViewer';

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
  const [prompt, setPrompt] = useState<string>('');
  const [duration, setDuration] = useState<string>('5');
  const [ratio, setRatio] = useState<string>('16:9');
  const [model] = useState<string>('kling-video/v1.6/standard/text-to-video');
  const [loading, setLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsGenerating(true);
    setVideoUrl(null);

    try {
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

      if (!response.ok) {
        throw new Error('Error al iniciar la generación del video.');
      }

      const data: AilmResponse = await response.json();
      const { id, status } = data;

      if (!id) {
        throw new Error('No se recibió un ID de la API.');
      }

      setTaskId(id);

      if (status === 'queued') {
        pollStatus(id);
      } else if (status === 'completed' && data.video) {
        setVideoUrl(data.video.url);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al generar el video.');
      setIsGenerating(false);
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = (id: string) => {
    const intervalId = setInterval(async () => {
      try {
        const resp = await fetch(`https://api.aimlapi.com/v2/generate/video/kling/generation?generation_id=${id}`, { 
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AIML_API_KEY}`
          },  
        });
        
        if (!resp.ok) {
          throw new Error('Error al consultar el estado del video.');
        }

        const data: AilmResponse = await resp.json();
        console.log('polling status:', data.status);

        if (data.status === 'completed' && data.video?.url) {
          clearInterval(intervalId);
          setVideoUrl(data.video.url);
          setIsGenerating(false);
        }
      } catch (error) {
        console.error(error);
        clearInterval(intervalId);
        alert('Ocurrió un error consultando el estado. Revisa la consola.');
        setIsGenerating(false);
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      {/* Panel izquierdo - Controles */}
      <div className="flex-1 space-y-6 max-w-xl mx-auto lg:mx-0">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-[#8C1AD9] font-semibold text-lg">
              Duración (segundos)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-3 bg-[#121559] text-white border-2 border-[#8C1AD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C1AD9] focus:border-transparent transition-all"
              placeholder="5"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-[#8C1AD9] font-semibold text-lg">
              Formato de Video
            </label>
            <select
              value={ratio}
              onChange={(e) => setRatio(e.target.value)}
              className="w-full px-4 py-3 bg-[#121559] text-white border-2 border-[#8C1AD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C1AD9] focus:border-transparent transition-all"
            >
              <option value="16:9">Horizontal (16:9)</option>
              <option value="9:16">Vertical (9:16)</option>
              <option value="1:1">Cuadrado (1:1)</option>
            </select>
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
        <VideoViewer 
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
