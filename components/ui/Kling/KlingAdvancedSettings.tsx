// components/ui/KlingVideoGenerator/KlingAdvancedSettings.tsx
'use client';

import KlingCameraControls from './KlingCameraControls';

interface AspectRatio {
    label: string;
    value: string;
}

interface Duration {
    label: string;
    value: string;
}

interface Mode {
    label: string;
    value: string;
}

interface CameraControl {
    type: 'simple' | 'down_back' | 'forward_up' | 'right_turn_forward' | 'left_turn_forward';
    config?: {
        horizontal?: number;
        vertical?: number;
        pan?: number;
        tilt?: number;
        roll?: number;
        zoom?: number;
    };
}

interface KlingAdvancedSettingsProps {
    show: boolean;
    onToggle: () => void;
    cfgScale: number;
    aspectRatio: string;
    aspectRatios: AspectRatio[];
    duration: string;
    durations: Duration[];
    mode: string;
    modes: Mode[];
    cameraControl: CameraControl | null;
    externalTaskId: string;
    onChange: (field: string, value: any) => void;
}

export default function KlingAdvancedSettings({
    show,
    onToggle,
    cfgScale,
    aspectRatio,
    aspectRatios,
    duration,
    durations,
    mode,
    modes,
    cameraControl,
    externalTaskId,
    onChange,
}: KlingAdvancedSettingsProps) {
    return (
        <div>
            <button
                onClick={onToggle}
                className="mb-3 text-fuchsia-400 font-bold underline hover:text-green-400 transition"
            >
                {show ? '🔼 Hide advanced settings' : '🔽 Show advanced settings'}
            </button>

            {show && (
                <div className="bg-zinc-900 border border-fuchsia-700 rounded-lg p-6 mt-3 space-y-6 shadow-lg">
                    {/* Basic Video Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-cyan-300 font-semibold">🎯 CFG Scale</label>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.1}
                                value={cfgScale}
                                onChange={(e) => onChange('cfgScale', Number(e.target.value))}
                                className="w-full accent-fuchsia-500"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Flexible (0)</span>
                                <span className="text-pink-300">{cfgScale}</span>
                                <span>Strict (1)</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Higher values = closer to prompt, lower = more creative freedom</p>
                        </div>

                        <div>
                            <label className="block mb-2 text-cyan-300 font-semibold">📐 Aspect Ratio</label>
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
                            <label className="block mb-2 text-cyan-300 font-semibold">⏱️ Duration</label>
                            <select
                                value={duration}
                                onChange={(e) => onChange('duration', e.target.value)}
                                className="w-full px-3 py-2 bg-black text-pink-400 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                            >
                                {durations.map((dur) => (
                                    <option key={dur.value} value={dur.value}>
                                        {dur.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-1">Longer videos require more processing time</p>
                        </div>

                        <div>
                            <label className="block mb-2 text-cyan-300 font-semibold">⚙️ Generation Mode</label>
                            <select
                                value={mode}
                                onChange={(e) => onChange('mode', e.target.value)}
                                className="w-full px-3 py-2 bg-black text-pink-400 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                            >
                                {modes.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-1">
                                {mode === 'std' ? 'Fast and cost-effective' : 'Higher quality but slower'}
                            </p>
                        </div>
                    </div>

                    {/* Camera Controls Section */}
                    <div className="border-t border-fuchsia-700/30 pt-6">
                        <h4 className="text-cyan-300 font-semibold mb-4 flex items-center gap-2">
                            📹 Camera Controls
                            <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                        </h4>

                        <KlingCameraControls
                            cameraControl={cameraControl}
                            onChange={(control) => onChange('cameraControl', control)}
                        />
                    </div>

                    {/* Custom Task ID */}
                    <div className="border-t border-fuchsia-700/30 pt-6">
                        <div>
                            <label className="block mb-2 text-cyan-300 font-semibold">🏷️ Custom Task ID (Optional)</label>
                            <input
                                type="text"
                                value={externalTaskId}
                                onChange={(e) => onChange('externalTaskId', e.target.value)}
                                className="w-full px-3 py-2 bg-black text-green-300 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                                placeholder="Enter a custom identifier for this task"
                            />
                            <p className="text-xs text-gray-400 mt-1">Useful for tracking specific generations</p>
                        </div>
                    </div>

                    {/* Settings Guide */}
                    <div className="bg-gradient-to-r from-fuchsia-900/20 to-cyan-900/20 rounded-lg p-4 border border-fuchsia-500/30">
                        <h4 className="text-cyan-300 font-semibold mb-2">🎬 Kling Settings Guide</h4>
                        <div className="text-xs text-gray-300 space-y-1">
                            <p><strong>CFG Scale:</strong> Lower = AI creativity, Higher = prompt adherence</p>
                            <p><strong>Mode:</strong> Standard for speed, Professional for quality</p>
                            <p><strong>Camera:</strong> Use preset movements or custom controls for dynamic shots</p>
                            <p><strong>Duration:</strong> Consider your content - action scenes work well at 5s, slower scenes at 10s</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}