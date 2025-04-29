'use client';

interface PromptInputProps {
  prompt: string;
  negativePrompt: string;
  onChangePrompt: (val: string) => void;
  onChangeNegativePrompt: (val: string) => void;
}

export default function PromptInput({ prompt, negativePrompt, onChangePrompt, onChangeNegativePrompt }: PromptInputProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2 text-lg font-semibold text-cyan-300 drop-shadow-md">
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => onChangePrompt(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-900 text-green-400 border-2 border-cyan-400 focus:ring-2 focus:ring-fuchsia-500 shadow-md outline-none transition-all placeholder:text-cyan-700"
          placeholder="Describe la imagen que quieres generar"
        />
      </div>
      <div>
        <label className="block mb-2 text-lg font-semibold text-cyan-300 drop-shadow-md">
          Negative Prompt
        </label>
        <textarea
          value={negativePrompt}
          onChange={(e) => onChangeNegativePrompt(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-900 text-green-400 border-2 border-cyan-400 focus:ring-2 focus:ring-fuchsia-500 shadow-md outline-none transition-all placeholder:text-cyan-700"
          placeholder="Describe lo que no quieres en la imagen"
        />
      </div>
    </div>
  );
}
