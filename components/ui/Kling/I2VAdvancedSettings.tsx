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

interface I2VAdvancedSettingsProps {
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

    // I2V specific props
    selectedModel: string;
    hasImageTail: boolean;
    hasStaticMask: boolean;
    hasDynamicMasks: boolean;
    dynamicMasksCount: number;
}

export default function I2VAdvancedSettings({
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
    selectedModel,
    hasImageTail,
    hasStaticMask,
    hasDynamicMasks,
    dynamicMasksCount
}: I2VAdvancedSettingsProps) {

    // Check for conflicting features
    const hasConflictingFeatures = () => {
        return hasImageTail && (hasStaticMask || hasDynamicMasks || !!cameraControl);
    };

    const getConflictWarning = () => {
        if (!hasConflictingFeatures()) return null;

        const conflicts = [];
        if (hasImageTail) conflicts.push('End Frame Control');
        if (hasStaticMask) conflicts.push('Static Mask');
        if (hasDynamicMasks) conflicts.push('Dynamic Masks');
        if (cameraControl) conflicts.push('Camera Controls');

        return `Conflicting features detected: ${conflicts.join(', ')}. Only one type can be used.`;
    };

    const isDynamicMasksSupported = () => {
        return selectedModel === 'kling-v1' && (mode === 'std' || mode === 'pro') && duration === '5';
    };

    const getCfgScaleSupport = () => {
        return !selectedModel.startsWith('kling-v2');
    };

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
                    {/* Conflict Warning */}
                    {hasConflictingFeatures() && (
                        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-red-400 text-lg">⚠️</span>
                                <h4 className="text-red-400 font-semibold">Feature Conflict Detected</h4>
                            </div>
                            <p className="text-red-300 text-sm">{getConflictWarning()}</p>
                            <p className="text-gray-400 text-xs mt-2">
                                Please disable conflicting features to ensure proper generation.
                            </p>
                        </div>
                    )}

                    {/* Model Compatibility Info */}
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="text-blue-300 font-semibold mb-2">🤖 Model Compatibility</h4>
                        <div className="text-xs text-gray-300 space-y-1">
                            <p><strong>Selected Model:</strong> {selectedModel}</p>
                            <p><strong>CFG Scale:</strong> {getCfgScaleSupport() ? 'Supported ✅' : 'Not supported in V2 models ❌'}</p>
                            <p><strong>Dynamic Masks:</strong> {isDynamicMasksSupported() ? 'Supported ✅' : 'Only kling-v1 std/pro 5s ❌'}</p>
                            <p><strong>Motion Brush:</strong> {selectedModel === 'kling-v1' ? 'Fully supported ✅' : 'Limited support ⚠️'}</p>
                        </div>
                    </div>

                    {/* Basic Video Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getCfgScaleSupport() && (
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
                        )}

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
                            <p className="text-xs text-gray-400 mt-1">Should match your input image aspect ratio</p>
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
                            <p className="text-xs text-gray-400 mt-1">
                                {duration === '10' && hasDynamicMasks ?
                                    '⚠️ Dynamic masks only support 5s duration' :
                                    'Longer videos require more processing time'
                                }
                            </p>
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
                                {mode === 'std' ? 'Fast and cost-effective for I2V' : 'Higher quality but slower processing'}
                            </p>
                        </div>
                    </div>

                    {/* Feature Status */}
                    <div className="border-t border-fuchsia-700/30 pt-6">
                        <h4 className="text-cyan-300 font-semibold mb-4">🎛️ Active Features</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className={`p-3 rounded-lg border text-center ${hasImageTail ? 'border-orange-500 bg-orange-900/20' : 'border-gray-600 bg-gray-800'
                                }`}>
                                <div className="text-orange-400 text-lg mb-1">🎯</div>
                                <p className="text-xs text-gray-300">End Frame</p>
                                <p className="text-xs text-gray-500">{hasImageTail ? 'Active' : 'Inactive'}</p>
                            </div>

                            <div className={`p-3 rounded-lg border text-center ${hasStaticMask ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-600 bg-gray-800'
                                }`}>
                                <div className="text-cyan-400 text-lg mb-1">🖌️</div>
                                <p className="text-xs text-gray-300">Static Mask</p>
                                <p className="text-xs text-gray-500">{hasStaticMask ? 'Active' : 'Inactive'}</p>
                            </div>

                            <div className={`p-3 rounded-lg border text-center ${hasDynamicMasks ? 'border-purple-500 bg-purple-900/20' : 'border-gray-600 bg-gray-800'
                                }`}>
                                <div className="text-purple-400 text-lg mb-1">🎯</div>
                                <p className="text-xs text-gray-300">Dynamic Masks</p>
                                <p className="text-xs text-gray-500">
                                    {hasDynamicMasks ? `${dynamicMasksCount} active` : 'Inactive'}
                                </p>
                            </div>

                            <div className={`p-3 rounded-lg border text-center ${cameraControl ? 'border-green-500 bg-green-900/20' : 'border-gray-600 bg-gray-800'
                                }`}>
                                <div className="text-green-400 text-lg mb-1">📹</div>
                                <p className="text-xs text-gray-300">Camera Control</p>
                                <p className="text-xs text-gray-500">
                                    {cameraControl ? cameraControl.type.replace('_', ' ') : 'Inactive'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Camera Controls Section */}
                    {!hasImageTail && !hasStaticMask && !hasDynamicMasks && (
                        <div className="border-t border-fuchsia-700/30 pt-6">
                            <h4 className="text-cyan-300 font-semibold mb-4 flex items-center gap-2">
                                📹 Camera Controls
                                <span className="text-xs text-gray-400 font-normal">(Available when no Motion Brush is used)</span>
                            </h4>

                            <KlingCameraControls
                                cameraControl={cameraControl}
                                onChange={(control) => onChange('cameraControl', control)}
                            />
                        </div>
                    )}

                    {/* Custom Task ID */}
                    <div className="border-t border-fuchsia-700/30 pt-6">
                        <div>
                            <label className="block mb-2 text-cyan-300 font-semibold">🏷️ Custom Task ID (Optional)</label>
                            <input
                                type="text"
                                value={externalTaskId}
                                onChange={(e) => onChange('externalTaskId', e.target.value)}
                                className="w-full px-3 py-2 bg-black text-green-300 border border-fuchsia-500 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                                placeholder="Enter a custom identifier for this I2V task"
                            />
                            <p className="text-xs text-gray-400 mt-1">Useful for tracking specific I2V generations</p>
                        </div>
                    </div>

                    {/* I2V Settings Guide */}
                    <div className="bg-gradient-to-r from-fuchsia-900/20 to-cyan-900/20 rounded-lg p-4 border border-fuchsia-500/30">
                        <h4 className="text-cyan-300 font-semibold mb-2">🎬 I2V Settings Guide</h4>
                        <div className="text-xs text-gray-300 space-y-1">
                            <p><strong>CFG Scale:</strong> Lower = AI creativity, Higher = prompt adherence (V1 only)</p>
                            <p><strong>Mode:</strong> Standard for speed, Professional for quality</p>
                            <p><strong>End Frame:</strong> Define exact target for smooth transitions</p>
                            <p><strong>Motion Brush:</strong> Precise control over which areas move</p>
                            <p><strong>Camera:</strong> Add cinematic movement to your I2V</p>
                            <p><strong>Duration:</strong> 5s for dynamic motion, 10s for slower scenes</p>
                        </div>
                    </div>

                    {/* Optimization Tips */}
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                        <h4 className="text-yellow-300 font-semibold mb-2">💡 I2V Optimization Tips</h4>
                        <div className="text-xs text-gray-300 space-y-1">
                            <p><strong>Image Quality:</strong> Use high-resolution images (min 300x300px)</p>
                            <p><strong>Subject Focus:</strong> Clear subjects work better than complex scenes</p>
                            <p><strong>Motion Prompt:</strong> Be specific about desired movement patterns</p>
                            <p><strong>Aspect Ratio:</strong> Match your input image for best results</p>
                            <p><strong>Feature Selection:</strong> Use one advanced feature at a time for stability</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}