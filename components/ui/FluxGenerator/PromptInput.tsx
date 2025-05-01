'use client';

interface PromptInputProps {
  prompt: string;
  negativePrompt: string | null;
  onChangePrompt: (val: string) => void;
  onChangeNegativePrompt: (val: string) => void;
}

export default function PromptInput({ prompt, negativePrompt, onChangePrompt, onChangeNegativePrompt }: PromptInputProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-[#8C1AD9] font-semibold text-lg">
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => onChangePrompt(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-900 text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] shadow-md outline-none transition-all placeholder:text-[#8C1AD9]/50"
          placeholder="Describe la imagen que quieres generar"
        />
      </div>
      <div>
        <label className="text-[#8C1AD9] font-semibold text-lg">
          Negative Prompt
        </label>
        <textarea
          value={negativePrompt || ''}
          onChange={(e) => onChangeNegativePrompt(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-900 text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] shadow-md outline-none transition-all placeholder:text-[#8C1AD9]/50"
          placeholder="Describe lo que no quieres en la imagen"
        />
      </div>
    </div>
  );
}
