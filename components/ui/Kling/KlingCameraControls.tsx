// components/ui/KlingVideoGenerator/KlingCameraControls.tsx
'use client';

import { useState } from 'react';

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

interface KlingCameraControlsProps {
    cameraControl: CameraControl | null;
    onChange: (control: CameraControl | null) => void;
}

const presetMovements = [
    {
        type: 'down_back' as const,
        label: '📉 Pan Down & Zoom Out',
        description: 'Camera descends and moves backward',
        icon: '⬇️🔙'
    },
    {
        type: 'forward_up' as const,
        label: '📈 Zoom In & Pan Up',
        description: 'Camera moves forward and tilts up',
        icon: '⬆️🔜'
    },
    {
        type: 'right_turn_forward' as const,
        label: '🔄 Rotate Right & Advance',
        description: 'Rotate right and move forward',
        icon: '↗️🔄'
    },
    {
        type: 'left_turn_forward' as const,
        label: '🔄 Rotate Left & Advance',
        description: 'Rotate left and move forward',
        icon: '↖️🔄'
    }
];

const customControls = [
    {
        key: 'horizontal' as const,
        label: 'Horizontal Movement',
        description: 'Left/Right translation',
        icon: '⬅️➡️',
        range: [-10, 10],
        negative: 'Left',
        positive: 'Right'
    },
    {
        key: 'vertical' as const,
        label: 'Vertical Movement',
        description: 'Up/Down translation',
        icon: '⬆️⬇️',
        range: [-10, 10],
        negative: 'Down',
        positive: 'Up'
    },
    {
        key: 'pan' as const,
        label: 'Pan (Vertical Rotation)',
        description: 'Rotate around X-axis',
        icon: '🔄⬆️',
        range: [-10, 10],
        negative: 'Down',
        positive: 'Up'
    },
    {
        key: 'tilt' as const,
        label: 'Tilt (Horizontal Rotation)',
        description: 'Rotate around Y-axis',
        icon: '🔄➡️',
        range: [-10, 10],
        negative: 'Left',
        positive: 'Right'
    },
    {
        key: 'roll' as const,
        label: 'Roll (Z-axis Rotation)',
        description: 'Rolling rotation',
        icon: '🌪️',
        range: [-10, 10],
        negative: 'Counter-clockwise',
        positive: 'Clockwise'
    },
    {
        key: 'zoom' as const,
        label: 'Zoom',
        description: 'Field of view change',
        icon: '🔍',
        range: [-10, 10],
        negative: 'Zoom In (narrow)',
        positive: 'Zoom Out (wide)'
    }
];

export default function KlingCameraControls({ cameraControl, onChange }: KlingCameraControlsProps) {
    const [controlMode, setControlMode] = useState<'none' | 'preset' | 'custom'>('none');

    const handleModeChange = (mode: 'none' | 'preset' | 'custom') => {
        setControlMode(mode);
        if (mode === 'none') {
            onChange(null);
        } else if (mode === 'preset' && !cameraControl) {
            onChange({ type: 'down_back' });
        } else if (mode === 'custom' && !cameraControl) {
            onChange({
                type: 'simple',
                config: {
                    horizontal: 0,
                    vertical: 0,
                    pan: 0,
                    tilt: 0,
                    roll: 0,
                    zoom: 0
                }
            });
        }
    };

    const handlePresetChange = (type: CameraControl['type']) => {
        onChange({ type });
    };

    const handleCustomChange = (key: string, value: number) => {
        if (!cameraControl || cameraControl.type !== 'simple') return;

        // Reset all other values to 0 when setting a new one (Kling requirement)
        const newConfig = {
            horizontal: 0,
            vertical: 0,
            pan: 0,
            tilt: 0,
            roll: 0,
            zoom: 0,
            [key]: value
        };

        onChange({
            type: 'simple',
            config: newConfig
        });
    };

    const getActiveCustomControl = () => {
        if (!cameraControl?.config) return null;

        for (const control of customControls) {
            const value = cameraControl.config[control.key];
            if (value && value !== 0) {
                return { key: control.key, value };
            }
        }
        return null;
    };

    const activeCustom = getActiveCustomControl();

    return (
        <div className="space-y-4">
            {/* Mode Selection */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => handleModeChange('none')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${controlMode === 'none'
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                >
                    🚫 No Camera Control
                </button>
                <button
                    onClick={() => handleModeChange('preset')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${controlMode === 'preset'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                >
                    🎬 Preset Movements
                </button>
                <button
                    onClick={() => handleModeChange('custom')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${controlMode === 'custom'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                >
                    🎛️ Custom Controls
                </button>
            </div>

            {/* Preset Movements */}
            {controlMode === 'preset' && (
                <div className="space-y-3">
                    <h5 className="text-blue-300 font-semibold">📹 Preset Camera Movements</h5>
                    <div className="grid grid-cols-1 gap-2">
                        {presetMovements.map((movement) => (
                            <label
                                key={movement.type}
                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${cameraControl?.type === movement.type
                                        ? 'border-blue-500 bg-blue-500/20'
                                        : 'border-gray-600 bg-gray-800 hover:border-blue-400'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="cameraPreset"
                                    checked={cameraControl?.type === movement.type}
                                    onChange={() => handlePresetChange(movement.type)}
                                    className="sr-only"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{movement.icon}</span>
                                        <span className="font-medium text-white">{movement.label}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{movement.description}</p>
                                </div>
                                {cameraControl?.type === movement.type && (
                                    <div className="text-blue-400">✓</div>
                                )}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Custom Controls */}
            {controlMode === 'custom' && (
                <div className="space-y-4">
                    <h5 className="text-purple-300 font-semibold">🎛️ Custom Camera Controls</h5>
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                        <p className="text-yellow-200 text-sm">
                            ⚠️ <strong>Note:</strong> Only one movement type can be active at a time.
                            Setting a new value will reset others to zero.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {customControls.map((control) => {
                            const currentValue = cameraControl?.config?.[control.key] || 0;
                            const isActive = activeCustom?.key === control.key;

                            return (
                                <div
                                    key={control.key}
                                    className={`p-4 rounded-lg border transition-all ${isActive ? 'border-purple-500 bg-purple-500/20' : 'border-gray-600 bg-gray-800'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{control.icon}</span>
                                            <span className="font-medium text-white">{control.label}</span>
                                        </div>
                                        <span className={`text-sm font-mono ${isActive ? 'text-purple-300' : 'text-gray-400'}`}>
                                            {currentValue}
                                        </span>
                                    </div>

                                    <input
                                        type="range"
                                        min={control.range[0]}
                                        max={control.range[1]}
                                        step={0.5}
                                        value={currentValue}
                                        onChange={(e) => handleCustomChange(control.key, Number(e.target.value))}
                                        className="w-full accent-purple-500"
                                    />

                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span>{control.negative} ({control.range[0]})</span>
                                        <span className="text-gray-500">{control.description}</span>
                                        <span>{control.positive} ({control.range[1]})</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Current Selection Display */}
            {cameraControl && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                    <h6 className="text-green-300 font-semibold mb-2">✅ Active Camera Control</h6>
                    {cameraControl.type === 'simple' && activeCustom ? (
                        <p className="text-green-200 text-sm">
                            <strong>{customControls.find(c => c.key === activeCustom.key)?.label}:</strong> {activeCustom.value}
                        </p>
                    ) : (
                        <p className="text-green-200 text-sm">
                            <strong>{presetMovements.find(p => p.type === cameraControl.type)?.label || cameraControl.type}</strong>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}