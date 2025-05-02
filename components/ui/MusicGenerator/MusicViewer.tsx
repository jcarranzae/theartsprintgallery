'use client';

import { useState, useEffect } from 'react';

interface MusicViewerProps {
  result: string | null;
}

export default function MusicViewer({ result }: MusicViewerProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    console.log('MusicViewer recibió resultado:', result);
  }, [result]);

  if (!result) return null;

  return (
    <div className="mt-4">
      <div className="bg-[#1C228C] shadow-2xl rounded-2xl p-6 max-w-md mx-auto border-2 border-[#8C1AD9]">
        <h2 className="text-2xl font-bold mb-4 text-center"
          style={{
            background: 'linear-gradient(90deg, #8C1AD9 30%, #2C2A59 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 10px #8C1AD9',
            letterSpacing: '0.02em',
          }}
        >
          Reproductor de Audio
        </h2>
        <audio 
          controls 
          className="w-full mb-4 bg-[#121559] rounded-lg border-2 border-[#8C1AD9]"
          onError={() => setError('Error al cargar el audio. Por favor, intenta de nuevo.')}
        >
          <source src={result} type="audio/wav" />
          Tu navegador no soporta el elemento de audio.
        </audio>
        {error && (
          <div className="text-red-400 text-sm mt-2 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
