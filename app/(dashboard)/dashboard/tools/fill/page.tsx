// app/page.tsx
'use client';

import { useState } from 'react';
import CanvasEditor from '@/components/CanvasEditor';
import ResultViewer from '@/components/ResultViewer';

export default function Page() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageCanvas, setImageCanvas] = useState<HTMLCanvasElement | null>(null);
  const [maskCanvas, setMaskCanvas] = useState<HTMLCanvasElement | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);

  const [imageScale, setImageScale] = useState(1);
  const [imageOffset, setImageOffset] = useState(0);
  const [imageOffsetY, setImageOffsetY] = useState(0);

  return (
    <main className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Controles superiores */}
      <div className="flex flex-col gap-4">
        <label className="inline-block w-fit bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
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
          className="border border-gray-300 p-2 rounded w-full"
        />
      </div>

      {/* Canvas superpuestos */}
      {image && (
        <div className="border-2 border-dashed border-gray-400 rounded p-4">
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
      )}

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
        <div>
          <label htmlFor="scale" className="text-sm font-medium">Escala:</label>
          <input
            id="scale"
            type="range"
            min={0.1}
            max={2}
            step={0.01}
            value={imageScale}
            onChange={(e) => setImageScale(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500">{Math.round(imageScale * 100)}%</div>
        </div>

        <div>
          <label htmlFor="offsetX" className="text-sm font-medium">Despl. horizontal:</label>
          <input
            id="offsetX"
            type="range"
            min={-500}
            max={500}
            value={imageOffset}
            onChange={(e) => setImageOffset(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500">{imageOffset}px</div>
        </div>

        <div>
          <label htmlFor="offsetY" className="text-sm font-medium">Despl. vertical:</label>
          <input
            id="offsetY"
            type="range"
            min={-500}
            max={500}
            value={imageOffsetY}
            onChange={(e) => setImageOffsetY(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500">{imageOffsetY}px</div>
        </div>
      </div>

      {/* Resultado y botón de procesar */}
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
    </main>
  );
}