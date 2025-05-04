'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function MusicForm() {
  const router = useRouter();
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsGenerating(true);

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
      
      if (data.id) {
        setGenerationId(data.id);
        startPolling(data.id);
      } else {
        toast.error('No se pudo obtener el ID de generación');
        setIsGenerating(false);
      }

    } catch (error) {
      console.error(error);
      toast.error('Error al generar la música');
      setIsGenerating(false);
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
        
        if (data.completed) {
          clearInterval(interval);
          toast.success('Música generada exitosamente');
          setAudioUrl(data.sample);
          setGenerationId(null);
          setIsGenerating(false);
        } else if (data.error) {
          clearInterval(interval);
          toast.error('Error en la generación de música');
          setGenerationId(null);
          setIsGenerating(false);
        }
      } catch (error) {
        console.error(error);
        clearInterval(interval);
        toast.error('Error al verificar estado');
        setGenerationId(null);
        setIsGenerating(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const handleSave = async () => {
    if (!audioUrl) return;
    setSaving(true);
    try {
      const metadata = {
        prompt,
        model: 'stable-audio',
        secondsStart: 1,
        secondsTotal: 30,
        steps: 100,
        generatedAt: new Date().toISOString(),
      };
      const response = await fetch('/api/save-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl, metadata }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('¡Música guardada correctamente!');
        setSaved(true);
      } else {
        toast.error(data.error || 'Error al guardar la música');
      }
    } catch (error) {
      toast.error('Error al guardar la música');
    } finally {
      setSaving(false);
    }
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
      {/* Panel derecho - Imagen de fondo o reproductor */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="relative w-full h-[400px] max-w-md mx-auto flex items-center justify-center">
          {audioUrl ? (
            <div className="w-full flex flex-col items-center justify-center bg-[#1C228C] rounded-lg p-6 border-2 border-[#8C1AD9] shadow-2xl">
              <span className="text-[#8C1AD9] text-xl font-semibold mb-4">Tu música generada</span>
              <audio controls src={audioUrl} className="w-full mb-4" />
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className="w-full py-3 px-6 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] shadow-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20} /> Guardando...</span> : 'Guardar'}
              </button>
              {saved && (
                <a
                  href=""
                  onClick={e => { e.preventDefault(); window.location.reload(); }}
                  className="block mt-4 text-[#8C1AD9] hover:text-white font-semibold text-center transition-colors"
                >
                  Crear más música
                </a>
              )}
            </div>
          ) : (
            <>
              <Image
                src="/images/FondoMusica.png"
                alt="Fondo Música"
                fill
                className="rounded-lg object-contain"
                priority
              />
              {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-lg">
                  <span className="text-[#8C1AD9] text-xl font-semibold mb-2">Generando Música</span>
                  <Loader2 className="animate-spin text-[#8C1AD9]" size={32} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 