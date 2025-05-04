'use client';

import { useState } from 'react';
import CannyForm from '@/components/ui/Canny/CannyForm';
import CannyResult from '@/components/ui/Canny/CannyResult';
import Image from 'next/image';

export default function CannyToolPage() {
  const [result, setResult] = useState<any>(null);
  const [inputImage, setInputImage] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');

  return (
    <section
      style={{
        background: 'linear-gradient(120deg, #060826 0%, #1C228C 50%, #2C2A59 100%)',
        minHeight: '100vh',
        padding: '48px 0',
      }}
    >
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl mx-auto">
        {/* Panel izquierdo - Formulario */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-xl">
            <h1
              className="text-4xl font-extrabold text-center mb-6"
              style={{
                background: 'linear-gradient(90deg, #8C1AD9 30%, #2C2A59 80%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 10px #8C1AD9',
                letterSpacing: '0.02em',
              }}
            >
              Flux1 Canny Pro
            </h1>
            <CannyForm onResult={(res, inputUrl) => { setResult(res); setInputImage(inputUrl); }} />
          </div>
        </div>
        {/* Panel derecho - Resultado o imagen de fondo */}
        <div className="flex-1 flex items-center justify-center p-6">
          {result ? (
            <CannyResult result={result} controlImageUrl={inputImage} prompt={prompt} />
          ) : (
            <div className="relative w-full h-[400px] max-w-md mx-auto">
              <Image
                src="/images/FondoImagen.png"
                alt="Fondo Imagen"
                fill
                className="rounded-lg object-contain"
                priority
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
