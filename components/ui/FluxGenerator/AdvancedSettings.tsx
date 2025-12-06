'use client';

import { RefreshCw } from 'lucide-react';

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
  showSteps?: boolean;
  showGuidance?: boolean;
  showPromptUpsampling?: boolean;
  // New fields
  batchSize: number;
  safetyTolerance: number;
  outputQuality: number;
  showBatchSize?: boolean;
  showSafetyTolerance?: boolean;
  showOutputQuality?: boolean;
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
  showSteps = true,
  showGuidance = true,
  showPromptUpsampling = true,
  batchSize,
  safetyTolerance,
  outputQuality,
  showBatchSize = true,
  showSafetyTolerance = true,
  showOutputQuality = true,
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
        <div className="bg-zinc-900 border border-fuchsia-700 rounded-lg p-6 mt-3 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-lg">

          {/* Batch Size */}
          {showBatchSize && (
            <div>
              <label className="block mb-2 text-cyan-300 font-semibold flex justify-between">
                <span>Batch Size</span>
                <span className="text-gray-400">{batchSize}</span>
              </label>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={batchSize}
                onChange={(e) => onChange('batchSize', Number(e.target.value))}
                className="w-full accent-fuchsia-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>4</span>
              </div>
            </div>
          )}

          {/* Aspect Ratio */}
          {showAspectRatio && (
            <div>
              <label className="block mb-2 text-cyan-300 font-semibold">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => onChange('aspectRatio', e.target.value)}
                className="w-full px-3 py-2 bg-black text-pink-400 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
              >
                <option value="1:1">1:1 (Square)</option>
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
                <option value="4:3">4:3 (Classic)</option>
                <option value="3:4">3:4 (Vertical)</option>
                <option value="3:2">3:2 (Photo)</option>
                <option value="2:3">2:3 (Vertical Photo)</option>
                <option value="21:9">21:9 (Cinematic)</option>
                <option value="9:21">9:21 (Vertical Cinematic)</option>
              </select>
            </div>
          )}

          {/* Output Format */}
          <div>
            <label className="block mb-2 text-cyan-300 font-semibold">Format</label>
            <select
              value={outputFormat}
              onChange={(e) => onChange('outputFormat', e.target.value)}
              className="w-full px-3 py-2 bg-black text-pink-400 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
            >
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
            </select>
          </div>

          {/* Output Quality */}
          {showOutputQuality && outputFormat === 'jpeg' && (
            <div>
              <label className="block mb-2 text-cyan-300 font-semibold flex justify-between">
                <span>Quality</span>
                <span className="text-gray-400">{outputQuality}%</span>
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={outputQuality}
                onChange={(e) => onChange('outputQuality', Number(e.target.value))}
                className="w-full accent-fuchsia-500"
              />
            </div>
          )}

          {/* Safety Tolerance */}
          {showSafetyTolerance && (
            <div>
              <label className="block mb-2 text-cyan-300 font-semibold flex justify-between">
                <span>Safety Tolerance</span>
                <span className="text-gray-400">{safetyTolerance}</span>
              </label>
              <input
                type="range"
                min="0"
                max="6"
                step="1"
                value={safetyTolerance}
                onChange={(e) => onChange('safetyTolerance', Number(e.target.value))}
                className="w-full accent-fuchsia-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Strict (0)</span>
                <span>Permissive (6)</span>
              </div>
            </div>
          )}

          {/* Steps */}
          {showSteps && (
            <div>
              <label className="block mb-2 text-cyan-300 font-semibold flex justify-between">
                <span>Steps</span>
                <span className="text-gray-400">{steps}</span>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={steps}
                onChange={(e) => onChange('steps', Number(e.target.value))}
                className="w-full accent-fuchsia-500"
              />
            </div>
          )}

          {/* Guidance */}
          {showGuidance && (
            <div>
              <label className="block mb-2 text-cyan-300 font-semibold flex justify-between">
                <span>Guidance Scale</span>
                <span className="text-gray-400">{guidance}</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.1"
                value={guidance}
                onChange={(e) => onChange('guidance', Number(e.target.value))}
                className="w-full accent-fuchsia-500"
              />
            </div>
          )}

          {/* Seed */}
          <div>
            <label className="block mb-2 text-cyan-300 font-semibold">Seed</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={seed || ''}
                placeholder="Random"
                onChange={(e) => onChange('seed', e.target.value ? Number(e.target.value) : null)}
                className="flex-1 px-3 py-2 bg-black text-green-300 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
              />
              <button
                onClick={() => onChange('seed', Math.floor(Math.random() * 1000000))}
                className="p-2 bg-fuchsia-700 hover:bg-fuchsia-600 rounded text-white transition"
                title="Randomize Seed"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>

          {/* Width & Height (Custom) */}
          {(showWidth || showHeight) && (
            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
              {showWidth && (
                <div>
                  <label className="block mb-2 text-cyan-300 font-semibold">Width</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => onChange('width', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black text-green-300 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                    step={16}
                  />
                </div>
              )}
              {showHeight && (
                <div>
                  <label className="block mb-2 text-cyan-300 font-semibold">Height</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => onChange('height', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black text-green-300 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                    step={16}
                  />
                </div>
              )}
            </div>
          )}

          {/* Negative Prompt */}
          {showNegativePrompt && (
            <div className="col-span-1 md:col-span-2">
              <label className="block mb-2 text-cyan-300 font-semibold">Negative Prompt</label>
              <textarea
                value={negativePrompt || ''}
                onChange={(e) => onChange('negativePrompt', e.target.value)}
                className="w-full px-3 py-2 bg-black text-green-300 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400 min-h-[80px]"
                placeholder="Elements to avoid in the image..."
              />
            </div>
          )}

          {/* Toggles */}
          <div className="col-span-1 md:col-span-2 flex flex-wrap gap-6 mt-2">
            {showPromptUpsampling && (
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={promptUpsampling}
                    onChange={(e) => onChange('promptUpsampling', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-fuchsia-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia-600"></div>
                </div>
                <span className="text-cyan-300 font-semibold group-hover:text-cyan-200 transition">Prompt Upsampling</span>
              </label>
            )}

            {showRaw && (
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={raw ?? false}
                    onChange={(e) => onChange('raw', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-fuchsia-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fuchsia-600"></div>
                </div>
                <span className="text-cyan-300 font-semibold group-hover:text-cyan-200 transition">Raw Mode</span>
              </label>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
