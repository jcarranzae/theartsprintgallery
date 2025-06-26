'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import KlingModelSelector from './KlingModelSelector';
import KlingPromptInput from './KlingPromptInput';
import KlingAdvancedSettings from './KlingAdvancedSettings';
import KlingVideoViewer from './KlingVideoViewer';

const models = [
    {
        label: 'Kling V2 Master',
        value: 'kling-v2-master',
        description: 'Latest and most advanced model with superior quality and understanding'
    },
    {
        label: 'Kling V1.6',
        value: 'kling-v1-6',
        description: 'Enhanced V1 model with improved motion and coherence'
    },
    {
        label: 'Kling V1',
        value: 'kling-v1',
        description: 'Original model, fast and reliable for standard video generation'
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

export default function KlingVideoGenerator() {
    const [selectedModel, setSelectedModel] = useState(models[0].value);
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
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

    const handleSubmit = async () => {
        if (!prompt) return alert('Please enter a prompt');

        setLoading(true);
        setResult(null);
        setTaskId(null);
        setGenerationStatus('Initializing...');
        setGenerationProgress(0);
        setVideoDuration('');
        setShowAdvanced(false);

        try {
            // Paso 1: Crear tarea de generación
            setGenerationStatus('Creating video generation task...');

            const payload = {
                model_name: selectedModel,
                prompt,
                negative_prompt: negativePrompt || undefined,
                cfg_scale: cfgScale,
                mode,
                camera_control: cameraControl,
                aspect_ratio: aspectRatio,
                duration,
                external_task_id: externalTaskId || undefined
            };

            console.log('🎬 Kling Generation Request:', {
                model: selectedModel,
                prompt: prompt.substring(0, 100) + '...',
                mode,
                duration: duration + 's',
                aspect_ratio: aspectRatio,
                has_camera_control: !!cameraControl
            });

            const response = await fetch('/api/generate-kling', {
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
            setGenerationStatus('Video generation started...');

            // Paso 2: Polling para obtener resultado
            let attempts = 0;
            const maxAttempts = 90; // Más tiempo para videos (4 minutos)

            while (attempts < maxAttempts) {
                attempts++;
                await new Promise((res) => setTimeout(res, 3000)); // 3 segundos entre checks

                const pollResponse = await fetch(`/api/check-kling/${id}`);
                const pollData = await pollResponse.json();

                if (pollData.success) {
                    // Actualizar estado y progreso
                    setGenerationStatus(pollData.status);
                    setGenerationProgress(pollData.progress * 100);

                    if (pollData.completed && pollData.status === 'succeed') {
                        if (pollData.videoData) {
                            setGenerationStatus('Video ready!');
                            setResult(pollData.videoData.url);
                            setVideoDuration(pollData.videoData.duration);
                            setGenerationProgress(100);
                            console.log('✅ Video generation completed:', pollData.videoData.url);
                        } else {
                            throw new Error('No video data in completed response');
                        }
                        break;
                    } else if (pollData.failed) {
                        setGenerationStatus(`Failed: ${pollData.status_message || 'Unknown error'}`);
                        alert(`Video generation failed: ${pollData.status_message || 'Unknown error'}. Please try again.`);
                        break;
                    }
                    // Si está processing, continuar polling
                } else {
                    console.error('Poll error:', pollData);
                }

                if (attempts >= maxAttempts) {
                    setGenerationStatus('Timeout');
                    alert('Video generation timeout. Please try again or check your task status later.');
                }
            }
        } catch (error) {
            console.error('Generation error:', error);
            setGenerationStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            alert('Error during video generation. Please try again.');
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
                        🎬 <span className="text-[#8C1AD9]">Kling 2.0</span> Video Generator
                    </h1>
                    <p className="text-gray-300">
                        Advanced AI video generation with text-to-video capabilities
                    </p>
                </div>

                <div className="text-[#8C1AD9] font-semibold text-lg">
                    <KlingModelSelector
                        models={models}
                        value={selectedModel}
                        onChange={setSelectedModel}
                    />
                </div>

                <div className="text-[#8C1AD9] font-semibold text-lg">
                    <KlingPromptInput
                        prompt={prompt}
                        onChangePrompt={setPrompt}
                        negativePrompt={negativePrompt}
                        onChangeNegativePrompt={setNegativePrompt}
                    />
                </div>

                <div className="text-[#8C1AD9] font-semibold text-lg">
                    <KlingAdvancedSettings
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
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !prompt}
                    className="w-full bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] text-white py-3 px-4 rounded-lg font-semibold hover:from-[#7B16C2] hover:to-[#1C228C] disabled:opacity-50 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg"
                    style={{
                        boxShadow: "0 0 16px 3px #8C1AD9",
                        borderRadius: "12px",
                    }}
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin mr-2" />
                            Generating with {models.find(m => m.value === selectedModel)?.label}...
                        </>
                    ) : (
                        `🚀 Generate Video with ${models.find(m => m.value === selectedModel)?.label}`
                    )}
                </button>

                {(taskId && loading) && (
                    <div className="text-center p-6 bg-zinc-900 rounded-lg border border-[#8C1AD9]/30">
                        <div className="mb-4">
                            <p className="text-[#8C1AD9] font-semibold text-lg">Task ID: {taskId}</p>
                            <p className="text-gray-300 text-sm mt-1">Status: {generationStatus}</p>
                            <p className="text-cyan-400 text-sm mt-1">
                                🎥 {duration}s video in {aspectRatio} format
                            </p>
                            {cameraControl && (
                                <p className="text-green-400 text-sm mt-1">
                                    📹 Camera: {cameraControl.type.replace('_', ' ')}
                                </p>
                            )}
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
                                Generating {duration}s video with {models.find(m => m.value === selectedModel)?.label}...
                            </span>
                        </div>

                        <div className="mt-4 text-yellow-400 text-xs">
                            ⏱️ Video generation typically takes 2-4 minutes
                        </div>
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
                    mode={mode}
                    cfgScale={cfgScale}
                    cameraControl={cameraControl}
                />
            </div>
        </div>
    );
}