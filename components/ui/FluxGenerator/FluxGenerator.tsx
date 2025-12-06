'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import ModelSelector from './ModelSelector';
import ImageUploader from './ImageUploader';
import PromptInput from './PromptInput';
import AdvancedSettings from './AdvancedSettings';
import ImageViewer from './ImageViewer';

const modelParams: Record<string, { aspect_ratio?: boolean; negative_prompt?: boolean; raw?: boolean; width?: boolean; height?: boolean; steps?: boolean; guidance?: boolean; prompt_upsampling?: boolean; safety_tolerance?: boolean; output_quality?: boolean }> = {
  'flux-dev': { negative_prompt: true, width: true, height: true, steps: true, guidance: true, seed: true },
  'flux-pro': { width: true, height: true, steps: true, guidance: true, safety_tolerance: true, output_quality: true },
  'flux-pro-1.1': { negative_prompt: true, width: true, height: true, steps: true, guidance: true, safety_tolerance: true, output_quality: true, prompt_upsampling: true, aspect_ratio: true },
  'flux-pro-1.1-ultra': { aspect_ratio: true, negative_prompt: true, raw: true, safety_tolerance: true, output_quality: true },
  'flux-2-pro': { width: true, height: true, steps: true, guidance: true, safety_tolerance: true, output_quality: true },
  'flux-2-flex': { width: true, height: true, steps: true, guidance: true, prompt_upsampling: true, safety_tolerance: true, aspect_ratio: true },
};

const models = [
  { label: 'FLUX.1 [dev]', value: 'flux-dev' },
  { label: 'FLUX.1 [pro]', value: 'flux-pro' },
  { label: 'FLUX.1.1 [pro]', value: 'flux-pro-1.1' },
  { label: 'FLUX.1.1 [pro] Ultra', value: 'flux-pro-1.1-ultra' },
  { label: 'FLUX.2 [pro]', value: 'flux-2-pro' },
  { label: 'FLUX.2 [flex]', value: 'flux-2-flex' },
];

