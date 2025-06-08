'use client';

interface Model {
  label: string;
  value: string;
  description: string;
}

interface KontextModelSelectorProps {
  models: Model[];
  value: string;
  onChange: (value: string) => void;
}

export default function KontextModelSelector({ models, value, onChange }: KontextModelSelectorProps) {
  const selectedModel = models.find(m => m.value === value);

  return (
    <div className="space-y-2">
      <label className="text-[#8C1AD9] font-semibold text-lg">🤖 Kontext Model</label>
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