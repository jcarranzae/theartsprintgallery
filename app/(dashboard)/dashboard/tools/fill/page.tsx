'use client';

import { useState } from 'react';
import CanvasEditor from '@/components/CanvasEditor';
import ResultViewer from '@/components/ResultViewer';
import { Loader2 } from 'lucide-react';

export default function Page() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageCanvas, setImageCanvas] = useState<HTMLCanvasElement | null>(null);
  const [maskCanvas, setMaskCanvas] = useState<HTMLCanvasElement | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [imageScale, setImageScale] = useState(1);
  const [imageOffset, setImageOffset] = useState(0);
  const [imageOffsetY, setImageOffsetY] = useState(0);

  const handleSubmit = async () => {
    if (!prompt || !image || !maskCanvas || !imageCanvas) return;
    setLoading(true);
    try {
      // Convertir la imagen y la máscara a base64
      const imageData = imageCanvas.toDataURL('image/jpeg').split(',')[1];
      const maskData = maskCanvas.toDataURL('image/jpeg').split(',')[1];

      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: imageData, 
          mask: maskData,
          prompt 
        })
      });

      if (!response.ok) {
        throw new Error('Error en el procesamiento de la imagen');
      }

      const data = await response.json();
      setResult(data.processedImage);
      setImageId(Date.now().toString());
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error procesando la imagen: ' + (error as Error).message);
    } finally {
      setLoading(false);
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
        <div className="flex flex-col gap-4">
          <label
            className="inline-block w-fit px-4 py-2 rounded cursor-pointer transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(90deg, #8C1AD9 30%, #2C2A59 80%)",
              boxShadow: "0 0 16px 3px #8C1AD9",
              color: "white",
              borderRadius: "12px"
            }}
          >
            Seleccionar imagen
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const img = new Image();
                img.onload = () => setImage(img);
                img.src = URL.createObjectURL(file);
              }}
              className="hidden"
            />
          </label>

          <input
            type="text"
            placeholder="Describe tu imagen..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="p-2 rounded w-full"
            style={{
              background: "linear-gradient(90deg, #121559 0%, #2C2A59 100%)",
              border: "2px solid #2C2A59",
              color: "white",
              boxShadow: "0 2px 12px 0 #06082644"
            }}
          />
        </div>

        {/* Sliders */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md p-4 rounded"
          style={{
            background: "linear-gradient(140deg, #1C228C 0%, #2C2A59 60%, #060826 100%)",
            border: "2px solid #2C2A59",
            boxShadow: "0 2px 12px 0 #06082644"
          }}
        >
          <div>
            <label htmlFor="scale" className="text-sm font-medium text-[#8C1AD9]">Escala:</label>
            <input
              id="scale"
              type="range"
              min={0.1}
              max={2}
              step={0.01}
              value={imageScale}
              onChange={(e) => setImageScale(Number(e.target.value))}
              className="w-full accent-[#8C1AD9]"
            />
            <div className="text-xs text-[#8C1AD9]">{Math.round(imageScale * 100)}%</div>
          </div>

          <div>
            <label htmlFor="offsetX" className="text-sm font-medium text-[#8C1AD9]">Despl. horizontal:</label>
            <input
              id="offsetX"
              type="range"
              min={-500}
              max={500}
              value={imageOffset}
              onChange={(e) => setImageOffset(Number(e.target.value))}
              className="w-full accent-[#8C1AD9]"
            />
            <div className="text-xs text-[#8C1AD9]">{imageOffset}px</div>
          </div>

          <div>
            <label htmlFor="offsetY" className="text-sm font-medium text-[#8C1AD9]">Despl. vertical:</label>
            <input
              id="offsetY"
              type="range"
              min={-500}
              max={500}
              value={imageOffsetY}
              onChange={(e) => setImageOffsetY(Number(e.target.value))}
              className="w-full accent-[#8C1AD9]"
            />
            <div className="text-xs text-[#8C1AD9]">{imageOffsetY}px</div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Canvas y Resultado */}
      <div className="flex-1 flex flex-col items-center p-6">
        {image && (
          <div
            className="rounded p-4 w-full flex flex-col items-center gap-4"
            style={{
              background: "linear-gradient(140deg, #1C228C 0%, #2C2A59 60%, #060826 100%)",
              border: "2px solid #2C2A59",
              boxShadow: "0 0 20px 2px #8C1AD9",
              maxWidth: "500px"
            }}
          >
            <div className="w-full">
              <CanvasEditor
                image={image}
                setMaskCanvas={setMaskCanvas}
                setImageCanvas={setImageCanvas}
                setImageScale={setImageScale}
                setImageOffset={setImageOffset}
                setImageOffsetY={setImageOffsetY}
                imageOffsetY={imageOffsetY}
                imageOffset={imageOffset}
                imageScale={imageScale}
              />
            </div>

            <div className="w-full mt-4">
              <button
                onClick={handleSubmit}
                disabled={loading || !image || !maskCanvas || !imageCanvas}
                className="w-full bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] text-white py-2 px-4 rounded-lg font-semibold hover:from-[#7B16C2] hover:to-[#1C228C] disabled:opacity-50 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg"
                style={{
                  boxShadow: "0 0 16px 3px #8C1AD9",
                  borderRadius: "12px",
                }}
              >
                {loading ? 'Procesando...' : 'Procesar Imagen'}
              </button>
            </div>

            <ResultViewer
              image={image}
              imageCanvas={imageCanvas}
              maskCanvas={maskCanvas}
              prompt={prompt}
              result={result}
              setResult={setResult}
              setImageId={setImageId}
              imageId={imageId}
              imageScale={imageScale}
              imageOffset={imageOffset}
              imageOffsetY={imageOffsetY}
            />
          </div>
        )}
      </div>
    </div>
  );
}
