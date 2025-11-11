'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import KontextModelSelector from './KontextModelSelector';
import KontextImageUploader from './KontextImageUploader';
import KontextPromptInput from './KontextPromptInput';
import KontextAdvancedSettings from './KontextAdvancedSettings';
import KontextImageViewer from './KontextImageViewer';

const models = [
  { label: 'FLUX Kontext Pro', value: 'kontext-pro', description: 'High-quality contextual image generation with optimized speed' },
  { label: 'FLUX Kontext Max', value: 'kontext-max', description: 'Maximum quality and context understanding for complex scenes' },
];

const aspectRatios = [
  { label: '16:9 (Landscape)', value: '16:9' },
  { label: '9:16 (Portrait)', value: '9:16' },
  { label: '1:1 (Square)', value: '1:1' },
  { label: '4:3 (Standard)', value: '4:3' },
  { label: '3:2 (Photo)', value: '3:2' },
  { label: '21:9 (Ultra Wide)', value: '21:9' },
  { label: '9:21 (Ultra Tall)', value: '9:21' },
];

export default function FluxKontextGenerator() {
  const [selectedModel, setSelectedModel] = useState(models[0].value);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [usingProxy, setUsingProxy] = useState<boolean>(false);

  // Advanced settings
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [seed, setSeed] = useState<number>(42);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [outputFormat, setOutputFormat] = useState<'jpg' | 'png'>('png');
  const [promptUpsampling, setPromptUpsampling] = useState<boolean>(false);
  const [safetyTolerance, setSafetyTolerance] = useState<number>(2);

  // Función para probar acceso a imagen
  const testImageAccess = (url: string): Promise<{ success: boolean, error?: string }> => {
    return new Promise((resolve) => {
      const img = new Image();

      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'Timeout' });
      }, 3000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve({ success: true });
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve({ success: false, error: 'CORS/Load error' });
      };

      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  };

  const handleSubmit = async () => {
    if (!prompt) return alert('Please enter a prompt');
    setLoading(true);
    setResult(null);
    setTaskId(null);
    setGenerationStatus('Initializing...');
    setGenerationProgress(0);
    setUsingProxy(false);
    setShowAdvanced(false);

    // Convertir imagen a base64 si existe
    let base64Image = null;
    if (imageFile) {
      setGenerationStatus('Processing context image...');
      base64Image = await toBase64(imageFile);
    } else if (selectedImageUrl) {
      setGenerationStatus('Processing selected image...');
      // Si se seleccionó una imagen de la galería, convertirla a base64
      try {
        const response = await fetch(selectedImageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'selected-image.jpg', { type: blob.type });
        base64Image = await toBase64(file);
      } catch (error) {
        console.error('Error converting selected image:', error);
        alert('Error processing selected image. Please try uploading a new image.');
        setLoading(false);
        return;
      }
    }

    try {
      // Paso 1: Generar imagen
      setGenerationStatus('Creating generation task...');

      const endpoint = selectedModel === 'kontext-pro'
        ? '/api/generate-kontext-pro'
        : '/api/generate-kontext-max';

      const payload = {
        prompt,
        input_image: base64Image, // ← CLAVE: Incluir imagen de contexto
        seed,
        aspect_ratio: aspectRatio,
        output_format: outputFormat,
        prompt_upsampling: promptUpsampling,
        safety_tolerance: safetyTolerance,
        webhook_url: null,
        webhook_secret: null
      };

      console.log('🖼️ Payload includes context image:', !!base64Image);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        setLoading(false);
        setGenerationStatus(`Error: ${data.error}`);
        return alert(`Error: ${data.error}\nDetails: ${data.details || 'Unknown error'}`);
      }

      const id = data.data.id;
      const pollingUrl = data.data.polling_url; // ← IMPORTANTE: Usar polling_url de la respuesta
      setTaskId(id);
      setGenerationStatus('Generation started...');

      console.log('🎯 Task ID:', id);
      console.log('📡 Polling URL:', pollingUrl);

      // Paso 2: Polling para obtener resultado
      for (let i = 0; i < 60; i++) {
        await new Promise((res) => setTimeout(res, 3000)); // 3 segundos entre checks

        const pollResponse = await fetch(`/api/check-kontext/${id}?polling_url=${encodeURIComponent(pollingUrl || '')}`);

        if (!pollResponse.ok) {
          console.error(`❌ Polling error: ${pollResponse.status} ${pollResponse.statusText}`);
          setGenerationStatus(`Polling error: ${pollResponse.status}`);
          alert(`Error checking generation status: ${pollResponse.statusText}`);
          break;
        }

        const pollData = await pollResponse.json();
        console.log(`[Poll ${i+1}/60] Status: ${pollData.status}, Completed: ${pollData.completed}`);

        if (pollData.success) {
          // Actualizar estado y progreso
          setGenerationStatus(pollData.status);
          setGenerationProgress(pollData.progress * 100);

          console.log('📊 Poll data:', {
            completed: pollData.completed,
            status: pollData.status,
            hasImageData: !!pollData.imageData
          });

          // Manejar estados específicos de BFL
          if (pollData.completed && pollData.status === 'Ready') {
            console.log('🎉 Generation completed!');

            if (pollData.imageData) {
              console.log('🖼️ Image data received:', pollData.imageData.substring(0, 100) + '...');
              setGenerationStatus('Processing image...');

              // Probar acceso directo primero
              console.log('🔍 Testing direct image access...');
              const directTest = await testImageAccess(pollData.imageData);

              if (directTest.success) {
                console.log('✅ Direct image access works');
                setResult(pollData.imageData);
                setGenerationStatus('Completed!');
                console.log('✅ Image set to result state');
              } else {
                console.log('❌ Direct access failed, using proxy');
                console.log('❌ Error:', directTest.error);
                setUsingProxy(true);
                setGenerationStatus('Using proxy for image...');

                // Usar proxy
                const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(pollData.imageData)}`;
                console.log('🔄 Using proxy URL:', proxyUrl);
                setResult(proxyUrl);
                setGenerationStatus('Completed via proxy!');
                console.log('✅ Proxy URL set to result state');
              }

              setGenerationProgress(100);
            } else {
              console.error('❌ No image data in completed response');
              throw new Error('No image data in completed response');
            }
            break;
          } else if (pollData.moderated) {
            setGenerationStatus(`Moderated: ${pollData.status}`);
            alert(`Content moderated: ${pollData.status}. Please try with different content.`);
            break;
          } else if (pollData.notFound) {
            setGenerationStatus('Task not found');
            alert('Task not found. Please try generating again.');
            break;
          }
          // Si está pending, continuar polling
        }

        if (i === 59) {
          setGenerationStatus('Timeout');
          alert('Generation timeout. Please try again.');
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      alert('Error during generation. Please try again.');
    }

    setLoading(false);
    if (!result) {
      setGenerationStatus('');
      setGenerationProgress(0);
      setTaskId(null);
    }
  };

  const handleAdvancedChange = (field: string, value: any) => {
    switch (field) {
      case 'seed': setSeed(value); break;
      case 'aspectRatio': setAspectRatio(value); break;
      case 'outputFormat': setOutputFormat(value); break;
      case 'promptUpsampling': setPromptUpsampling(value); break;
      case 'safetyTolerance': setSafetyTolerance(value); break;
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
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            🎯 <span className="text-[#8C1AD9]">Flux Kontext</span> Generator
          </h1>
          <p className="text-gray-300">
            Advanced contextual image generation with Black Forest Labs
          </p>
        </div>

        <div className="text-[#8C1AD9] font-semibold text-lg">
          <KontextModelSelector
            models={models}
            value={selectedModel}
            onChange={setSelectedModel}
          />
        </div>

        <div className="text-[#8C1AD9] font-semibold text-lg">
          <KontextImageUploader
            imageFile={imageFile}
            setImageFile={setImageFile}
            selectedImageUrl={selectedImageUrl}
            setSelectedImageUrl={setSelectedImageUrl}
          />
        </div>

        <div className="text-[#8C1AD9] font-semibold text-lg">
          <KontextPromptInput
            prompt={prompt}
            onChangePrompt={setPrompt}
          />
        </div>

        <div className="text-[#8C1AD9] font-semibold text-lg">
          <KontextAdvancedSettings
            show={showAdvanced}
            onToggle={() => setShowAdvanced(!showAdvanced)}
            seed={seed}
            aspectRatio={aspectRatio}
            aspectRatios={aspectRatios}
            outputFormat={outputFormat}
            promptUpsampling={promptUpsampling}
            safetyTolerance={safetyTolerance}
            onChange={handleAdvancedChange}
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
              Generating with {selectedModel === 'kontext-pro' ? 'Kontext Pro' : 'Kontext Max'}...
            </>
          ) : (
            `🚀 Generate with ${selectedModel === 'kontext-pro' ? 'Kontext Pro' : 'Kontext Max'}`
          )}
        </button>

        {(taskId && loading) && (
          <div className="text-center p-6 bg-zinc-900 rounded-lg border border-[#8C1AD9]/30">
            <div className="mb-4">
              <p className="text-[#8C1AD9] font-semibold text-lg">Task ID: {taskId}</p>
              <p className="text-gray-300 text-sm mt-1">Status: {generationStatus}</p>
              {(imageFile || selectedImageUrl) && (
                <p className="text-cyan-400 text-sm mt-1">🖼️ Using context image</p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-800 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
            <p className="text-gray-400 text-sm">{Math.round(generationProgress)}% complete</p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-[#8C1AD9]" size={20} />
              <span className="text-gray-300 text-sm">
                Generating with {selectedModel === 'kontext-pro' ? 'Kontext Pro' : 'Kontext Max'}...
              </span>
            </div>

            {usingProxy && (
              <div className="mt-2 text-yellow-400 text-sm">
                🔄 Using proxy for image delivery
              </div>
            )}
          </div>
        )}
      </div>

      {/* Panel derecho - Vista previa */}
      <div className="flex-1 flex items-center justify-center p-6">
        <KontextImageViewer
          imageUrl={result}
          prompt={prompt}
          model={selectedModel}
          usingProxy={usingProxy}
          taskId={taskId}
        />
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