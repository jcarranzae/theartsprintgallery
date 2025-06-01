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

  const getFittedDimensions = (img: HTMLImageElement) => {
    const maxWidth = 500;
    if (img.width > maxWidth) {
      const scale = maxWidth / img.width;
      return {
        width: maxWidth,
        height: img.height * scale,
        scale,
      };
    }
    return {
      width: img.width,
      height: img.height,
      scale: 1,
    };
  };

  const drawImage = () => {
    if (!image || !imageCanvasRef.current) return;

    const { width, height } = getFittedDimensions(image);
    const canvas = imageCanvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const scaledWidth = width * imageScale;
    const scaledHeight = height * imageScale;
    const offsetX = (canvas.width - scaledWidth) / 2 + imageOffset;
    const offsetY = (canvas.height - scaledHeight) / 2 + imageOffsetY;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, image.width, image.height, offsetX, offsetY, scaledWidth, scaledHeight);
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
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  useEffect(() => {
    if (!image) return;

    const imgCanvas = imageCanvasRef.current!;
    const drawCanvas = drawCanvasRef.current!;

    const { width, height } = getFittedDimensions(image);

    const imageChanged =
      imgCanvas.width !== width || imgCanvas.height !== height;

    if (imageChanged) {
      imgCanvas.width = width;
      imgCanvas.height = height;
      drawCanvas.width = width;
      drawCanvas.height = height;
      
      const ctx = drawCanvas.getContext('2d')!;
      ctx.clearRect(0, 0, width, height);
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
      <div className="relative" style={{ maxWidth: 500, width: "100%" }}>
        <canvas
          ref={imageCanvasRef}
          className="w-full h-auto block border"
          style={{ maxWidth: 500, width: "100%", height: "auto", display: "block" }}
        />
        <canvas
          ref={drawCanvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="absolute top-0 left-0 w-full h-full block border cursor-crosshair"
          style={{ 
            maxWidth: 500, 
            width: "100%", 
            height: "100%", 
            display: "block",
            backgroundColor: "rgba(0, 0, 0, 0.3)"
          }}
        />
      </div>
    </div>
  );
}
