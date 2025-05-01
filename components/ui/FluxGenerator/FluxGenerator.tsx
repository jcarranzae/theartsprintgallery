'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import ModelSelector from './ModelSelector';
import ImageUploader from './ImageUploader';
import PromptInput from './PromptInput';
import AdvancedSettings from './AdvancedSettings';
import ImageViewer from './ImageViewer';

const modelParams: Record<string, { aspect_ratio?: boolean; negative_prompt?: boolean; raw?: boolean; width?: boolean; height?: boolean }> = {
  'flux-dev': { negative_prompt: true, width: true, height: true },
  'flux-pro': { width: true, height: true },
  'flux-pro-1.1': { negative_prompt: true, width: true, height: true },
  'flux-pro-1.1-ultra': { aspect_ratio: true, negative_prompt: true, raw: true },
};

const models = [
  { label: 'FLUX.1 [dev]', value: 'flux-dev' },
  { label: 'FLUX.1 [pro]', value: 'flux-pro' },
  { label: 'FLUX.1.1 [pro]', value: 'flux-pro-1.1' },
  { label: 'FLUX.1.1 [pro] Ultra', value: 'flux-pro-1.1-ultra' },
];

export default function FluxGenerator() {
  const [selectedModel, setSelectedModel] = useState(models[0].value);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Advanced
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [width, setWidth] = useState<number | null>(1024);
  const [height, setHeight] = useState<number | null>(768);
  const [steps, setSteps] = useState<number | null>(30);
  const [guidance, setGuidance] = useState<number | null>(3);
  const [seed, setSeed] = useState<number | null>(1);
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [promptUpsampling, setPromptUpsampling] = useState<boolean | null>(false);
  const [aspectRatio, setAspectRatio] = useState<string | null>('1:1');
  const [negativePrompt, setNegativePrompt] = useState<string | null>('');
  const [raw, setRaw] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!prompt) return alert('El prompt es obligatorio');
    setLoading(true);
    setResult(null);

    const base64Image = imageFile ? await toBase64(imageFile) : null;

    const payload: Record<string, any> = {
      image: base64Image,
      prompt,
      model: selectedModel,
      steps,
      guidance,
      seed,
      width: modelParams[selectedModel]?.width ? width : null,
      height: modelParams[selectedModel]?.height ? height : null,
      output_format: outputFormat,
      prompt_upsampling: promptUpsampling,
      negative_prompt: modelParams[selectedModel]?.negative_prompt ? negativePrompt : null,
      aspect_ratio: modelParams[selectedModel]?.aspect_ratio ? aspectRatio : null,
      raw: modelParams[selectedModel]?.raw ? raw : undefined,
    };

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const { id } = await response.json();
    if (!id) {
      setLoading(false);
      return alert('Error al generar la imagen, por favor intenta de nuevo.');
    }

    for (let i = 0; i < 10; i++) {
      const poll = await fetch(`/api/check-image/${id}`);
      const data = await poll.json();
      if (data.completed && data.sample) {
        setResult(`data:image/jpeg;base64,${data.sample}`);
        break;
      }
      await new Promise((res) => setTimeout(res, 2000));
    }

    setLoading(false);
  };

  const handleAdvancedChange = (field: string, value: any) => {
    switch (field) {
      case 'steps': setSteps(value); break;
      case 'guidance': setGuidance(value); break;
      case 'seed': setSeed(value); break;
      case 'outputFormat': setOutputFormat(value); break;
      case 'promptUpsampling': setPromptUpsampling(value); break;
      case 'aspectRatio': setAspectRatio(value); break;
      case 'width': setWidth(value); break;
      case 'height': setHeight(value); break;
      case 'negativePrompt': setNegativePrompt(value); break;
      case 'raw': setRaw(value); break;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full" 
      style={{
        background: "linear-gradient(140deg, #1C228C 0%, #2C2A59 60%, #060826 100%)",
      }}
    >
      {/* Panel izquierdo - Controles */}
      <div className="flex-1 space-y-4 max-w-xl mx-auto lg:mx-0 p-6">
        <div className="text-[#8C1AD9] font-semibold text-lg">
          <ModelSelector value={selectedModel} onChange={setSelectedModel} />
        </div>
        <div className="text-[#8C1AD9] font-semibold text-lg">
          <ImageUploader imageFile={imageFile} setImageFile={setImageFile} />
        </div>
        <div className="text-[#8C1AD9] font-semibold text-lg">
          <PromptInput prompt={prompt} onChangePrompt={setPrompt} negativePrompt={negativePrompt} onChangeNegativePrompt={setNegativePrompt} />
        </div>

        <div className="text-[#8C1AD9] font-semibold text-lg">
          <AdvancedSettings
            show={showAdvanced}
            onToggle={() => setShowAdvanced(!showAdvanced)}
            steps={steps || 0}
            guidance={guidance || 0}
            seed={seed || 0}
            outputFormat={outputFormat}
            promptUpsampling={!!promptUpsampling}
            onChange={handleAdvancedChange}
            showAspectRatio={!!modelParams[selectedModel]?.aspect_ratio}
            aspectRatio={aspectRatio || '1:1'}
            showWidth={!!modelParams[selectedModel]?.width}
            showHeight={!!modelParams[selectedModel]?.aspect_ratio}
            showNegativePrompt={!!modelParams[selectedModel]?.negative_prompt}
            negativePrompt={negativePrompt || ''}
            showRaw={!!modelParams[selectedModel]?.raw}
            raw={raw}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !prompt}
          className="w-full bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] text-white py-2 px-4 rounded-lg font-semibold hover:from-[#7B16C2] hover:to-[#1C228C] disabled:opacity-50 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg"
          style={{
            boxShadow: "0 0 16px 3px #8C1AD9",
            borderRadius: "12px",
          }}
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Generar Imagen'}
        </button>
      </div>

      {/* Panel derecho - Vista previa */}
      <div className="flex-1 flex items-center justify-center p-6">
        <ImageViewer imageUrl={result} prompt={prompt} />
      </div>
    </div>
  );
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}