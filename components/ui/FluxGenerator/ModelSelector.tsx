'use client';

interface Model {
  label: string;
  value: string;
  description: string;
}

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const models: Model[] = [
  {
    label: 'FLUX.1 [dev]',
    value: 'flux-dev',
    description: 'Fast development model with good quality and creative flexibility'
  },
  {
    label: 'FLUX.1 [pro]',
    value: 'flux-pro',
    description: 'Professional quality with enhanced details and consistency'
  },
  {
    label: 'FLUX.1.1 [pro]',
    value: 'flux-pro-1.1',
    description: 'Latest pro model with improved performance and quality'
  },
  {
    label: 'FLUX.1.1 [pro] Ultra',
    value: 'flux-pro-1.1-ultra',
    description: 'Ultra high quality with maximum detail and precision'
  },
];

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const selectedModel = models.find(m => m.value === value);

  return (
    <div className="space-y-2">
      <label className="text-[#8C1AD9] font-semibold text-lg">🤖 FLUX Model</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 rounded-lg bg-zinc-900 text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] outline-none transition-all"
      >
        {models.map((model) => (
          <option key={model.value} value={model.value}>
            {model.label}
          </option>
        ))}
      </select>
      {selectedModel && (
        <p className="text-gray-300 text-sm mt-2">
          {selectedModel.description}
        </p>
      )}
    </div>
  );
}
