'use client';

import MusicGenerator from '@/components/ui/MusicGenerator/MusicGenerator';

export default function MusicPage() {
  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Generador de Música
        </h1>
        <MusicGenerator />
      </div>
    </main>
  );
}
