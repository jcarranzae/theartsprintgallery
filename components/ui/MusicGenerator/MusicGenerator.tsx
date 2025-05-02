'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import PromptInput from '../FluxGenerator/PromptInput';
import MusicViewer from './MusicViewer';
import { nullable } from 'zod';
import Image from 'next/image';

export default function MusicGenerator() {
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<string>('stable-audio');
  const [seconds_start, setSecondsStart] = useState<number>(1);
  const [seconds_total, setSecondsTotal] = useState<number>(30);  
  const [steps, setSteps] = useState<number>(100);

  const handleSubmit = async () => {
    if (!prompt) return alert('El prompt es obligatorio');
    setLoading(true);
    setResult(null);

    const payload: Record<string, any> = {
      model,
      prompt,
      secondsStart: seconds_start,
      secondsTotal: seconds_total,
      steps,
    };

    const response = await fetch('/api/musicGenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const { id } = await response.json();
    if (!id) {
      setLoading(false);
      return alert('Error al generar la música, por favor intenta de nuevo.');
    }

    for (let i = 0; i < 20; i++) {
      const poll = await fetch(`/api/check-music/${id}`);
      const data = await poll.json();
      if (data.completed) {
        setResult(data.sample);
        break;
      }
      await new Promise((res) => setTimeout(res, 5000));
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      {/* Panel izquierdo - Formulario */}
      <div className="flex-1 space-y-6 max-w-xl mx-auto lg:mx-0">
        <label className="block text-[#8C1AD9] font-semibold text-lg">Modelo</label>
        <input
          type="string"
          value={model}
          defaultValue="stable-audio"
          className="w-full px-4 py-3 bg-[#121559] text-white border-2 border-[#8C1AD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C1AD9] focus:border-transparent transition-all"
        />
        <PromptInput prompt={prompt} onChangePrompt={setPrompt} negativePrompt={null} onChangeNegativePrompt={() => {}} />
        <label className="block text-[#8C1AD9] font-semibold text-lg">Seconds Start</label>
        <input
          type="number"
          value={seconds_start}
          defaultValue={1}
          className="w-full px-4 py-3 bg-[#121559] text-white border-2 border-[#8C1AD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C1AD9] focus:border-transparent transition-all"
          min={1}
          max={30}
        />
        <label className="block text-[#8C1AD9] font-semibold text-lg">Seconds Total</label>
        <input
          type="number"
          value={seconds_total}
          defaultValue={30}
          className="w-full px-4 py-3 bg-[#121559] text-white border-2 border-[#8C1AD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C1AD9] focus:border-transparent transition-all"
          min={10}
          max={60}
        />
        <label className="block text-[#8C1AD9] font-semibold text-lg">Steps</label>
        <input
          type="number"
          value={steps}
          defaultValue={100}
          className="w-full px-4 py-3 bg-[#121559] text-white border-2 border-[#8C1AD9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C1AD9] focus:border-transparent transition-all"
          min={1}
          max={100}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !prompt}
          className="w-full py-3 px-6 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background: "linear-gradient(90deg, #8C1AD9 30%, #2C2A59 80%)",
            boxShadow: "0 0 16px 3px #8C1AD9",
            borderRadius: "12px",
          }}
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Generar Música'}
        </button>
        <MusicViewer result={result} />
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