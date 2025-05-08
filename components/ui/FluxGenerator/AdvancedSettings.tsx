'use client';

interface AdvancedSettingsProps {
  show: boolean;
  onToggle: () => void;
  steps: number;
  guidance: number;
  seed: number | null;
  outputFormat: 'jpeg' | 'png';
  promptUpsampling: boolean;
  aspectRatio?: string;
  width?: number;
  height?: number;
  onChange: (field: string, value: any) => void;
  showAspectRatio: boolean;
  negativePrompt?: string;
  showNegativePrompt: boolean;
  showWidth: boolean;
  showHeight: boolean;
  showRaw?: boolean;
  raw?: boolean;
  model?: string;
}

export default function AdvancedSettings({
  show,
  onToggle,
  steps,
  guidance,
  seed,
  outputFormat,
  promptUpsampling,
  aspectRatio,
  width,
  height,
  negativePrompt,
  onChange,
  showAspectRatio,
  showNegativePrompt,
  showWidth,
  showHeight,
  showRaw,
  raw,
  model,
}: AdvancedSettingsProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="mb-3 text-fuchsia-400 font-bold underline hover:text-green-400 transition"
      >
        {show ? 'Ocultar ajustes avanzados' : 'Mostrar ajustes avanzados'}
      </button>

      {show && (
        <div className="bg-zinc-900 border border-fuchsia-700 rounded-lg p-6 mt-3 space-y-4 shadow-lg">
          <div>
            <label className="block mb-1 text-cyan-300 font-semibold">Steps</label>
            <input
              type="number"
              value={steps}
              onChange={(e) => onChange('steps', Number(e.target.value))}
              className="w-32 px-2 py-1 bg-black text-green-300 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
              min={1}
              max={100}
            />
          </div>

          <div>
            <label className="block mb-1 text-cyan-300 font-semibold">Guidance</label>
            <input
              type="number"
              value={guidance}
              onChange={(e) => onChange('guidance', Number(e.target.value))}
              className="w-32 px-2 py-1 bg-black text-green-300 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
              min={0}
              max={100}
            />
          </div>

          <div>
            <label className="block mb-1 text-cyan-300 font-semibold">Seed</label>
            <input
              type="number"
              value={seed || ''}
              onChange={(e) => onChange('seed', Number(e.target.value) || null)}
              className="w-32 px-2 py-1 bg-black text-green-300 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-cyan-300 font-semibold">Formato</label>
            <select
              value={outputFormat}
              onChange={(e) => onChange('outputFormat', e.target.value)}
              className="w-36 px-2 py-1 bg-black text-pink-400 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
            >
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block mb-1 text-cyan-300 font-semibold">
              <input
                type="checkbox"
                checked={promptUpsampling}
                onChange={(e) => onChange('promptUpsampling', e.target.checked)}
                className="mr-2 accent-fuchsia-500"
              />
              Upsampling del prompt
            </label>
          </div>
          <span className="text-pink-300">Activar</span>
          {showAspectRatio && (
            <div className="col-span-2">
              <label className="block text-sm">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => onChange('aspectRatio', e.target.value)}
                className="w-full p-1 border rounded"
              >
                <option value="1:1">1:1</option>
                <option value="4:3">4:3</option>
                <option value="3:2">3:2</option>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
              </select>
            </div>
          )}

          {showWidth && (
            <div>
              <label className="block text-sm">Width</label>
              <input
                type="number"
                value={width}
                onChange={(e) => onChange('width', Number(e.target.value))}
                className="w-full p-1 border rounded"
              />
            </div>
          )}

          {showHeight && (
            <div>
              <label className="block text-sm">Height</label>
              <input
                type="number"
                value={height}
                onChange={(e) => onChange('height', Number(e.target.value))}
                className="w-full p-1 border rounded"
              />
            </div>
          )}

          {showNegativePrompt && (
            <div className="col-span-2">
              <label className="block mb-1 text-cyan-300 font-semibold">Negative Prompt</label>
              <input
                type="text"
                value={negativePrompt || ''}
                onChange={(e) => onChange('negativePrompt', e.target.value)}
                className="w-full px-2 py-1 bg-black text-green-300 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
              />
            </div>
          )}

          {showRaw && (
            <div className="col-span-2">
              <label className="block mb-1 text-cyan-300 font-semibold">
                <input
                  type="checkbox"
                  checked={raw ?? false}
                  onChange={(e) => onChange('raw', e.target.checked)}
                />
                Activar modo raw
              </label>
              <span className="text-green-400">Activar salida RAW</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
