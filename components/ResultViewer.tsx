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

  const handleProcess = async () => {
    console.log('Procesar Imagen: iniciado');
    if (!image || !imageCanvas || !maskCanvas) {
      console.warn('Faltan image o imageCanvas o maskCanvas');
      return;
    }

    try {
      setIsProcessing(true);
      setResult(null);

      const imageData = imageCanvas.toDataURL('image/jpeg').split(',')[1];
      console.log('imageData length:', imageData.length);

      // === Generar máscara tipo outpainting ===
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imageCanvas.width;
      tempCanvas.height = imageCanvas.height;
      const ctx = tempCanvas.getContext('2d')!;

      // Fondo blanco (editable)
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Imagen original (zona protegida) en negro
      const scaledWidth = image.width * imageScale;
      const scaledHeight = image.height * imageScale;
      const offsetX = (tempCanvas.width - scaledWidth) / 2 + imageOffset;
      const offsetY = (tempCanvas.height - scaledHeight) / 2 + imageOffsetY;

      ctx.fillStyle = 'black';
      ctx.fillRect(offsetX, offsetY, scaledWidth, scaledHeight);

      // Encima, lo que el usuario ha pintado en blanco
      ctx.drawImage(maskCanvas, 0, 0);

      const maskDataUrl = tempCanvas.toDataURL('image/jpeg');
      setMaskPreview(maskDataUrl);
      const maskData = maskDataUrl.split(',')[1];
      console.log('maskData length:', maskData.length);

      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData, mask: maskData, prompt }),
      });

      if (!response.ok) {
        console.error('Error en la respuesta del backend', await response.text());
        throw new Error('Error en la generación de imagen');
      }

      const result = await response.json();
      console.log('Respuesta del backend:', result);

      if (!result.id) throw new Error('No se recibió ID de imagen');
      setImageId(result.id);

      let attempts = 0;
      let pollingResult: any = null;

      while (attempts < 10) {
        const poll = await fetch(`/api/check-image/${result.id}`);
        const data = await poll.json();

        console.log(`Polling intento ${attempts + 1}:`, data);

        if (data.completed && data.sample) {
          pollingResult = data;
          break;
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
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={handleProcess}
        disabled={isProcessing || !image || !maskCanvas || !imageCanvas}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isProcessing ? 'Procesando...' : 'Procesar Imagen'}
      </button>

      {maskPreview && (
        <div className="mt-4 border rounded p-2 bg-white inline-block shadow-md">
          <p className="text-sm mb-1 font-medium text-gray-700">Previsualización de máscara</p>
          <img src={maskPreview} alt="Máscara generada" className="w-64 h-auto rounded" />
        </div>
      )}

      {result && (
        <div className="mt-6">
          <p className="text-sm mb-2 font-semibold">Resultado:</p>
          <img src={result} alt="Resultado generado" className="rounded shadow-md max-w-full h-auto" />
        </div>
      )}
    </div>
  );
}
