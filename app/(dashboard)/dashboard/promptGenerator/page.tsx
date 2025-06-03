'use client';

import PromptGeneratorUI from '@/components/ui/PromptGenerator/PromptGeneratorUI';

export default function PromptGenerator() {
  return (
    <section
      style={{
        background: 'linear-gradient(120deg, #060826 0%, #1C228C 50%, #2C2A59 100%)',
        minHeight: '100vh',
        padding: '48px 0',
      }}
    >
      <div className="max-w-3xl mx-auto bg-[#121559] p-8 rounded-2xl shadow-2xl border-2 border-[#8C1AD9]">
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
          Generador de Música
        </h1>
        <PromptGeneratorUI />
      </div>
    </section>
  );
}