export default function FluxGenerator() {
  const [selectedModel, setSelectedModel] = useState(models[0].value);
  const [images, setImages] = useState<File[]>([]);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string[] | null>(null);
  const [failedImages, setFailedImages] = useState<{ index: number; reason: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Advanced Settings State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [width, setWidth] = useState<number | null>(1024);
  const [height, setHeight] = useState<number | null>(768);
  const [steps, setSteps] = useState<number | null>(30);
  const [guidance, setGuidance] = useState<number | null>(3);
  const [seed, setSeed] = useState<number | null>(null);
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [promptUpsampling, setPromptUpsampling] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [raw, setRaw] = useState<boolean>(false);
  const [batchSize, setBatchSize] = useState<number>(1);
  const [safetyTolerance, setSafetyTolerance] = useState<number>(2);
  const [outputQuality, setOutputQuality] = useState<number>(90);

  const handleSubmit = async () => {
    if (!prompt) return alert('El prompt es obligatorio');
    setLoading(true);
    setResult(null);
    setFailedImages([]);
    setShowAdvanced(false);

    try {
      // Convert all images to base64
      const base64Images = await Promise.all(images.map(toBase64));

      // Base payload
      const payload: Record<string, any> = {
        prompt,
        model: selectedModel,
        steps: modelParams[selectedModel]?.steps ? steps : undefined,
        guidance: modelParams[selectedModel]?.guidance ? guidance : undefined,
        seed: seed || undefined,
        width: modelParams[selectedModel]?.width ? width : undefined,
        height: modelParams[selectedModel]?.height ? height : undefined,
        output_format: outputFormat,
        prompt_upsampling: modelParams[selectedModel]?.prompt_upsampling ? promptUpsampling : undefined,
        negative_prompt: modelParams[selectedModel]?.negative_prompt ? negativePrompt : undefined,
        aspect_ratio: modelParams[selectedModel]?.aspect_ratio ? aspectRatio : undefined,
        raw: modelParams[selectedModel]?.raw ? raw : undefined,
        safety_tolerance: modelParams[selectedModel]?.safety_tolerance ? safetyTolerance : undefined,
        output_quality: modelParams[selectedModel]?.output_quality ? outputQuality : undefined,
      };

      // Add images to payload
      if (base64Images.length > 0) {
        // Primary image (for all models)
        payload.image = base64Images[0];
        payload.input_image = base64Images[0]; // Flux 2 uses input_image

        // Additional images (Flux 2 only)
        base64Images.slice(1).forEach((img, idx) => {
          payload[`input_image_${idx + 2}`] = img;
        });
      }

      // Determine number of requests (Batch Size)
      const numRequests = batchSize;

      // Function to generate a single image
      const generateSingleImage = async (index: number) => {
        let currentPayload = { ...payload };

        // If seed is set and we are generating multiple, increment seed
        if (seed !== null && numRequests > 1) {
          currentPayload.seed = seed + index;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentPayload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.details || 'Error al generar la imagen');
        }

        const { id, polling_url } = await response.json();
        if (!id) throw new Error('No ID returned from API');

        // Polling
        for (let i = 0; i < 60; i++) {
          const pollEndpoint = polling_url
            ? `/api/check-image/${id}?polling_url=${encodeURIComponent(polling_url)}`
            : `/api/check-image/${id}`;

          const poll = await fetch(pollEndpoint);

          if (poll.status === 404) {
            await new Promise((res) => setTimeout(res, 3000));
            continue;
          }

          if (!poll.ok) {
            throw new Error(`Polling error: ${poll.status}`);
          }

          const data = await poll.json();

          if (data.completed && data.sample) {
            return `data:image/jpeg;base64,${data.sample}`;
          }

          if (data.completed && data.moderated) {
            throw new Error(`Safety Filter: ${data.details}`);
          }

          if (data.completed && data.error) {
            throw new Error(data.error);
          }

          await new Promise((res) => setTimeout(res, 2000));
        }
        throw new Error('Timeout waiting for image');
      };

      // Execute requests in parallel
      console.log(`🚀 Generating ${numRequests} images...`);
      const results = await Promise.allSettled(
        Array.from({ length: numRequests }, (_, i) => generateSingleImage(i))
      );

      // Process results
      const successfulImages: string[] = [];
      const failures: { index: number; reason: string }[] = [];

      results.forEach((res, idx) => {
        if (res.status === 'fulfilled') {
          successfulImages.push(res.value);
        } else {
          failures.push({ index: idx, reason: res.reason?.message || 'Unknown error' });
        }
      });

      setResult(successfulImages);
      setFailedImages(failures);
      setLoading(false);

      if (successfulImages.length === 0 && failures.length > 0) {
        alert(`Failed to generate images.\n${failures.map(f => f.reason).join('\n')}`);
      }

    } catch (error: any) {
      setLoading(false);
      alert(`Error: ${error.message}`);
      console.error(error);
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
      case 'batchSize': setBatchSize(value); break;
      case 'safetyTolerance': setSafetyTolerance(value); break;
      case 'outputQuality': setOutputQuality(value); break;
    }
  };

  const getModelName = () => models.find(m => m.value === selectedModel)?.label || 'FLUX';

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full"
      style={{
        background: "linear-gradient(140deg, #1C228C 0%, #2C2A59 60%, #060826 100%)",
      }}
    >
      {/* Left Panel */}
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
          <ImageUploader images={images} setImages={setImages} />
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
            seed={seed}
            outputFormat={outputFormat}
            promptUpsampling={promptUpsampling}
            onChange={handleAdvancedChange}
            aspectRatio={aspectRatio}
            width={width || undefined}
            height={height || undefined}
            negativePrompt={negativePrompt}
            batchSize={batchSize}
            safetyTolerance={safetyTolerance}
            outputQuality={outputQuality}

            // Visibility flags based on model capabilities
            showAspectRatio={!!modelParams[selectedModel]?.aspect_ratio}
            showWidth={!!modelParams[selectedModel]?.width}
            showHeight={!!modelParams[selectedModel]?.height}
            showNegativePrompt={!!modelParams[selectedModel]?.negative_prompt}
            showRaw={!!modelParams[selectedModel]?.raw}
            showSteps={!!modelParams[selectedModel]?.steps}
            showGuidance={!!modelParams[selectedModel]?.guidance}
            showPromptUpsampling={!!modelParams[selectedModel]?.prompt_upsampling}
            showSafetyTolerance={!!modelParams[selectedModel]?.safety_tolerance}
            showOutputQuality={!!modelParams[selectedModel]?.output_quality}
            showBatchSize={true} // Always allow batch size (simulated)
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
              Generating {batchSize} image{batchSize > 1 ? 's' : ''}...
            </>
          ) : (
            `🚀 Generate with ${getModelName()}`
          )}
        </button>

        {loading && (
          <div className="text-center p-6 bg-zinc-900 rounded-lg border border-[#8C1AD9]/30">
            <div className="mb-4">
              <p className="text-[#8C1AD9] font-semibold text-lg">
                Generating {batchSize} Image{batchSize > 1 ? 's' : ''}
              </p>
              <p className="text-gray-300 text-sm mt-1">Model: {getModelName()}</p>
              {images.length > 0 && (
                <p className="text-cyan-400 text-sm mt-1">🖼️ Using {images.length} input image{images.length > 1 ? 's' : ''}</p>
              )}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-[#8C1AD9]" size={20} />
              <span className="text-gray-300 text-sm">Processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        {failedImages.length > 0 && (
          <div className="w-full max-w-2xl bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
            <h4 className="text-yellow-400 font-semibold">Generation Issues</h4>
            <ul className="text-xs text-yellow-200/70">
              {failedImages.map(f => (
                <li key={f.index}>Image {f.index + 1}: {f.reason}</li>
              ))}
            </ul>
          </div>
        )}
        <ImageViewer imageUrls={result} prompt={prompt} />
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