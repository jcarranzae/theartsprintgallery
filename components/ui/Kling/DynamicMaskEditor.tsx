'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Play, Trash2, RotateCcw, Save } from 'lucide-react';

interface TrajectoryPoint {
    x: number;
    y: number;
}

interface DynamicMask {
    id: string;
    maskFile: File | null;
    maskPreview: string | null;
    maskBase64: string | null;
    trajectories: TrajectoryPoint[];
    name: string;
}

interface DynamicMaskEditorProps {
    masks: DynamicMask[];
    onChange: (masks: DynamicMask[]) => void;
    maxMasks?: number;
    disabled?: boolean;
    inputImagePreview?: string | null;
}

export default function DynamicMaskEditor({
    masks,
    onChange,
    maxMasks = 6,
    disabled = false,
    inputImagePreview
}: DynamicMaskEditorProps) {
    const [selectedMaskId, setSelectedMaskId] = useState<string | null>(null);
    const [isDrawingTrajectory, setIsDrawingTrajectory] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addNewMask = () => {
        if (masks.length >= maxMasks) {
            alert(`Maximum ${maxMasks} masks allowed`);
            return;
        }

        const newMask: DynamicMask = {
            id: `mask-${Date.now()}`,
            maskFile: null,
            maskPreview: null,
            maskBase64: null,
            trajectories: [],
            name: `Dynamic Mask ${masks.length + 1}`
        };

        onChange([...masks, newMask]);
        setSelectedMaskId(newMask.id);
    };

    const removeMask = (maskId: string) => {
        const updatedMasks = masks.filter(mask => mask.id !== maskId);
        onChange(updatedMasks);

        if (selectedMaskId === maskId) {
            setSelectedMaskId(updatedMasks.length > 0 ? updatedMasks[0].id : null);
        }
    };

    const updateMask = (maskId: string, updates: Partial<DynamicMask>) => {
        const updatedMasks = masks.map(mask =>
            mask.id === maskId ? { ...mask, ...updates } : mask
        );
        onChange(updatedMasks);
    };

    const handleMaskUpload = useCallback((file: File, maskId: string) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('Image file size should be less than 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const base64 = dataUrl.split(',')[1] || dataUrl;

            updateMask(maskId, {
                maskFile: file,
                maskPreview: dataUrl,
                maskBase64: base64
            });
        };
        reader.readAsDataURL(file);
    }, [updateMask]);

    const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawingTrajectory || !selectedMaskId) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = Math.round((event.clientX - rect.left) * scaleX);
        const y = Math.round((event.clientY - rect.top) * scaleY);

        const selectedMask = masks.find(mask => mask.id === selectedMaskId);
        if (!selectedMask) return;

        const newTrajectories = [...selectedMask.trajectories, { x, y }];

        // Limit to 77 points for 5-second videos
        if (newTrajectories.length > 77) {
            alert('Maximum 77 trajectory points allowed for 5-second videos');
            return;
        }

        updateMask(selectedMaskId, { trajectories: newTrajectories });
        redrawCanvas();
    }, [isDrawingTrajectory, selectedMaskId, masks, updateMask]);

    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !inputImagePreview) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw input image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Draw all trajectories
            masks.forEach((mask, maskIndex) => {
                if (mask.trajectories.length === 0) return;

                // Set trajectory color
                const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
                ctx.strokeStyle = colors[maskIndex % colors.length];
                ctx.fillStyle = ctx.strokeStyle;
                ctx.lineWidth = 3;

                // Draw trajectory line
                if (mask.trajectories.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(mask.trajectories[0].x, mask.trajectories[0].y);

                    for (let i = 1; i < mask.trajectories.length; i++) {
                        ctx.lineTo(mask.trajectories[i].x, mask.trajectories[i].y);
                    }

                    ctx.stroke();
                }

                // Draw trajectory points
                mask.trajectories.forEach((point, pointIndex) => {
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, pointIndex === 0 ? 8 : 5, 0, 2 * Math.PI);
                    ctx.fill();

                    // Add point number
                    ctx.fillStyle = 'white';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText((pointIndex + 1).toString(), point.x, point.y + 4);
                    ctx.fillStyle = ctx.strokeStyle;
                });
            });

            // Highlight selected mask
            const selectedMask = masks.find(mask => mask.id === selectedMaskId);
            if (selectedMask && selectedMask.trajectories.length > 0) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 5;
                ctx.setLineDash([5, 5]);

                if (selectedMask.trajectories.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(selectedMask.trajectories[0].x, selectedMask.trajectories[0].y);

                    for (let i = 1; i < selectedMask.trajectories.length; i++) {
                        ctx.lineTo(selectedMask.trajectories[i].x, selectedMask.trajectories[i].y);
                    }

                    ctx.stroke();
                }

                ctx.setLineDash([]);
            }
        };
        img.src = inputImagePreview;
    }, [masks, selectedMaskId, inputImagePreview]);

    const clearTrajectory = (maskId: string) => {
        updateMask(maskId, { trajectories: [] });
        redrawCanvas();
    };

    const selectedMask = masks.find(mask => mask.id === selectedMaskId);

    // Redraw canvas when masks or selection changes
    React.useEffect(() => {
        redrawCanvas();
    }, [redrawCanvas]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-purple-400 font-semibold text-lg">🎯 Dynamic Mask Editor</h3>
                <button
                    onClick={addNewMask}
                    disabled={disabled || masks.length >= maxMasks}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                >
                    <Upload size={14} />
                    Add Mask ({masks.length}/{maxMasks})
                </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-300 font-semibold mb-2">📋 Instructions</h4>
                <div className="text-xs text-gray-300 space-y-1">
                    <p><strong>1. Upload Mask:</strong> Black and white image where white = moving area</p>
                    <p><strong>2. Draw Trajectory:</strong> Click points to define motion path (max 77 points)</p>
                    <p><strong>3. Order Matters:</strong> First point = start, last point = end of motion</p>
                    <p><strong>4. Coordinate System:</strong> Bottom-left corner = origin (0,0)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mask List */}
                <div className="space-y-4">
                    <h4 className="text-purple-300 font-semibold">Mask List</h4>

                    {masks.length === 0 ? (
                        <div className="border border-purple-500/30 rounded-lg p-6 text-center">
                            <div className="text-purple-400 text-4xl mb-2">🎭</div>
                            <p className="text-purple-300 text-sm mb-2">No dynamic masks created</p>
                            <p className="text-gray-400 text-xs">Add masks to define specific motion trajectories</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {masks.map((mask, index) => (
                                <div
                                    key={mask.id}
                                    className={`border rounded-lg p-4 transition-all cursor-pointer ${selectedMaskId === mask.id
                                        ? 'border-purple-500 bg-purple-500/20'
                                        : 'border-purple-500/30 hover:border-purple-400'
                                        }`}
                                    onClick={() => setSelectedMaskId(mask.id)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-purple-300 font-medium text-sm">
                                            {mask.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">
                                                {mask.trajectories.length}/77 points
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    clearTrajectory(mask.id);
                                                }}
                                                className="p-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
                                                title="Clear trajectory"
                                            >
                                                <RotateCcw size={12} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeMask(mask.id);
                                                }}
                                                className="p-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mask Image Upload */}
                                    {!mask.maskPreview ? (
                                        <div
                                            className="border-2 border-dashed border-purple-500/50 rounded p-3 text-center hover:border-purple-400 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleMaskUpload(file, mask.id);
                                                }}
                                                className="hidden"
                                            />
                                            <Upload className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                                            <p className="text-xs text-purple-200">Upload mask image</p>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <img
                                                src={mask.maskPreview}
                                                alt={`Mask ${index + 1}`}
                                                className="w-full h-20 object-cover rounded border"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateMask(mask.id, {
                                                        maskFile: null,
                                                        maskPreview: null,
                                                        maskBase64: null
                                                    });
                                                }}
                                                className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Trajectory Info */}
                                    <div className="mt-2 text-xs text-gray-400">
                                        <p>Trajectory: {mask.trajectories.length} points</p>
                                        {mask.trajectories.length > 0 && (
                                            <p>
                                                Start: ({mask.trajectories[0].x}, {mask.trajectories[0].y})
                                                {mask.trajectories.length > 1 && (
                                                    <span>
                                                        {' → '}End: ({mask.trajectories[mask.trajectories.length - 1].x}, {mask.trajectories[mask.trajectories.length - 1].y})
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Trajectory Editor */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-purple-300 font-semibold">Trajectory Editor</h4>
                        <button
                            onClick={() => setIsDrawingTrajectory(!isDrawingTrajectory)}
                            disabled={!selectedMask || !inputImagePreview}
                            className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${isDrawingTrajectory
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50'
                                }`}
                        >
                            {isDrawingTrajectory ? (
                                <>
                                    <X size={14} />
                                    Stop Drawing
                                </>
                            ) : (
                                <>
                                    <Play size={14} />
                                    Start Drawing
                                </>
                            )}
                        </button>
                    </div>

                    {inputImagePreview ? (
                        <div className="relative">
                            <canvas
                                ref={canvasRef}
                                width={400}
                                height={300}
                                className={`w-full border rounded-lg ${isDrawingTrajectory ? 'cursor-crosshair' : 'cursor-default'
                                    }`}
                                onClick={handleCanvasClick}
                            />

                            {isDrawingTrajectory && (
                                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                                    Click to add trajectory points
                                    {selectedMask && (
                                        <span className="block">
                                            {selectedMask.trajectories.length}/77 points
                                        </span>
                                    )}
                                </div>
                            )}

                            {selectedMask && selectedMask.trajectories.length > 0 && (
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                                    {selectedMask.name}: {selectedMask.trajectories.length} points
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="border border-gray-600 rounded-lg p-8 text-center">
                            <div className="text-gray-400 text-4xl mb-2">🖼️</div>
                            <p className="text-gray-400 text-sm">Upload an input image to start editing trajectories</p>
                        </div>
                    )}

                    {selectedMask && (
                        <div className="bg-gray-800 rounded-lg p-3">
                            <h5 className="text-purple-300 font-semibold text-sm mb-2">
                                Selected: {selectedMask.name}
                            </h5>
                            <div className="text-xs text-gray-300 space-y-1">
                                <p><strong>Mask Status:</strong> {selectedMask.maskBase64 ? 'Uploaded ✅' : 'Not uploaded ❌'}</p>
                                <p><strong>Trajectory:</strong> {selectedMask.trajectories.length} points</p>
                                <p><strong>Valid:</strong> {selectedMask.maskBase64 && selectedMask.trajectories.length >= 2 ? 'Yes ✅' : 'No ❌'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Export Summary */}
            {masks.length > 0 && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <h4 className="text-green-300 font-semibold mb-2">📊 Export Summary</h4>
                    <div className="text-xs text-gray-300 space-y-1">
                        <p><strong>Total Masks:</strong> {masks.length}/{maxMasks}</p>
                        <p><strong>Valid Masks:</strong> {masks.filter(m => m.maskBase64 && m.trajectories.length >= 2).length}</p>
                        <p><strong>Total Trajectory Points:</strong> {masks.reduce((sum, m) => sum + m.trajectories.length, 0)}</p>
                        {masks.some(m => m.trajectories.length > 77) && (
                            <p className="text-red-400"><strong>⚠️ Warning:</strong> Some masks exceed 77 point limit</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}