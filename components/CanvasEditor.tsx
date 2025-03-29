'use client';

import { useEffect, useRef } from 'react';

interface CanvasEditorProps {
  image: HTMLImageElement | null;
  setMaskCanvas: (canvas: HTMLCanvasElement) => void;
  setImageCanvas: (canvas: HTMLCanvasElement) => void;
  setImageScale: (scale: number) => void;
  setImageOffset: (offset: number) => void;
  setImageOffsetY: (offsetY: number) => void;
  imageOffsetY: number;
  imageScale: number;
  imageOffset: number;
}

export default function CanvasEditor({
  image,
  setMaskCanvas,
  setImageCanvas,
  setImageScale,
  setImageOffset,
  setImageOffsetY,
  imageOffsetY,
  imageScale,
  imageOffset,
}: CanvasEditorProps) {
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  const drawImage = () => {
    if (!image || !imageCanvasRef.current) return;

    const canvas = imageCanvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const scaledWidth = image.width * imageScale;
    const scaledHeight = image.height * imageScale;
    const offsetX = (canvas.width - scaledWidth) / 2 + imageOffset;
    const offsetY = (canvas.height - scaledHeight) / 2 + imageOffsetY;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    draw(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    draw(e);
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const brushSize = 20;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  useEffect(() => {
    if (!image) return;

    const imgCanvas = imageCanvasRef.current!;
    const drawCanvas = drawCanvasRef.current!;

    const imageChanged =
      imgCanvas.width !== image.width || imgCanvas.height !== image.height;

    if (imageChanged) {
      imgCanvas.width = image.width;
      imgCanvas.height = image.height;
      drawCanvas.width = image.width;
      drawCanvas.height = image.height;
      // No rellenamos drawCanvas: se deja transparente
    }

    setMaskCanvas(drawCanvas);
    setImageCanvas(imgCanvas);

    drawImage();
  }, [image]);

  useEffect(() => {
    drawImage();
  }, [imageScale, imageOffset, imageOffsetY]);

  return (
    <div className="w-full flex justify-center">
      <div className="relative">
        <canvas
          ref={imageCanvasRef}
          className="absolute top-0 left-0 z-0 block border"
        />
        <canvas
          ref={drawCanvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="absolute top-0 left-0 z-10 block border cursor-crosshair"
        />
      </div>
    </div>
  );
}
