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
    setShowAdvanced(false);

    try {
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

      // Timeout de 55 segundos para el fetch inicial
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 55000);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        setLoading(false);
        return alert(`Error: ${errorData.error || 'Error al generar la imagen'}\n${errorData.details || ''}`);
      }

      const { id } = await response.json();
      if (!id) {
        setLoading(false);
        return alert('Error al generar la imagen, por favor intenta de nuevo.');
      }

      // Polling para obtener el resultado
      for (let i = 0; i < 60; i++) {
        console.log(`📊 Polling intento ${i + 1}/60 para imagen ${id}`);
        const poll = await fetch(`/api/check-image/${id}`);

        if (!poll.ok) {
          console.error('❌ Error en polling:', poll.status, poll.statusText);
          const errorData = await poll.json().catch(() => ({}));
          console.error('❌ Detalles del error:', errorData);
          await new Promise((res) => setTimeout(res, 2000));
          continue;
        }

        const data = await poll.json();
        console.log('📦 Respuesta del polling:', {
          completed: data.completed,
          status: data.status,
          hasSample: !!data.sample,
          sampleLength: data.sample?.length
        });

        if (data.completed && data.sample) {
          console.log('✅ Imagen completada, estableciendo resultado');
          setResult(`data:image/jpeg;base64,${data.sample}`);
          break;
        }

        if (data.error) {
          console.error('❌ Error en generación:', data.error, data.details);
          alert(`Error: ${data.error}\n${data.details || ''}`);
          break;
        }

        await new Promise((res) => setTimeout(res, 2000));
      }

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      if (error.name === 'AbortError') {
        alert('La solicitud tardó demasiado tiempo. Por favor, verifica tu conexión a internet e intenta de nuevo.');
      } else {
        alert(`Error: ${error.message || 'Error de conexión. Por favor, intenta de nuevo.'}`);
      }
      console.error('Error en handleSubmit:', error);
    }
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

  // Obtener el nombre del modelo seleccionado
  const getModelName = () => {
    const model = models.find(m => m.value === selectedModel);
    return model?.label || 'FLUX';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full"
      style={{
        background: "linear-gradient(140deg, #1C228C 0%, #2C2A59 60%, #060826 100%)",
      }}
    >
      {/* Panel izquierdo - Controles */}
      <div className="flex-1 space-y-4 max-w-xl mx-auto lg:mx-0 p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            ✨ <span className="text-[#8C1AD9]">FLUX</span> Generator
          </h1>
          <p className="text-gray-300">
            Professional AI image generation powered by Black Forest Labs
          </p>
        </div>

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
          className="w-full bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] text-white py-3 px-4 rounded-lg font-semibold hover:from-[#7B16C2] hover:to-[#1C228C] disabled:opacity-50 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg"
          style={{
            boxShadow: "0 0 16px 3px #8C1AD9",
            borderRadius: "12px",
          }}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Generating with {getModelName()}...
            </>
          ) : (
            `🚀 Generate with ${getModelName()}`
          )}
        </button>

        {loading && (
          <div className="text-center p-6 bg-zinc-900 rounded-lg border border-[#8C1AD9]/30">
            <div className="mb-4">
              <p className="text-[#8C1AD9] font-semibold text-lg">Generating Image</p>
              <p className="text-gray-300 text-sm mt-1">Model: {getModelName()}</p>
              {imageFile && (
                <p className="text-cyan-400 text-sm mt-1">🖼️ Using input image</p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-[#8C1AD9]" size={20} />
              <span className="text-gray-300 text-sm">
                Processing your request...
              </span>
            </div>
          </div>
        )}
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