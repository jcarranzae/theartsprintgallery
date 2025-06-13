'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import KlingModelSelector from './KlingModelSelector';
import KlingImageToVideoInput from './KlingImageToVideoInput';
import I2VAdvancedSettings from './I2VAdvancedSettings';
import KlingVideoViewer from './KlingVideoViewer';

const models = [
    {
        label: 'Kling V2 Master (I2V)',
        value: 'kling-v2-master',
        description: 'Latest model with superior image-to-video quality and motion understanding'
    },
    {
        label: 'Kling V1.6 (I2V)',
        value: 'kling-v1-6',
        description: 'Enhanced V1 model with improved motion coherence from images'
    },
    {
        label: 'Kling V1 (I2V)',
        value: 'kling-v1',
        description: 'Original model, fast and reliable for standard image-to-video conversion'
    },
];

const aspectRatios = [
    { label: '16:9 (Landscape)', value: '16:9' },
    { label: '9:16 (Portrait)', value: '9:16' },
    { label: '1:1 (Square)', value: '1:1' },
];

const durations = [
    { label: '5 seconds', value: '5' },
    { label: '10 seconds', value: '10' },
];

const modes = [
    { label: 'Standard Mode (Cost-effective)', value: 'std' },
    { label: 'Professional Mode (Higher quality)', value: 'pro' },
];

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

