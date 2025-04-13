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
      <label className="block mb-1 font-medium">Seleccionar modelo</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded"
      >
        {models.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
    </div>
  );
}