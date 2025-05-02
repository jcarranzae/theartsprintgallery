'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function MusicForm() {
  const router = useRouter();
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [generationId, setGenerationId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/musicGenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: 'stable-audio',
          secondsStart: 1,
          secondsTotal: 30,
          steps: 100
        }),
      });

      if (!response.ok) {
        throw new Error('Error al iniciar la generación');
      }

      const data = await response.json();
      
      if (data.status === 'queued') {
        setGenerationId(data.generationId);
        startPolling(data.generationId);
      } else if (data.status === 'completed') {
        toast.success('Música generada exitosamente');
        router.push('/dashboard/music');
      }

    } catch (error) {
      console.error(error);
      toast.error('Error al generar la música');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/check-music/${id}`);
        if (!response.ok) {
          throw new Error('Error al verificar estado');
        }

        const data = await response.json();
        
        if (data.status === 'completed') {
          clearInterval(interval);
          toast.success('Música generada exitosamente');
          router.push('/dashboard/music');
        } else if (data.status === 'error') {
          clearInterval(interval);
          toast.error('Error en la generación de música');
        }
        // Si sigue en proceso, continuamos con el polling
      } catch (error) {
        console.error(error);
        clearInterval(interval);
        toast.error('Error al verificar estado');
      }
    }, 2000); // Polling cada 2 segundos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      {/* Panel izquierdo - Formulario */}
      <div className="flex-1 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="bg-[#121559] p-8 rounded-2xl shadow-2xl max-w-xl w-full flex flex-col gap-6 border-2 border-[#8C1AD9]">
          <div>
            <label htmlFor="prompt" className="text-lg font-bold text-[#8C1AD9]">
              Describe la música que quieres generar
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-[#1C228C] border-2 border-[#8C1AD9] text-white focus:ring-[#8C1AD9] rounded-lg p-3 w-full transition-all focus:outline-none focus:ring-2 focus:border-transparent"
              rows={3}
              required
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
            {loading ? 'Generando...' : 'Generar Música'}
          </button>
          {generationId && (
            <div className="mt-4 p-4 bg-[#1C228C] rounded-lg border-2 border-[#8C1AD9] text-center">
              <p className="text-sm text-[#8C1AD9]">
                La generación está en proceso. ID: {generationId}
              </p>
            </div>
          )}
        </form>
      </div>
      {/* Panel derecho - Imagen de fondo */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative w-full h-[400px] max-w-md mx-auto">
          <Image
            src="/images/FondoMusica.png"
            alt="Fondo Música"
            fill
            className="rounded-lg object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
} 