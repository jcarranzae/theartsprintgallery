import React, { useState, useRef, useEffect } from 'react';

interface ImageDiffProps {
  originalImage: string;
  scaledImage: string;
}

export default function ImageDiff({ originalImage, scaledImage }: ImageDiffProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setPosition(Math.min(Math.max(percentage, 0), 100));
  };

  return (
    <div className="space-y-4 w-full">
      <div 
        ref={containerRef}
        className="relative w-full h-[500px] overflow-hidden rounded-lg shadow-lg cursor-col-resize"
        onMouseMove={handleMouseMove}
      >
        {/* Imagen Original (Derecha) */}
        <div 
          className="absolute top-0 left-0 w-full h-full"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img
            src={originalImage}
            alt="Imagen original"
            className="w-full h-full object-contain"
          />
          <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded">
            Original
          </div>
        </div>

        {/* Imagen Escalada (Izquierda) */}
        <div className="absolute top-0 left-0 w-full h-full">
          <img
            src={scaledImage}
            alt="Imagen escalada"
            className="w-full h-full object-contain"
          />
          <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded">
            Escalada
          </div>
        </div>

        {/* Control deslizante */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-4 text-sm text-gray-600">
        <a
          href={originalImage}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Ver imagen original
        </a>
        <a
          href={scaledImage}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Ver imagen escalada
        </a>
      </div>
    </div>
  );
} 