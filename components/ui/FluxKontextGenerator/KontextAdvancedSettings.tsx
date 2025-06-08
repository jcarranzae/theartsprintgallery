'use client';

interface AspectRatio {
  label: string;
  value: string;
}

interface KontextAdvancedSettingsProps {
  show: boolean;
  onToggle: () => void;
  seed: number;
  aspectRatio: string;
  aspectRatios: AspectRatio[];
  outputFormat: 'jpg' | 'png';
  promptUpsampling: boolean;
  safetyTolerance: number;
  onChange: (field: string, value: any) => void;
}

export default function KontextAdvancedSettings({
  show,
  onToggle,
  seed,
  aspectRatio,
  aspectRatios,
  outputFormat,
  promptUpsampling,
  safetyTolerance,
  onChange,
}: KontextAdvancedSettingsProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="mb-3 text-fuchsia-400 font-bold underline hover:text-green-400 transition"
      >
        {show ? 'Hide advanced settings' : 'Show advanced settings'}
      </button>

      {show && (
        <div className="bg-zinc-900 border border-fuchsia-700 rounded-lg p-6 mt-3 space-y-4 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-cyan-300 font-semibold">Seed</label>
              <input
                type="number"
                value={seed}
                onChange={(e) => onChange('seed', Number(e.target.value))}
                className="w-full px-3 py-2 bg-black text-green-300 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                min={0}
                max={2147483647}
              />
              <p className="text-xs text-gray-400 mt-1">Use same seed for reproducible results</p>
            </div>

            <div>
              <label className="block mb-2 text-cyan-300 font-semibold">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => onChange('aspectRatio', e.target.value)}
                className="w-full px-3 py-2 bg-black text-pink-400 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
              >
                {aspectRatios.map((ratio) => (
                  <option key={ratio.value} value={ratio.value}>
                    {ratio.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-cyan-300 font-semibold">Output Format</label>
              <select
                value={outputFormat}
                onChange={(e) => onChange('outputFormat', e.target.value)}
                className="w-full px-3 py-2 bg-black text-pink-400 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
              >
                <option value="png">PNG (Higher Quality)</option>
                <option value="jpg">JPG (Smaller Size)</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-cyan-300 font-semibold">Safety Tolerance</label>
              <input
                type="range"
                min={0}
                max={6}
                value={safetyTolerance}
                onChange={(e) => onChange('safetyTolerance', Number(e.target.value))}
                className="w-full accent-fuchsia-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Safe (0)</span>
                <span className="text-pink-300">{safetyTolerance}</span>
                <span>Permissive (6)</span>
              </div>
            </div>
          </div>

          <div className="border-t border-fuchsia-700/30 pt-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={promptUpsampling}
                onChange={(e) => onChange('promptUpsampling', e.target.checked)}
                className="accent-fuchsia-500 scale-110"
              />
              <span className="text-cyan-300 font-semibold">Prompt Upsampling</span>
            </label>
            <p className="text-pink-300 text-sm mt-1 ml-6">
              Enhance prompt with additional descriptive details
            </p>
          </div>
        </div>
      )}
    </div>
  );
}