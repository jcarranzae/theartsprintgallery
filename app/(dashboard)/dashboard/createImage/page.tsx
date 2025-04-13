'use client';

import FluxGenerator from '@/components/ui/FluxGenerator/FluxGenerator';

export default function FluxPage() {
  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Generador de Imágenes FLUX
        </h1>
        <FluxGenerator />
      </div>
    </main>
  );
}
