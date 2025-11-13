'use client';

import { useEffect, useState } from 'react';

interface ResultViewerProps {
  image: HTMLImageElement | null;
  imageCanvas: HTMLCanvasElement | null;
  maskCanvas: HTMLCanvasElement | null;
  prompt: string;
  result: string | null;
  setResult: (val: string | null) => void;
  setImageId: (id: string | null) => void;
  imageId: string | null;
  imageScale: number;
  imageOffset: number;
  imageOffsetY: number;
}

export default function ResultViewer({
  image,
  imageCanvas,
  maskCanvas,
  prompt,
  result,
  setResult,
  setImageId,
  imageId,
  imageScale,
  imageOffset,
  imageOffsetY,
}: ResultViewerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [maskPreview, setMaskPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const handleProcess = async () => {
    console.log('Procesar Imagen: iniciado');
    if (!image || !imageCanvas || !maskCanvas) {
      console.warn('Faltan image o imageCanvas o maskCanvas');
      return;
    }

    try {
      setIsProcessing(true);
      setResult(null);
      setProgress(0);

      // Generar previsualización de la máscara
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imageCanvas.width;
      tempCanvas.height = imageCanvas.height;
      const ctx = tempCanvas.getContext('2d')!;

      // Fondo blanco
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Dibujar la imagen original en negro con la escala y desplazamiento correctos
      ctx.fillStyle = 'black';
      const scaledWidth = image!.width * imageScale;
      const scaledHeight = image!.height * imageScale;
      ctx.fillRect(
        imageOffset,
        imageOffsetY,
        scaledWidth,
        scaledHeight
      );

      const maskDataUrl = tempCanvas.toDataURL('image/jpeg');
      setMaskPreview(maskDataUrl);

      const imageData = imageCanvas.toDataURL('image/jpeg').split(',')[1];
      const maskData = maskDataUrl.split(',')[1];

      console.log('Enviando datos al servidor:', {
        imageLength: imageData.length,
        maskLength: maskData.length,
        prompt
      });

      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: imageData, 
          mask: maskData, 
          prompt 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', errorText);
        throw new Error(`Error en la generación de imagen: ${errorText}`);
      }

      const result = await response.json();
      console.log('Respuesta del backend:', result);

      if (!result.id) throw new Error('No se recibió ID de imagen');
      setImageId(result.id);

      let attempts = 0;
      let pollingResult: any = null;

      while (attempts < 30) {
        // Usar polling_url si está disponible para evitar errores 404
        const pollEndpoint = result.polling_url
          ? `/api/check-image/${result.id}?polling_url=${encodeURIComponent(result.polling_url)}`
          : `/api/check-image/${result.id}`;

        const poll = await fetch(pollEndpoint);
        const data = await poll.json();

        console.log(`Polling intento ${attempts + 1}:`, data);

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.completed && data.sample) {
          pollingResult = data;
          break;
        }

        if (data.progress) {
          setProgress(data.progress);
        }

        await new Promise((res) => setTimeout(res, 2000));
        attempts++;
      }

      if (!pollingResult || !pollingResult.sample) {
        throw new Error('La imagen aún no está lista o falló la generación.');
      }

      setResult(`data:image/jpeg;base64,${pollingResult.sample}`);
    } catch (err) {
      console.error('Error en handleProcess:', err);
      alert('Error procesando la imagen: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {maskPreview && (
        <div className="w-full border rounded p-2 bg-white inline-block shadow-md">
          <p className="text-sm mb-1 font-medium text-gray-700">Previsualización de máscara</p>
          <img src={maskPreview} alt="Máscara generada" className="w-64 h-auto rounded" />
        </div>
      )}

      <button
        onClick={handleProcess}
        disabled={isProcessing || !prompt}
        className={`
          w-full max-w-[500px] px-6 py-3 rounded-lg text-white font-medium
          transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          ${isProcessing ? 'bg-gray-500' : 'bg-gradient-to-r from-[#8C1AD9] to-[#D91A8C] hover:shadow-lg hover:shadow-[#8C1AD9]/20'}
        `}
      >
        {isProcessing ? 'Procesando...' : 'Procesar Imagen'}
      </button>

      {isProcessing && (
        <div className="w-full max-w-[500px]">
          <p className="text-sm mb-2 font-semibold text-white">Procesando imagen... {progress}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-[#8C1AD9] h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {result && (
        <div className="w-full">
          <p className="text-sm mb-2 font-semibold">Resultado:</p>
          <img src={result} alt="Resultado generado" className="rounded shadow-md max-w-full h-auto" />
        </div>
      )}
    </div>
  );
}
