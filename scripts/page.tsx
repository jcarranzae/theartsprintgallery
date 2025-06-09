'use client';

import { useState } from 'react';

export default function FixedBFLTest() {
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);

    const testAPI = async () => {
        setLoading(true);
        setResult('🧪 Testing BFL API (FIXED VERSION)...\n\n');
        setImageUrl(null);
        setTaskId(null);

        try {
            // Paso 1: Generar imagen
            setResult(prev => prev + '1. 🚀 Generating image...\n');

            const generateResponse = await fetch('/api/generate-kontext-pro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: 'A beautiful red rose on a wooden table, photorealistic, high quality, natural lighting',
                    seed: Math.floor(Math.random() * 1000000),
                    aspect_ratio: '1:1',
                    output_format: 'png'
                })
            });

            const generateData = await generateResponse.json();

            if (!generateResponse.ok || !generateData.success) {
                setResult(prev => prev + `❌ Generation failed: ${generateData.error}\n`);
                setLoading(false);
                return;
            }

            const newTaskId = generateData.data?.id;
            if (!newTaskId) {
                setResult(prev => prev + '❌ No task ID received\n');
                setLoading(false);
                return;
            }

            setTaskId(newTaskId);
            setResult(prev => prev + `✅ Task created: ${newTaskId}\n\n`);

            // Paso 2: Polling mejorado
            setResult(prev => prev + '2. 🔄 Polling for result...\n');

            let attempts = 0;
            const maxAttempts = 40; // 2 minutos máximo

            while (attempts < maxAttempts) {
                attempts++;

                await new Promise(resolve => setTimeout(resolve, 3000)); // 3 segundos

                setResult(prev => prev + `   🔍 Checking... (${attempts}/${maxAttempts})\n`);

                try {
                    const pollResponse = await fetch(`/api/check-kontext/${newTaskId}`);
                    const pollData = await pollResponse.json();

                    console.log('📋 Poll response:', pollData); // Debug log

                    if (!pollResponse.ok) {
                        setResult(prev => prev + `   ❌ Poll error: ${pollData.error}\n`);
                        continue;
                    }

                    setResult(prev => prev + `   Status: ${pollData.status} | Progress: ${Math.round((pollData.progress || 0) * 100)}%\n`);

                    if (pollData.completed && pollData.status === 'Ready') {
                        setResult(prev => prev + '✅ Image generation completed!\n\n');

                        // CLAVE: Procesar correctamente la imagen
                        setResult(prev => prev + '3. 🖼️ Processing image...\n');

                        if (pollData.imageData) {
                            setResult(prev => prev + `   Found imageData: ${pollData.imageData.substring(0, 50)}...\n`);

                            // La imageData ya es una URL completa
                            if (pollData.imageData.startsWith('http')) {
                                setImageUrl(pollData.imageData);
                                setResult(prev => prev + '   ✅ Image URL set successfully!\n');
                                console.log('🖼️ Image URL set:', pollData.imageData);
                            } else if (pollData.imageData.startsWith('data:image/')) {
                                setImageUrl(pollData.imageData);
                                setResult(prev => prev + '   ✅ Image data URL set successfully!\n');
                            } else {
                                // Es base64 sin prefijo
                                const dataUrl = `data:image/png;base64,${pollData.imageData}`;
                                setImageUrl(dataUrl);
                                setResult(prev => prev + '   ✅ Image base64 converted to data URL!\n');
                            }
                        } else {
                            setResult(prev => prev + '   ❌ No imageData found in response\n');
                            setResult(prev => prev + `   Available keys: ${Object.keys(pollData).join(', ')}\n`);
                        }

                        break;
                    } else if (pollData.moderated) {
                        setResult(prev => prev + `❌ Content moderated: ${pollData.status}\n`);
                        break;
                    } else if (pollData.notFound) {
                        setResult(prev => prev + '❌ Task not found\n');
                        break;
                    }
                    // Continuar si está pending

                } catch (pollError) {
                    console.error('Poll error:', pollError);
                    setResult(prev => prev + `   ❌ Poll request failed: ${pollError}\n`);
                }
            }

            if (attempts >= maxAttempts) {
                setResult(prev => prev + '❌ Timeout: Image generation took too long\n');
            }

        } catch (error) {
            console.error('Test error:', error);
            setResult(prev => prev + `❌ Network error: ${error}\n`);
        }

        setLoading(false);
    };

    const clearTest = () => {
        setResult('');
        setImageUrl(null);
        setTaskId(null);
    };

    const downloadImage = async () => {
        if (!imageUrl) return;

        try {
            if (imageUrl.startsWith('data:')) {
                // Es base64, descarga directa
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = `flux-kontext-${taskId || Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // Es URL externa, fetch y luego descarga
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `flux-kontext-${taskId || Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Download failed. Try right-click → Save image as...');
        }
    };

    const testImageLoad = () => {
        if (!imageUrl) return;

        const img = new Image();
        img.onload = () => {
            console.log('✅ Image loaded successfully');
            setResult(prev => prev + '   ✅ Image load test: SUCCESS\n');
        };
        img.onerror = (error) => {
            console.error('❌ Image failed to load:', error);
            setResult(prev => prev + '   ❌ Image load test: FAILED\n');
        };
        img.src = imageUrl;
    };

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">🔧 FIXED BFL API Tester</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Panel de Control */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Controls</h2>
                            <div className="space-x-2">
                                <button
                                    onClick={testAPI}
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {loading ? '🔄 Testing...' : '🚀 Test Fixed API'}
                                </button>
                                <button
                                    onClick={clearTest}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs h-96 overflow-y-auto">
                            <pre className="whitespace-pre-wrap">{result || 'Click "Test Fixed API" to start...'}</pre>
                        </div>

                        {taskId && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Task ID:</strong> {taskId}
                                </p>
                            </div>
                        )}

                        {imageUrl && (
                            <div className="mt-4 space-y-2">
                                <button
                                    onClick={testImageLoad}
                                    className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                                >
                                    🧪 Test Image Load
                                </button>
                                <div className="text-xs text-gray-600 break-all">
                                    <strong>Image URL:</strong> {imageUrl.substring(0, 100)}...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Panel de Imagen */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Generated Image</h2>
                            {imageUrl && (
                                <button
                                    onClick={downloadImage}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                >
                                    💾 Download
                                </button>
                            )}
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center">
                            {imageUrl ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <img
                                        src={imageUrl}
                                        alt="Generated by Flux Kontext"
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                        onLoad={() => {
                                            console.log('🖼️ Image element loaded successfully');
                                            setResult(prev => prev + '   ✅ Image displayed in browser!\n');
                                        }}
                                        onError={(error) => {
                                            console.error('❌ Image element failed to load:', error);
                                            setResult(prev => prev + '   ❌ Image display failed!\n');
                                        }}
                                        crossOrigin="anonymous"
                                    />
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <div className="text-4xl mb-2">🖼️</div>
                                    <p>Generated image will appear here</p>
                                    {loading && <p className="text-sm mt-2 text-blue-500">Generating...</p>}
                                </div>
                            )}
                        </div>

                        {imageUrl && (
                            <div className="mt-4 text-center">
                                <a
                                    href={imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700 underline text-sm"
                                >
                                    🔗 Open image in new tab
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-bold text-green-800 mb-2">🔧 FIXED Issues</h3>
                    <ul className="text-green-700 text-sm space-y-1">
                        <li>✅ Fixed URL processing in frontend</li>
                        <li>✅ Added proper image error handling</li>
                        <li>✅ Added image load testing</li>
                        <li>✅ Added crossOrigin support for external URLs</li>
                        <li>✅ Added better debug logging</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}