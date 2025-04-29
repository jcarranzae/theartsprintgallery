'use client';

interface PromptInputProps {
  value: string;
  onChange: (val: string) => void;
}

export default function PromptInput({ value, onChange }: PromptInputProps) {
  return (
    <div>
      <label className="block mb-2 text-lg font-semibold text-cyan-300 drop-shadow-md">
        Prompt
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 rounded-lg bg-zinc-900 text-green-400 border-2 border-cyan-400 focus:ring-2 focus:ring-fuchsia-500 shadow-md outline-none transition-all placeholder:text-cyan-700"
        placeholder="Describe la imagen que quieres generar"
      />
    </div>
  );
}
