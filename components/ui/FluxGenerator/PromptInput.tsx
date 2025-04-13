'use client';

interface PromptInputProps {
  value: string;
  onChange: (val: string) => void;
}

export default function PromptInput({ value, onChange }: PromptInputProps) {
  return (
    <div>
      <label className="block mb-1 font-medium">Prompt</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded"
      />
    </div>
  );
}