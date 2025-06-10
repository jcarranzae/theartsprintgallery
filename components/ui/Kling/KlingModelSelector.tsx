// components/ui/KlingVideoGenerator/KlingModelSelector.tsx
'use client';

interface Model {
    label: string;
    value: string;
    description: string;
}

interface KlingModelSelectorProps {
    models: Model[];
    value: string;
    onChange: (value: string) => void;
}

export default function KlingModelSelector({ models, value, onChange }: KlingModelSelectorProps) {
    const selectedModel = models.find(m => m.value === value);

    return (
        <div className="space-y-2">
            <label className="text-[#8C1AD9] font-semibold text-lg">🤖 Kling Model</label>
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
                <div className="text-gray-300 text-sm mt-2 p-3 bg-zinc-800 rounded-lg border border-[#8C1AD9]/20">
                    <p>{selectedModel.description}</p>
                    <div className="mt-2 text-xs text-gray-400">
                        {selectedModel.value === 'kling-v2-master' && (
                            <p>🌟 <strong>Latest:</strong> Best quality, advanced understanding, longer videos</p>
                        )}
                        {selectedModel.value === 'kling-v1-6' && (
                            <p>⚡ <strong>Enhanced:</strong> Improved motion coherence and stability</p>
                        )}
                        {selectedModel.value === 'kling-v1' && (
                            <p>🚀 <strong>Fast:</strong> Quick generation for standard use cases</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}