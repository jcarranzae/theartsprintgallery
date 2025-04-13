'use client';

interface AdvancedSettingsProps {
  show: boolean;
  onToggle: () => void;
  steps: number;
  guidance: number;
  seed: number;
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
}: AdvancedSettingsProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="text-sm text-blue-600 underline mb-2"
      >
        {show ? 'Ocultar ajustes avanzados' : 'Mostrar ajustes avanzados'}
      </button>

      {show && (
        <div className="grid grid-cols-2 gap-4 border p-4 rounded bg-gray-50">
          <div>
            <label className="block text-sm">Steps</label>
            <input
              type="number"
              value={steps}
              onChange={(e) => onChange('steps', Number(e.target.value))}
              className="w-full p-1 border rounded"
              min={1}
              max={100}
            />
          </div>

          <div>
            <label className="block text-sm">Guidance</label>
            <input
              type="number"
              value={guidance}
              onChange={(e) => onChange('guidance', Number(e.target.value))}
              className="w-full p-1 border rounded"
              min={0}
              max={100}
            />
          </div>

          <div>
            <label className="block text-sm">Seed</label>
            <input
              type="number"
              value={seed}
              onChange={(e) => onChange('seed', Number(e.target.value))}
              className="w-full p-1 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm">Formato</label>
            <select
              value={outputFormat}
              onChange={(e) => onChange('outputFormat', e.target.value)}
              className="w-full p-1 border rounded"
            >
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={promptUpsampling}
                onChange={(e) => onChange('promptUpsampling', e.target.checked)}
              />
              Upsampling del prompt
            </label>
          </div>

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
              <label className="block text-sm">Negative Prompt</label>
              <input
                type="text"
                value={negativePrompt || ''}
                onChange={(e) => onChange('negativePrompt', e.target.value)}
                className="w-full p-1 border rounded"
              />
            </div>
          )}

          {showRaw && (
            <div className="col-span-2">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={raw ?? false}
                  onChange={(e) => onChange('raw', e.target.checked)}
                />
                Activar modo raw
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
