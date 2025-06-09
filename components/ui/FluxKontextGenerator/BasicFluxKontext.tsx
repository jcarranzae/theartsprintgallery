'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function BasicFluxKontext() {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [model, setModel] = useState<'kontext-pro' | 'kontext-max'>('kontext-pro');
    const [status, setStatus] = useState<string>('');
    const [progress, setProgress] = useState<number>(0);
    const [taskId, setTaskId] = useState<string | null>(null);

    const generateImage = async () => {
        if (!prompt.trim()) {
            alert('Please enter a prompt');
            return;
        }

        setLoading(true);
        setImageUrl(null);
        setStatus('Initializing...');
        setProgress(0);
        setTaskId(null);

        try {
            // Paso 1: Generar imagen
            setStatus('Creating generation task...');

            const endpoint = model === 'kontext-pro'
                ? '/api/generate-kontext-pro'
                : '/api/generate-kontext-max';

            const generateResponse = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    seed: Math.floor(Math.random() * 1000000),
                    aspect_ratio: '1:1',
                    output_format: 'png',
                    prompt_upsampling: false,
                    safety_tolerance: 2
                })
            });

            const generateData = await generateResponse.json();

            if (!generateResponse.ok || !generateData.success) {
                throw new Error(generateData.error || 'Generation failed');
            }

            const newTaskId = generateData.data?.id;
            if (!newTaskId) {
                throw new Error('No task ID received');
            }

            setTaskId(newTaskId);
            setStatus('Generation started...');

            // Paso 2: Polling
            let attempts = 0;
            const maxAttempts = 40;

            while (attempts < maxAttempts) {
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 3000));

                const pollResponse = await fetch(`/api/check-kontext/${newTaskId}`);
                const pollData = await pollResponse.json();

                if (pollData.success) {
                    setStatus(pollData.status);
                    setProgress(pollData.progress * 100);

                    if (pollData.completed && pollData.status === 'Ready') {
                        if (pollData.imageData) {
                            // CLAVE: Usar imageData directamente
                            setImageUrl(pollData.imageData);
                            setStatus('Completed!');
                            setProgress(100);
                            break;
                        } else {
                            throw new Error('No image data in completed response');
                        }
                    } else if (pollData.moderated) {
                        throw new Error(`Content moderated: ${pollData.status}`);
                    } else if (pollData.notFound) {
                        throw new Error('Task not found');
                    }
                }

                if (attempts >= maxAttempts) {
                    throw new Error('Generation timeout');
                }
            }

        } catch (error) {
            console.error('Generation error:', error);
            setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        setLoading(false);
    };

    const downloadImage = async () => {
        if (!imageUrl) return;

        try {
            if (imageUrl.startsWith('http')) {
                // URL externa - fetch y download
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `flux-kontext-${model}-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(url);
            } else {
                // Data URL - descarga directa
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = `flux-kontext-${model}-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Download failed. Try right-click → Save image as...');
        }
    };

    return (
        <div
            className="min-h-screen w-full p-6"
            style={{
                background: "linear-gradient(140deg, #1C228C 0%, #2C2A59 60%, #060826 100%)",
            }}
        >
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        🎯 <span className="text-[#8C1AD9]">Flux Kontext</span> Generator
                    </h1>
                    <p className="text-gray-300">
                        Advanced contextual image generation (Basic Working Version)
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Controls Panel */}
                    <div className="bg-zinc-900 rounded-2xl p-6 shadow-2xl"
                        style={{
                            boxShadow: "0 0 32px 8px rgba(140, 26, 217, 0.3)",
                        }}
                    >
                        {/* Model Selection */}
                        <div className="mb-6">
                            <label className="block text-[#8C1AD9] font-semibold text-lg mb-2">
                                🤖 Model
                            </label>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value as any)}
                                className="w-full p-3 rounded-lg bg-black text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] outline-none"
                            >
                                <option value="kontext-pro">FLUX Kontext Pro</option>
                                <option value="kontext-max">FLUX Kontext Max</option>
                            </select>
                        </div>

                        {/* Prompt Input */}
                        <div className="mb-6">
                            <label className="block text-[#8C1AD9] font-semibold text-lg mb-2">
                                ✨ Prompt
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={4}
                                placeholder="Describe the image you want to generate..."
                                className="w-full p-3 rounded-lg bg-black text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] outline-none resize-none placeholder:text-[#8C1AD9]/50"
                            />
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={generateImage}
                            disabled={loading || !prompt.trim()}
                            className="w-full bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] text-white py-3 px-6 rounded-lg font-semibold hover:from-[#7B16C2] hover:to-[#1C228C] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 mb-6"
                            style={{
                                boxShadow: "0 0 16px 3px #8C1AD9",
                            }}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Generating...</span>
                                </div>
                            ) : (
                                `🚀 Generate with ${model === 'kontext-pro' ? 'Kontext Pro' : 'Kontext Max'}`
                            )}
                        </button>

                        {/* Status Display */}
                        {(loading || status) && (
                            <div className="bg-zinc-800 rounded-lg p-4 border border-[#8C1AD9]/30">
                                <div className="mb-2">
                                    <p className="text-[#8C1AD9] font-semibold">Status: {status}</p>
                                    {taskId && (
                                        <p className="text-gray-400 text-sm">Task: {taskId}</p>
                                    )}
                                </div>

                                {progress > 0 && (
                                    <div className="w-full bg-zinc-700 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Image Display Panel */}
                    <div className="bg-zinc-900 rounded-2xl p-6 shadow-2xl"
                        style={{
                            boxShadow: "0 0 32px 8px rgba(140, 26, 217, 0.3)",
                        }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-[#8C1AD9]">Generated Image</h2>
                            {imageUrl && (
                                <button
                                    onClick={downloadImage}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    💾 Download
                                </button>
                            )}
                        </div>

                        <div className="border-2 border-dashed border-[#8C1AD9]/50 rounded-lg h-96 flex items-center justify-center">
                            {imageUrl ? (
                                <div className="w-full h-full flex items-center justify-center p-4">
                                    <img
                                        src={imageUrl}
                                        alt="Generated by Flux Kontext"
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                        onLoad={() => console.log('✅ Image loaded successfully')}
                                        onError={(e) => {
                                            console.error('❌ Image load error:', e);
                                            alert('Image failed to load. Check console for details.');
                                        }}
                                        crossOrigin="anonymous"
                                    />
                                </div>
                            ) : (
                                <div className="text-center text-gray-400">
                                    <div className="text-6xl mb-4">🎯</div>
                                    <h3 className="text-xl font-semibold text-[#8C1AD9] mb-2">
                                        Ready to Generate
                                    </h3>
                                    <p className="text-gray-300">
                                        Enter your prompt and click generate
                                    </p>
                                    {loading && (
                                        <div className="mt-4 flex items-center justify-center gap-2 text-[#8C1AD9]">
                                            <Loader2 className="animate-spin" size={16} />
                                            <span className="text-sm">Processing...</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {imageUrl && (
                            <div className="mt-4 text-center">
                                <a
                                    href={imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#8C1AD9] hover:text-purple-300 underline text-sm"
                                >
                                    🔗 Open in new tab
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}