'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import PromptInput from '../FluxGenerator/PromptInput';
import MusicViewer from './MusicViewer';

export default function MusicGenerator() {
  const [prompt, setPrompt] = useState('');
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

    //const base64Image = imageFile ? await toBase64(imageFile) : null;

    const payload: Record<string, any> = {
      model,
      prompt,
      secondsStart: seconds_start,
      secondsTotal: seconds_total,
      steps,
     /* width: modelParams[selectedModel]?.width ? width : null,
      height: modelParams[selectedModel]?.height ? height : null,
      output_format: outputFormat,
      prompt_upsampling: promptUpsampling,
      negative_prompt: modelParams[selectedModel]?.negative_prompt ? negativePrompt : null,
      aspect_ratio: modelParams[selectedModel]?.aspect_ratio ? aspectRatio : null,
      raw: modelParams[selectedModel]?.raw ? raw : undefined,*/
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
      console.log('Respuesta del servidor:', data);
      if (data.completed) {
        console.log('URL del audio:', data.sample);
        setResult(data.sample);
        break;
      }
      await new Promise((res) => setTimeout(res, 5000));
    }

    setLoading(false);
  };


  return (
    <div className="max-w-xl mx-auto space-y-4">

        <label className="block text-sm">Modelo</label>
        <input
          type="string"
          value={model}
          defaultValue="stable-audio"
          //onChange={(e) => onChange('seconds_start', Number(e.target.value))}
          className="w-full p-1 border rounded"
        />
    
      <PromptInput value={prompt} onChange={setPrompt} />

        <label className="block text-sm">Seconds Start</label>
        <input
          type="number"
          value={seconds_start}
          defaultValue={1}
          //onChange={(e) => onChange('seconds_start', Number(e.target.value))}
          className="w-full p-1 border rounded"
          min={1}
          max={30}
        />

        <label className="block text-sm">Seconds Total</label>
        <input
          type="number"
          value={seconds_total}
          defaultValue={30}
          //onChange={(e) => onChange('seconds_total', Number(e.target.value))}
          className="w-full p-1 border rounded"
          min={10}
          max={60}
        />

        <label className="block text-sm">Steps</label>
        <input
          type="number"
          value={steps}
          defaultValue={100}
          //onChange={(e) => onChange('steps', Number(e.target.value))}
          className="w-full p-1 border rounded"
          min={1}
          max={100}
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !prompt}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Generar Música'}
        </button>
      <MusicViewer result={result} />
      </div>
    
  );
}