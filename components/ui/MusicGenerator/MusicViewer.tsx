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
      <div className="bg-white shadow-md rounded-lg p-4 max-w-md mx-auto mt-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Reproductor de Audio
        </h2>
        <audio 
          controls 
          className="w-full mb-4"
          onError={() => setError('Error al cargar el audio. Por favor, intenta de nuevo.')}
        >
          <source src={result} type="audio/wav" />
          Tu navegador no soporta el elemento de audio.
        </audio>
        {error && (
          <div className="text-red-600 text-sm mt-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
