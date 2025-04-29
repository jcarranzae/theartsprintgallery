'use client';

import { useRef, useState } from 'react';

interface CannyFormProps {
  onResult: (result: any, inputImageUrl: string) => void;
}

export default function CannyForm({ onResult }: CannyFormProps) {
  const [prompt, setPrompt] = useState('');
  const [controlFile, setControlFile] = useState<File | null>(null);
  const [controlPreview, setControlPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Opciones avanzadas
  const [cannyLow, setCannyLow] = useState(50);
  const [cannyHigh, setCannyHigh] = useState(200);
  const [steps, setSteps] = useState(50);
  const [guidance, setGuidance] = useState(30);

  // Otros
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [promptUpsampling, setPromptUpsampling] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleControlImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setControlFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setControlPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setControlPreview(null);
    }
  };

  async function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const b64 = (reader.result as string).split(',')[1];
        resolve(b64);
      };
      reader.onerror = reject;
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || !controlFile) {
      alert('Introduce un prompt y selecciona una imagen de control');
      return;
    }
    setLoading(true);

    const controlImageB64 = await toBase64(controlFile);

    // Construye el payload según la API
    const payload = {
      prompt,
      control_image: controlImageB64,
      preprocessed_image: null,
      canny_low_threshold: cannyLow,
      canny_high_threshold: cannyHigh,
      prompt_upsampling: promptUpsampling,
      seed: null,
      steps,
      output_format: outputFormat,
      guidance,
      safety_tolerance: 2,

    };
    // Solo incluye webhook_url si tiene valor
  //if (webhook_url) payload.webhook_url = webhook_url;
  //if (webhook_secret) payload.webhook_secret = webhook_secret;

    const response = await fetch('/api/canny', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    setLoading(false);

    if (result.id) {
      // Devuelve también la URL local para la imagen de control para guardar metadata
      onResult(result, controlPreview!);
    } else {
      alert('Error generando imagen');
    }
  };

  return (
    <form
      className="bg-black p-6 rounded-xl shadow-lg max-w-xl mx-auto flex flex-col gap-6 border border-pink-500"
      onSubmit={handleSubmit}
    >
      <label className="text-lg font-bold text-pink-400">Prompt</label>
      <textarea
        className="bg-black border-2 border-blue-500 text-green-400 focus:ring-pink-400 rounded-lg p-2"
        rows={3}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        required
      />

      <label className="text-lg font-bold text-blue-400 mt-2">Imagen de control</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleControlImageChange}
        className="file:bg-pink-400 file:text-black file:rounded file:px-3 file:py-1 text-green-400"
        required
      />
      {controlPreview && (
        <img src={controlPreview} alt="Control preview" className="w-48 h-auto mt-2 rounded border-2 border-green-400" />
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-blue-300">Canny Low Threshold</label>
          <input type="range" min={0} max={500} value={cannyLow}
            onChange={e => setCannyLow(Number(e.target.value))}
            className="w-full accent-blue-400"
          />
          <span className="text-green-400">{cannyLow}</span>
        </div>
        <div>
          <label className="block text-blue-300">Canny High Threshold</label>
          <input type="range" min={0} max={500} value={cannyHigh}
            onChange={e => setCannyHigh(Number(e.target.value))}
            className="w-full accent-pink-400"
          />
          <span className="text-pink-400">{cannyHigh}</span>
        </div>
        <div>
          <label className="block text-green-300">Steps</label>
          <input type="range" min={15} max={50} value={steps}
            onChange={e => setSteps(Number(e.target.value))}
            className="w-full accent-green-400"
          />
          <span className="text-green-400">{steps}</span>
        </div>
        <div>
          <label className="block text-green-300">Guidance</label>
          <input type="range" min={1} max={100} value={guidance}
            onChange={e => setGuidance(Number(e.target.value))}
            className="w-full accent-blue-400"
          />
          <span className="text-blue-400">{guidance}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-2">
        <label className="text-blue-400">Output</label>
        <select
          className="bg-black border-2 border-green-500 text-pink-400 rounded-lg px-2 py-1"
          value={outputFormat}
          onChange={e => setOutputFormat(e.target.value as 'jpeg' | 'png')}
        >
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
        </select>

        <label className="text-pink-400 ml-6">
          <input
            type="checkbox"
            checked={promptUpsampling}
            onChange={e => setPromptUpsampling(e.target.checked)}
            className="accent-pink-400 mr-1"
          />
          Prompt Upsampling
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-gradient-to-r from-pink-500 to-blue-500 text-black py-2 px-6 mt-4 rounded-lg font-bold hover:from-pink-400 hover:to-blue-400 shadow-xl"
      >
        {loading ? "Generando..." : "Generar Imagen"}
      </button>
    </form>

    
  );
}
