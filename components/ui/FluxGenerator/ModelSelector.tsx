'use client';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-[#8C1AD9] font-semibold text-lg">Modelo</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 rounded-lg bg-zinc-900 text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] outline-none"
      >
        <option value="flux-dev">FLUX.1 [dev]</option>
        <option value="flux-pro">FLUX.1 [pro]</option>
        <option value="flux-pro-1.1">FLUX.1.1 [pro]</option>
        <option value="flux-pro-1.1-ultra">FLUX.1.1 [pro] Ultra</option>
      </select>
    </div>
  );
}
