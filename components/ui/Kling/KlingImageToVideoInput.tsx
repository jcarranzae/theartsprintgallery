'use client';

import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';

interface ImageData {
    file: File | null;
    preview: string | null;
    base64: string | null;
}

interface MaskData {
    file: File | null;
    preview: string | null;
    base64: string | null;
    trajectories?: Array<{ x: number; y: number }>;
}

interface KlingImageToVideoInputProps {
    inputImage: File | null;
    imagePreview: string | null;
    onImageUpload: (file: File, preview: string, base64: string) => void;
    prompt: string;
    onChangePrompt: (val: string) => void;
    negativePrompt: string;
    onChangeNegativePrompt: (val: string) => void;
    // Advanced I2V features
    imageTail?: ImageData;
    onImageTailUpload?: (file: File | null, preview: string | null, base64: string | null) => void;
    staticMask?: ImageData;
    onStaticMaskUpload?: (file: File | null, preview: string | null, base64: string | null) => void;
    dynamicMasks?: MaskData[];
    onDynamicMasksChange?: (masks: MaskData[]) => void;
    showAdvancedFeatures?: boolean;
}

export default function KlingImageToVideoInput({
    inputImage,
    imagePreview,
    onImageUpload,
    prompt,
    onChangePrompt,
    negativePrompt,
    onChangeNegativePrompt,
    imageTail,
    onImageTailUpload,
    staticMask,
    onStaticMaskUpload,
    dynamicMasks = [],
    onDynamicMasksChange,
    showAdvancedFeatures = false
}: KlingImageToVideoInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageTailInputRef = useRef<HTMLInputElement>(null);
    const staticMaskInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'masks' | 'motion'>('basic');

    const handleFileSelect = (file: File, type: 'main' | 'tail' | 'static_mask' = 'main') => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Image file size should be less than 10MB');
            return;
        }

        // Create preview and base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const preview = dataUrl;

            // Extract pure base64 without data:image/...;base64, prefix
            const base64 = dataUrl.split(',')[1] || dataUrl;

            switch (type) {
                case 'main':
                    onImageUpload(file, preview, base64);
                    break;
                case 'tail':
                    onImageTailUpload?.(file, preview, base64);
                    break;
                case 'static_mask':
                    onStaticMaskUpload?.(file, preview, base64);
                    break;
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent, type: 'main' | 'tail' | 'static_mask' = 'main') => {
        e.preventDefault();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0], type);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'tail' | 'static_mask' = 'main') => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0], type);
        }
    };

    const removeImage = (type: 'main' | 'tail' | 'static_mask' = 'main') => {
        switch (type) {
            case 'main':
                onImageUpload(null as any, null as any, null as any);
                if (fileInputRef.current) fileInputRef.current.value = '';
                break;
            case 'tail':
                onImageTailUpload?.(null, null, null);
                if (imageTailInputRef.current) imageTailInputRef.current.value = '';
                break;
            case 'static_mask':
                onStaticMaskUpload?.(null, null, null);
                if (staticMaskInputRef.current) staticMaskInputRef.current.value = '';
                break;
        }
    };

    const addDynamicMask = () => {
        if (dynamicMasks.length >= 6) {
            alert('Maximum 6 dynamic masks allowed');
            return;
        }

        const newMask: MaskData = {
            file: null,
            preview: null,
            base64: null,
            trajectories: []
        };

        onDynamicMasksChange?.([...dynamicMasks, newMask]);
    };

    const removeDynamicMask = (index: number) => {
        const updated = dynamicMasks.filter((_, i) => i !== index);
        onDynamicMasksChange?.(updated);
    };

    return (
        <div className="space-y-4">
            {/* Tabs for different I2V features */}
            {showAdvancedFeatures && (
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveTab('basic')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'basic'
                                ? 'bg-[#8C1AD9] text-white'
                                : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                            }`}
                    >
                        🖼️ Basic I2V
                    </button>
                    <button
                        onClick={() => setActiveTab('masks')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'masks'
                                ? 'bg-[#8C1AD9] text-white'
                                : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                            }`}
                    >
                        🎭 Motion Brush
                    </button>
                    <button
                        onClick={() => setActiveTab('motion')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'motion'
                                ? 'bg-[#8C1AD9] text-white'
                                : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                            }`}
                    >
                        🎬 Advanced Motion
                    </button>
                </div>
            )}

            {/* Basic Image Upload Section */}
            {(activeTab === 'basic' || !showAdvancedFeatures) && (
                <>
                    <div className="space-y-2">
                        <label className="text-[#8C1AD9] font-semibold text-lg">
                            🖼️ Input Image {!showAdvancedFeatures && <span className="text-red-400">*</span>}
                        </label>

                        {!imagePreview ? (
                            <div
                                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                                    ${dragActive
                                        ? 'border-[#8C1AD9] bg-[#8C1AD9]/10'
                                        : 'border-gray-600 hover:border-[#8C1AD9]/50 hover:bg-zinc-800/50'
                                    }`}
                                onDrop={(e) => handleDrop(e, 'main')}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileInput(e, 'main')}
                                    className="hidden"
                                />

                                <div className="space-y-4">
                                    <div className="flex justify-center">
                                        <div className="p-4 bg-zinc-800 rounded-full">
                                            <Upload className="h-8 w-8 text-[#8C1AD9]" />
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-lg font-semibold text-white mb-2">
                                            Drop your image here or click to upload
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Supports JPG, PNG, WebP • Max 10MB • Min 300x300px • Ratio 1:2.5 to 2.5:1
                                        </p>
                                    </div>

                                    <div className="text-xs text-gray-500 space-y-1">
                                        <p>💡 <strong>Best results:</strong> High-quality images with clear subjects</p>
                                        <p>📐 <strong>Aspect ratios:</strong> Match your target video format</p>
                                        <p>🎯 <strong>Focus:</strong> Central subjects work better than complex scenes</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Input preview"
                                    className="w-full h-64 object-cover rounded-lg border-2 border-[#8C1AD9]"
                                />
                                <button
                                    onClick={() => removeImage('main')}
                                    className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                >
                                    <X size={16} />
                                </button>
                                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                                    {inputImage?.name} ({Math.round((inputImage?.size || 0) / 1024)}KB)
                                </div>
                            </div>
                        )}
                    </div>

                    {/* End Frame Control (image_tail) */}
                    {showAdvancedFeatures && (
                        <div className="space-y-2">
                            <label className="text-orange-400 font-semibold text-lg">
                                🎯 End Frame Control (Optional)
                            </label>
                            <p className="text-xs text-gray-400 mb-2">
                                ⚠️ Cannot be used with Motion Brush or Camera Controls
                            </p>

                            {!imageTail?.preview ? (
                                <div
                                    className="relative border-2 border-dashed border-orange-500/50 rounded-lg p-6 text-center transition-all cursor-pointer hover:border-orange-400 hover:bg-zinc-800/50"
                                    onDrop={(e) => handleDrop(e, 'tail')}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() => imageTailInputRef.current?.click()}
                                >
                                    <input
                                        ref={imageTailInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileInput(e, 'tail')}
                                        className="hidden"
                                    />

                                    <div className="space-y-2">
                                        <ImageIcon className="h-6 w-6 text-orange-400 mx-auto" />
                                        <p className="text-sm text-orange-200">Upload target end frame</p>
                                        <p className="text-xs text-gray-500">The video will transition from input to this image</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={imageTail.preview}
                                        alt="End frame preview"
                                        className="w-full h-32 object-cover rounded-lg border-2 border-orange-400"
                                    />
                                    <button
                                        onClick={() => removeImage('tail')}
                                        className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                    <div className="absolute bottom-1 left-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                                        End Frame
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Motion Brush Section */}
            {activeTab === 'masks' && showAdvancedFeatures && (
                <div className="space-y-4">
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="text-blue-300 font-semibold mb-2">🎭 Motion Brush Features</h4>
                        <div className="text-xs text-gray-300 space-y-1">
                            <p><strong>Static Brush:</strong> Mark areas that should remain still during generation</p>
                            <p><strong>Dynamic Brush:</strong> Define specific motion paths with trajectory coordinates</p>
                            <p><strong>Limitations:</strong> Cannot be used with end frame control or camera controls</p>
                            <p><strong>Models:</strong> Currently supported by kling-v1 in Standard and Professional modes</p>
                        </div>
                    </div>

                    {/* Static Mask */}
                    <div className="space-y-2">
                        <label className="text-cyan-400 font-semibold text-lg">
                            🖌️ Static Brush (Optional)
                        </label>
                        <p className="text-xs text-gray-400">Mark areas that should remain static/unchanged</p>

                        {!staticMask?.preview ? (
                            <div
                                className="relative border-2 border-dashed border-cyan-500/50 rounded-lg p-6 text-center transition-all cursor-pointer hover:border-cyan-400 hover:bg-zinc-800/50"
                                onDrop={(e) => handleDrop(e, 'static_mask')}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => staticMaskInputRef.current?.click()}
                            >
                                <input
                                    ref={staticMaskInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileInput(e, 'static_mask')}
                                    className="hidden"
                                />

                                <div className="space-y-2">
                                    <ImageIcon className="h-6 w-6 text-cyan-400 mx-auto" />
                                    <p className="text-sm text-cyan-200">Upload static mask image</p>
                                    <p className="text-xs text-gray-500">White areas = static, Black areas = can move</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <img
                                    src={staticMask.preview}
                                    alt="Static mask preview"
                                    className="w-full h-32 object-cover rounded-lg border-2 border-cyan-400"
                                />
                                <button
                                    onClick={() => removeImage('static_mask')}
                                    className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                >
                                    <X size={12} />
                                </button>
                                <div className="absolute bottom-1 left-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                                    Static Mask
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dynamic Masks */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-purple-400 font-semibold text-lg">
                                🎯 Dynamic Brushes (Optional)
                            </label>
                            <button
                                onClick={addDynamicMask}
                                disabled={dynamicMasks.length >= 6}
                                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                            >
                                <Plus size={14} />
                                Add Mask ({dynamicMasks.length}/6)
                            </button>
                        </div>

                        <p className="text-xs text-gray-400 mb-3">
                            Define specific motion paths with trajectory coordinates (max 6 masks)
                        </p>

                        {dynamicMasks.length === 0 ? (
                            <div className="border border-purple-500/30 rounded-lg p-6 text-center">
                                <div className="text-purple-400 text-4xl mb-2">🎯</div>
                                <p className="text-purple-300 text-sm mb-2">No dynamic masks added</p>
                                <p className="text-gray-400 text-xs">Add masks to define specific motion trajectories</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {dynamicMasks.map((mask, index) => (
                                    <div key={index} className="border border-purple-500/30 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-purple-300 font-medium text-sm">Dynamic Mask #{index + 1}</span>
                                            <button
                                                onClick={() => removeDynamicMask(index)}
                                                className="p-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>

                                        {/* Mask image upload would go here */}
                                        <div className="text-xs text-gray-400">
                                            <p>⚠️ Dynamic mask implementation requires trajectory coordinate system</p>
                                            <p>This feature needs additional UI for trajectory point selection</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Advanced Motion Section */}
            {activeTab === 'motion' && showAdvancedFeatures && (
                <div className="space-y-4">
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                        <h4 className="text-green-300 font-semibold mb-2">🎬 Advanced Motion Control</h4>
                        <div className="text-xs text-gray-300 space-y-1">
                            <p><strong>End Frame:</strong> Define exact final frame for precise transitions</p>
                            <p><strong>Camera Controls:</strong> Use predefined or custom camera movements</p>
                            <p><strong>Note:</strong> These features cannot be combined with Motion Brush</p>
                        </div>
                    </div>

                    <div className="text-center py-8 text-gray-400">
                        <p>🚧 Advanced motion controls are configured in the main settings panel</p>
                        <p className="text-xs mt-2">Camera controls and end frame options are available when Motion Brush is not used</p>
                    </div>
                </div>
            )}

            {/* Motion Prompt - Always visible */}
            <div className="space-y-2">
                <label className="text-[#8C1AD9] font-semibold text-lg">
                    🎬 Motion Prompt {!showAdvancedFeatures && <span className="text-red-400">*</span>}
                </label>
                <textarea
                    value={prompt}
                    onChange={(e) => onChangePrompt(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-lg bg-zinc-900 text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] shadow-md outline-none transition-all placeholder:text-[#8C1AD9]/50 resize-none"
                    placeholder="Describe how you want the image to move and animate. Be specific about motion, camera movement, and desired effects..."
                    maxLength={2500}
                />
                <div className="flex justify-between items-center text-xs">
                    <div className="text-gray-400 space-y-1">
                        <p className="flex items-center gap-2">
                            <span className="text-[#8C1AD9]">💡</span>
                            <span><strong>Tip:</strong> Describe motion that makes sense for your image</span>
                        </p>
                        <p className="text-gray-500">
                            Examples: "The person starts walking forward slowly" or "Camera slowly zooms in while leaves gently sway in the wind"
                        </p>
                    </div>
                    <span className={`${prompt.length > 2200 ? 'text-red-400' : 'text-gray-500'}`}>
                        {prompt.length}/2500
                    </span>
                </div>
            </div>

            {/* Negative Prompt - Always visible */}
            <div className="space-y-2">
                <label className="text-orange-400 font-semibold text-lg">
                    🚫 Negative Prompt (Optional)
                </label>
                <textarea
                    value={negativePrompt}
                    onChange={(e) => onChangeNegativePrompt(e.target.value)}
                    rows={2}
                    className="w-full p-3 rounded-lg bg-zinc-900 text-white border-2 border-orange-400 focus:ring-2 focus:ring-orange-400 shadow-md outline-none transition-all placeholder:text-orange-400/50 resize-none"
                    placeholder="Describe unwanted movements, effects, or quality issues (distortion, unnatural motion, blurry artifacts...)"
                    maxLength={2500}
                />
                <div className="flex justify-between items-center text-xs">
                    <div className="text-gray-400 space-y-1">
                        <p className="flex items-center gap-2">
                            <span className="text-orange-400">⚠️</span>
                            <span><strong>Avoid:</strong> Unnatural motion, distortion, or quality issues</span>
                        </p>
                        <p className="text-gray-500">
                            Common: "jerky motion, unnatural movement, distorted faces, blurry, artifacts, inconsistent lighting"
                        </p>
                    </div>
                    <span className={`${negativePrompt.length > 2200 ? 'text-red-400' : 'text-gray-500'}`}>
                        {negativePrompt.length}/2500
                    </span>
                </div>
            </div>

            {/* Image-to-Video Tips */}
            <div className="bg-gradient-to-r from-[#8C1AD9]/10 to-cyan-900/10 rounded-lg p-4 border border-[#8C1AD9]/30">
                <h4 className="text-cyan-300 font-semibold mb-2">🎯 Image-to-Video Tips</h4>
                <div className="text-xs text-gray-300 space-y-1">
                    <p><strong>Subject Motion:</strong> Describe how people, objects, or elements in the image should move</p>
                    <p><strong>Camera Movement:</strong> Specify camera motion (zoom, pan, tilt) relative to the image</p>
                    <p><strong>Environment:</strong> Add atmospheric effects (wind, water flow, lighting changes)</p>
                    <p><strong>Consistency:</strong> Ensure motion fits the scene and doesn't break image logic</p>
                    <p><strong>Duration:</strong> Plan motion that fills your chosen video length naturally</p>
                </div>
            </div>

            {/* Example Prompts for I2V */}
            {imagePreview && (activeTab === 'basic' || !showAdvancedFeatures) && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <h4 className="text-green-300 font-semibold mb-2">✨ Example Motion Prompts</h4>
                    <div className="space-y-2 text-xs">
                        <button
                            onClick={() => onChangePrompt("The person slowly turns their head and smiles, with natural facial expressions and smooth movement")}
                            className="w-full text-left p-2 bg-green-900/20 hover:bg-green-900/40 rounded text-green-200 transition-colors"
                        >
                            "The person slowly turns their head and smiles, with natural facial expressions and smooth movement"
                        </button>
                        <button
                            onClick={() => onChangePrompt("Camera slowly zooms in while maintaining focus, with subtle atmospheric movement in the background")}
                            className="w-full text-left p-2 bg-green-900/20 hover:bg-green-900/40 rounded text-green-200 transition-colors"
                        >
                            "Camera slowly zooms in while maintaining focus, with subtle atmospheric movement in the background"
                        </button>
                        <button
                            onClick={() => onChangePrompt("Gentle wind causes hair and clothing to flow naturally, with realistic physics and movement")}
                            className="w-full text-left p-2 bg-green-900/20 hover:bg-green-900/40 rounded text-green-200 transition-colors"
                        >
                            "Gentle wind causes hair and clothing to flow naturally, with realistic physics and movement"
                        </button>
                        <button
                            onClick={() => onChangePrompt("The scene comes to life with subtle parallax movement, creating depth and cinematic feel")}
                            className="w-full text-left p-2 bg-green-900/20 hover:bg-green-900/40 rounded text-green-200 transition-colors"
                        >
                            "The scene comes to life with subtle parallax movement, creating depth and cinematic feel"
                        </button>
                    </div>
                </div>
            )}

            {/* Feature Compatibility Warning */}
            {showAdvancedFeatures && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="text-yellow-300 font-semibold mb-2">⚠️ Feature Compatibility</h4>
                    <div className="text-xs text-gray-300 space-y-1">
                        <p><strong>Cannot combine:</strong> End frame control + Motion Brush + Camera controls</p>
                        <p><strong>Dynamic Brush:</strong> Currently supports kling-v1 model only (std/pro 5s)</p>
                        <p><strong>Mask requirements:</strong> Same aspect ratio and resolution as input image</p>
                        <p><strong>Trajectories:</strong> Max 77 coordinates for 5-second videos (2-77 range)</p>
                    </div>
                </div>
            )}
        </div>
    );
}