export default function KlingImageToVideoGenerator() {
    const [selectedModel, setSelectedModel] = useState(models[0].value);

    // Main input image
    const [inputImage, setInputImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    // Prompts
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');

    // Generation state
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [generationStatus, setGenerationStatus] = useState<string>('');
    const [generationProgress, setGenerationProgress] = useState<number>(0);
    const [videoDuration, setVideoDuration] = useState<string>('');

    // Advanced settings
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [cfgScale, setCfgScale] = useState<number>(0.5);
    const [aspectRatio, setAspectRatio] = useState<string>('16:9');
    const [duration, setDuration] = useState<string>('5');
    const [mode, setMode] = useState<string>('std');
    const [cameraControl, setCameraControl] = useState<CameraControl | null>(null);
    const [externalTaskId, setExternalTaskId] = useState<string>('');

    // Advanced I2V features
    const [imageTail, setImageTail] = useState<ImageData>({ file: null, preview: null, base64: null });
    const [staticMask, setStaticMask] = useState<ImageData>({ file: null, preview: null, base64: null });
    const [dynamicMasks, setDynamicMasks] = useState<MaskData[]>([]);
    const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);

    const handleImageUpload = (file: File, preview: string, base64: string) => {
        setInputImage(file);
        setImagePreview(preview);
        setImageBase64(base64);
    };

    const handleImageTailUpload = (file: File | null, preview: string | null, base64: string | null) => {
        setImageTail({ file, preview, base64 });
    };

    const handleStaticMaskUpload = (file: File | null, preview: string | null, base64: string | null) => {
        setStaticMask({ file, preview, base64 });
    };

    const handleDynamicMasksChange = (masks: MaskData[]) => {
        setDynamicMasks(masks);
    };

    const validateGeneration = (): { valid: boolean; error?: string } => {
        // Check required fields
        if (!inputImage && !imageTail.file) {
            return { valid: false, error: 'At least one image (main or end frame) is required' };
        }

        if (!prompt.trim()) {
            return { valid: false, error: 'Motion prompt is required' };
        }

        // Check conflicting features
        const hasImageTail = !!imageTail.base64;
        const hasMasks = !!staticMask.base64 || dynamicMasks.some(m => m.base64);
        const hasCameraControl = !!cameraControl;

        if (hasImageTail && (hasMasks || hasCameraControl)) {
            return {
                valid: false,
                error: 'End frame control cannot be used with Motion Brush or Camera Controls'
            };
        }

        // Check model compatibility for dynamic masks
        if (dynamicMasks.length > 0 && selectedModel !== 'kling-v1') {
            return {
                valid: false,
                error: 'Dynamic masks are currently only supported by kling-v1 model'
            };
        }

        return { valid: true };
    };

    const handleSubmit = async () => {
        const validation = validateGeneration();
        if (!validation.valid) {
            return alert(`Validation Error: ${validation.error}`);
        }

        setLoading(true);
        setResult(null);
        setTaskId(null);
        setGenerationStatus('Initializing...');
        setGenerationProgress(0);
        setVideoDuration('');
        setShowAdvanced(false);

        try {
            setGenerationStatus('Creating image-to-video generation task...');

            // Build payload
            const payload: any = {
                model_name: selectedModel,
                prompt,
                negative_prompt: negativePrompt || undefined,
                cfg_scale: cfgScale,
                mode,
                duration,
                external_task_id: externalTaskId || undefined,
                generation_type: 'image_to_video'
            };

            // Add main image
            if (imageBase64) {
                payload.input_image = imageBase64;
            }

            // Add image_tail if provided
            if (imageTail.base64) {
                payload.image_tail = imageTail.base64;
            }

            // Add static mask if provided
            if (staticMask.base64) {
                payload.static_mask = staticMask.base64;
            }

            // Add dynamic masks if provided
            if (dynamicMasks.length > 0) {
                payload.dynamic_masks = dynamicMasks
                    .filter(mask => mask.base64)
                    .map(mask => ({
                        mask: mask.base64,
                        trajectories: mask.trajectories || []
                    }));
            }

            // Add camera control if provided (and no conflicting features)
            if (cameraControl && !imageTail.base64 && !staticMask.base64 && dynamicMasks.length === 0) {
                payload.camera_control = cameraControl;
            }

            console.log('🎬 Kling I2V Generation Request:', {
                model: selectedModel,
                prompt: prompt.substring(0, 100) + '...',
                mode,
                duration: duration + 's',
                hasMainImage: !!payload.input_image,
                hasImageTail: !!payload.image_tail,
                hasStaticMask: !!payload.static_mask,
                hasDynamicMasks: (payload.dynamic_masks || []).length > 0,
                hasCameraControl: !!payload.camera_control
            });

            const response = await fetch('/api/generate-kling-i2v', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!data.success) {
                setLoading(false);
                setGenerationStatus(`Error: ${data.error}`);
                return alert(`Error: ${data.error}\nDetails: ${data.details || 'Unknown error'}`);
            }

            const id = data.data.task_id;
            setTaskId(id);
            setGenerationStatus('Image-to-video generation started...');

            // Polling para obtener resultado
            let attempts = 0;
            const maxAttempts = 100; // Más tiempo para I2V (5 minutos)

            while (attempts < maxAttempts) {
                attempts++;
                await new Promise((res) => setTimeout(res, 3000)); // 3 segundos entre checks

                const pollResponse = await fetch(`/api/check-kling/${id}`);
                const pollData = await pollResponse.json();

                if (pollData.success) {
                    setGenerationStatus(pollData.status);
                    setGenerationProgress(pollData.progress * 100);

                    if (pollData.completed && pollData.status === 'succeed') {
                        if (pollData.videoData) {
                            setGenerationStatus('Video ready!');
                            setResult(pollData.videoData.url);
                            setVideoDuration(pollData.videoData.duration);
                            setGenerationProgress(100);
                            console.log('✅ I2V generation completed:', pollData.videoData.url);
                        } else {
                            throw new Error('No video data in completed response');
                        }
                        break;
                    } else if (pollData.failed) {
                        setGenerationStatus(`Failed: ${pollData.status_message || 'Unknown error'}`);
                        alert(`Image-to-video generation failed: ${pollData.status_message || 'Unknown error'}. Please try again.`);
                        break;
                    }
                } else {
                    console.error('Poll error:', pollData);
                }

                if (attempts >= maxAttempts) {
                    setGenerationStatus('Timeout');
                    alert('Image-to-video generation timeout. Please try again or check your task status later.');
                }
            }
        } catch (error) {
            console.error('Generation error:', error);
            setGenerationStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            alert('Error during image-to-video generation. Please try again.');
        }

        setLoading(false);
        if (!result) {
            setGenerationStatus('');
            setGenerationProgress(0);
            setTaskId(null);
        }
    };

    const handleAdvancedChange = (field: string, value: any) => {
        switch (field) {
            case 'cfgScale': setCfgScale(value); break;
            case 'aspectRatio': setAspectRatio(value); break;
            case 'duration': setDuration(value); break;
            case 'mode': setMode(value); break;
            case 'cameraControl': setCameraControl(value); break;
            case 'externalTaskId': setExternalTaskId(value); break;
        }
    };

    // Check if generation is ready
    const isGenerationReady = () => {
        const hasMainImage = !!inputImage;
        const hasImageTail = !!imageTail.file;
        const hasPrompt = !!prompt.trim();

        return (hasMainImage || hasImageTail) && hasPrompt;
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 w-full"
            style={{
                background: "linear-gradient(140deg, #1C228C 0%, #2C2A59 60%, #060826 100%)",
            }}
        >
            {/* Panel izquierdo - Controles */}
            <div className="flex-1 space-y-4 max-w-xl mx-auto lg:mx-0 p-6">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        🖼️➡️🎬 <span className="text-[#8C1AD9]">Kling I2V</span> Generator
                    </h1>
                    <p className="text-gray-300">
                        Transform static images into dynamic AI-generated videos
                    </p>

                    {/* Advanced Features Toggle */}
                    <div className="mt-4">
                        <button
                            onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${showAdvancedFeatures
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                                }`}
                        >
                            {showAdvancedFeatures ? '🔧 Hide Advanced Features' : '✨ Show Advanced Features'}
                        </button>
                        {showAdvancedFeatures && (
                            <p className="text-xs text-gray-400 mt-1">
                                Access Motion Brush, End Frame Control, and advanced I2V options
                            </p>
                        )}
                    </div>
                </div>

                <div className="text-[#8C1AD9] font-semibold text-lg">
                    <KlingModelSelector
                        models={models}
                        value={selectedModel}
                        onChange={setSelectedModel}
                    />
                </div>

                <div className="text-[#8C1AD9] font-semibold text-lg">
                    <KlingImageToVideoInput
                        inputImage={inputImage}
                        imagePreview={imagePreview}
                        onImageUpload={handleImageUpload}
                        prompt={prompt}
                        onChangePrompt={setPrompt}
                        negativePrompt={negativePrompt}
                        onChangeNegativePrompt={setNegativePrompt}
                        imageTail={imageTail}
                        onImageTailUpload={handleImageTailUpload}
                        staticMask={staticMask}
                        onStaticMaskUpload={handleStaticMaskUpload}
                        dynamicMasks={dynamicMasks}
                        onDynamicMasksChange={handleDynamicMasksChange}
                        showAdvancedFeatures={showAdvancedFeatures}
                    />
                </div>

                <div className="text-[#8C1AD9] font-semibold text-lg">
                    <I2VAdvancedSettings
                        show={showAdvanced}
                        onToggle={() => setShowAdvanced(!showAdvanced)}
                        cfgScale={cfgScale}
                        aspectRatio={aspectRatio}
                        aspectRatios={aspectRatios}
                        duration={duration}
                        durations={durations}
                        mode={mode}
                        modes={modes}
                        cameraControl={cameraControl}
                        externalTaskId={externalTaskId}
                        onChange={handleAdvancedChange}
                        selectedModel={selectedModel}
                        hasImageTail={!!imageTail.base64}
                        hasStaticMask={!!staticMask.base64}
                        hasDynamicMasks={dynamicMasks.some(m => m.base64)}
                        dynamicMasksCount={dynamicMasks.filter(m => m.base64).length}
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !isGenerationReady()}
                    className="w-full bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] text-white py-3 px-4 rounded-lg font-semibold hover:from-[#7B16C2] hover:to-[#1C228C] disabled:opacity-50 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg"
                    style={{
                        boxShadow: "0 0 16px 3px #8C1AD9",
                        borderRadius: "12px",
                    }}
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin mr-2" />
                            Generating I2V with {models.find(m => m.value === selectedModel)?.label}...
                        </>
                    ) : (
                        `🚀 Generate Video from Image with ${models.find(m => m.value === selectedModel)?.label}`
                    )}
                </button>

                {(taskId && loading) && (
                    <div className="text-center p-6 bg-zinc-900 rounded-lg border border-[#8C1AD9]/30">
                        <div className="mb-4">
                            <p className="text-[#8C1AD9] font-semibold text-lg">Task ID: {taskId}</p>
                            <p className="text-gray-300 text-sm mt-1">Status: {generationStatus}</p>
                            <p className="text-cyan-400 text-sm mt-1">
                                🎥 {duration}s video in {aspectRatio} format from image
                            </p>

                            {/* Feature indicators */}
                            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                                {imageTail.base64 && (
                                    <span className="text-orange-400 text-xs px-2 py-1 bg-orange-900/20 rounded">
                                        🎯 End Frame
                                    </span>
                                )}
                                {staticMask.base64 && (
                                    <span className="text-cyan-400 text-xs px-2 py-1 bg-cyan-900/20 rounded">
                                        🖌️ Static Mask
                                    </span>
                                )}
                                {dynamicMasks.length > 0 && (
                                    <span className="text-purple-400 text-xs px-2 py-1 bg-purple-900/20 rounded">
                                        🎯 Dynamic Masks ({dynamicMasks.length})
                                    </span>
                                )}
                                {cameraControl && (
                                    <span className="text-green-400 text-xs px-2 py-1 bg-green-900/20 rounded">
                                        📹 Camera: {cameraControl.type.replace('_', ' ')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-zinc-800 rounded-full h-3 mb-4">
                            <div
                                className="bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] h-3 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${generationProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-gray-400 text-sm">{Math.round(generationProgress)}% complete</p>

                        <div className="mt-4 flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin text-[#8C1AD9]" size={20} />
                            <span className="text-gray-300 text-sm">
                                Converting image to {duration}s video...
                            </span>
                        </div>

                        <div className="mt-4 text-yellow-400 text-xs">
                            ⏱️ Image-to-video generation typically takes 3-5 minutes
                        </div>

                        {/* Preview de la imagen durante generación */}
                        {imagePreview && (
                            <div className="mt-4 flex justify-center">
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Input"
                                        className="w-32 h-32 object-cover rounded-lg border-2 border-[#8C1AD9]/50"
                                    />
                                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                        Input
                                    </div>
                                    {imageTail.preview && (
                                        <img
                                            src={imageTail.preview}
                                            alt="Target"
                                            className="w-16 h-16 object-cover rounded-lg border-2 border-orange-400/50 absolute -bottom-2 -right-2"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Panel derecho - Vista previa del video */}
            <div className="flex-1 flex items-center justify-center p-6">
                <KlingVideoViewer
                    videoUrl={result}
                    prompt={prompt}
                    model={selectedModel}
                    taskId={taskId}
                    duration={videoDuration}
                    aspectRatio={aspectRatio}
                    inputImage={imagePreview}
                />
            </div>
        </div>
    );
}