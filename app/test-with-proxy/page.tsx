'use client';

import { useState } from 'react';

export default function TestWithProxy() {
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [proxyUrl, setProxyUrl] = useState<string | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);

    const testAPI = async () => {
        setLoading(true);
        setResult('🧪 Testing BFL API with PROXY...\n\n');
        setImageUrl(null);
        setProxyUrl(null);
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
                    prompt: 'A beautiful cyberpunk cityscape at night with neon lights and flying cars, futuristic, high detail',
                    seed: Math.floor(Math.random() * 1000000),
                    aspect_ratio: '16:9',
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

            // Paso 2: Polling
            setResult(prev => prev + '2. 🔄 Polling for result...\n');

            let attempts = 0;
            const maxAttempts = 40;

            while (attempts < maxAttempts) {
                attempts++;

                await new Promise(resolve => setTimeout(resolve, 3000));

                setResult(prev => prev + `   🔍 Checking... (${attempts}/${maxAttempts})\n`);

                const pollResponse = await fetch(`/api/check-kontext/${newTaskId}`);
                const pollData = await pollResponse.json();

                if (!pollResponse.ok) {
                    setResult(prev => prev + `   ❌ Poll error: ${pollData.error}\n`);
                    continue;
                }

                setResult(prev => prev + `   Status: ${pollData.status} | Progress: ${Math.round((pollData.progress || 0) * 100)}%\n`);

                if (pollData.completed && pollData.status === 'Ready') {
                    setResult(prev => prev + '✅ Image generation completed!\n\n');

                    if (pollData.imageData) {
                        const originalUrl = pollData.imageData;
                        setResult(prev => prev + '3. 🖼️ Processing image...\n');
                        setResult(prev => prev + `   Original URL: ${originalUrl.substring(0, 50)}...\n`);

                        // Paso 3: Intentar cargar imagen directamente primero
                        setResult(prev => prev + '   🧪 Testing direct image access...\n');

                        const directImageTest = await testImageAccess(originalUrl);

                        if (directImageTest.success) {
                            setResult(prev => prev + '   ✅ Direct access works!\n');
                            setImageUrl(originalUrl);
                        } else {
                            setResult(prev => prev + `   ❌ Direct access failed: ${directImageTest.error}\n`);
                            setResult(prev => prev + '   🔄 Using proxy...\n');

                            // Crear URL del proxy
                            const proxyImageUrl = `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
                            setProxyUrl(proxyImageUrl);

                            // Test del proxy
                            const proxyTest = await testImageAccess(proxyImageUrl);

                            if (proxyTest.success) {
                                setResult(prev => prev + '   ✅ Proxy access works!\n');
                                setImageUrl(proxyImageUrl);
                            } else {
                                setResult(prev => prev + `   ❌ Proxy access failed: ${proxyTest.error}\n`);

                                // Último recurso: convertir a base64
                                setResult(prev => prev + '   🔄 Converting to base64...\n');
                                try {
                                    const base64Url = await convertToBase64(originalUrl);
                                    setImageUrl(base64Url);
                                    setResult(prev => prev + '   ✅ Base64 conversion successful!\n');
                                } catch (base64Error) {
                                    setResult(prev => prev + `   ❌ Base64 conversion failed: ${base64Error}\n`);
                                }
                            }
                        }

                    } else {
                        setResult(prev => prev + '   ❌ No imageData found in response\n');
                    }

                    break;
                } else if (pollData.moderated) {
                    setResult(prev => prev + `❌ Content moderated: ${pollData.status}\n`);
                    break;
                } else if (pollData.notFound) {
                    setResult(prev => prev + '❌ Task not found\n');
                    break;
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

    // Función para probar acceso a imagen
    const testImageAccess = (url: string): Promise<{ success: boolean, error?: string }> => {
        return new Promise((resolve) => {
            const img = new Image();

            const timeout = setTimeout(() => {
                resolve({ success: false, error: 'Timeout' });
            }, 5000); // 5 segundos timeout

            img.onload = () => {
                clearTimeout(timeout);
                resolve({ success: true });
            };

            img.onerror = (error) => {
                clearTimeout(timeout);
                resolve({ success: false, error: 'Load error' });
            };

            img.crossOrigin = 'anonymous';
            img.src = url;
        });
    };

    // Función para convertir URL a base64
    const convertToBase64 = async (url: string): Promise<string> => {
        const response = await fetch('/api/proxy-image?url=' + encodeURIComponent(url));
        if (!response.ok) throw new Error('Failed to fetch image');

        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const downloadImage = async () => {
        if (!imageUrl) return;

        try {
            let downloadUrl = imageUrl;

            // Si es una URL proxy o externa, usamos el proxy para descarga
            if (imageUrl.startsWith('/api/proxy-image') || imageUrl.startsWith('http')) {
                if (!imageUrl.startsWith('/api/proxy-image')) {
                    downloadUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
                }

                const response = await fetch(downloadUrl);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `flux-kontext-${taskId || Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(url);
            } else {
                // Data URL - descarga directa
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = `flux-kontext-${taskId || Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Download failed. Try right-click → Save image as...');
        }
    };

    const clearTest = () => {
        setResult('');
        setImageUrl(null);
        setProxyUrl(null);
        setTaskId(null);
    };

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">🔧 BFL Test with PROXY Solution</h1>

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
                                    {loading ? '🔄 Testing...' : '🚀 Test with Proxy'}
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
                            <pre className="whitespace-pre-wrap">{result || 'Click "Test with Proxy" to start...'}</pre>
                        </div>

                        {taskId && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Task ID:</strong> {taskId}
                                </p>
                                {proxyUrl && (
                                    <p className="text-sm text-green-800 mt-1">
                                        <strong>Using Proxy:</strong> Yes
                                    </p>
                                )}
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
                                            console.log('🖼️ Image loaded successfully');
                                            setResult(prev => prev + '   ✅ Image displayed successfully!\n');
                                        }}
                                        onError={(error) => {
                                            console.error('❌ Image display error:', error);
                                            setResult(prev => prev + '   ❌ Image display still failed!\n');
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <div className="text-4xl mb-2">🖼️</div>
                                    <p>Generated image will appear here</p>
                                    {loading && <p className="text-sm mt-2 text-blue-500">Testing proxy solutions...</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-bold text-blue-800 mb-2">🔧 Proxy Solution Features</h3>
                    <ul className="text-blue-700 text-sm space-y-1">
                        <li>✅ Tests direct image access first</li>
                        <li>✅ Falls back to proxy if CORS issues</li>
                        <li>✅ Converts to base64 as last resort</li>
                        <li>✅ Detailed debugging information</li>
                        <li>✅ Secure proxy (only BFL URLs allowed)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}