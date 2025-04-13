'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
            Describe la música que quieres generar
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows={4}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Generando...' : 'Generar Música'}
        </button>
      </form>
      
      {generationId && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            La generación está en proceso. ID: {generationId}
          </p>
        </div>
      )}
    </div>
  );
} 