'use client';

interface ModelSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

const models = [
  { label: 'FLUX.1 [dev]', value: 'flux-dev' },
  { label: 'FLUX.1 [pro]', value: 'flux-pro' },
  { label: 'FLUX.1.1 [pro]', value: 'flux-pro-1.1' },
  { label: 'FLUX.1.1 [pro] Ultra', value: 'flux-pro-1.1-ultra' },
];

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div>
      <label className="block mb-2 text-lg font-semibold text-fuchsia-400 drop-shadow-md">
        Seleccionar modelo
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 rounded-lg bg-zinc-900 text-cyan-400 border-2 border-fuchsia-500 focus:ring-2 focus:ring-blue-400 shadow-md outline-none transition-all"
      >
        {models.map((m) => (
          <option key={m.value} value={m.value} className="bg-zinc-800 text-green-400">
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
