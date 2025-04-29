'use client';

import { useState } from 'react';
import CannyForm from '@/components/ui/Canny/CannyForm';
import CannyResult from '@/components/ui/Canny/CannyResult';

export default function CannyToolPage() {
  const [result, setResult] = useState<any>(null);
  const [inputImage, setInputImage] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-12">
      <h1 className="text-3xl font-bold mb-6 text-pink-500 neon-shadow">Flux1 Canny Pro</h1>
      <CannyForm onResult={(res, inputUrl) => { setResult(res); setInputImage(inputUrl); }} />
      {result && <CannyResult result={result} controlImageUrl={inputImage} prompt={prompt} />}
    </div>
  );
}
