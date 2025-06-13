'use client';

import React, { useState, useCallback } from 'react';
import SaveButton from '../saveButton';
import { getProxiedVideoUrl, handleVideoLoadError, debugVideoUrl } from '@/lib/videoUrlUtils';

interface KlingVideoViewerProps {
    videoUrl: string | null;
    prompt?: string;
    model?: string;
    taskId?: string | null;
    duration?: string;
    aspectRatio?: string;
    mode?: string;
    cfgScale?: number;
    cameraControl?: any;
}

const KlingVideoViewer: React.FC<KlingVideoViewerProps> = ({
    videoUrl,
    prompt = '',
    model = 'kling-v2-master',
    taskId = null,
    duration = '',
    aspectRatio = '16:9',
    mode = 'std',
    cfgScale = 0.5,
    cameraControl = null
}) => {
    const [saving, setSaving] = useState(false);
    const [savedUrl, setSavedUrl] = useState<string | null>(null);
    const [saved, setSavedState] = useState(false);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    // Initialize video URL when videoUrl prop changes
    React.useEffect(() => {
        if (videoUrl) {
            const proxiedUrl = getProxiedVideoUrl(videoUrl);
            setCurrentVideoUrl(proxiedUrl);
            setVideoError(null);
            setRetryCount(0);

            // Debug info
            console.log('🎬 Video URL Debug:', debugVideoUrl(videoUrl));
        }
    }, [videoUrl]);

    const handleVideoError = useCallback((error: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        console.error('❌ Video playback error:', error);
        setVideoError('Failed to load video');

        if (videoUrl && retryCount < 2) {
            const fallbackUrl = handleVideoLoadError(videoUrl, error.nativeEvent);
            if (fallbackUrl && fallbackUrl !== currentVideoUrl) {
                console.log(`🔄 Retry ${retryCount + 1}: Trying fallback URL:`, fallbackUrl);
                setCurrentVideoUrl(fallbackUrl);
                setRetryCount(prev => prev + 1);
                setVideoError(null);
            }
        } else {
            console.error('❌ All video retry attempts failed');
            setVideoError('Unable to load video after multiple attempts');
        }
    }, [videoUrl, currentVideoUrl, retryCount]);

    const handleVideoLoad = useCallback(() => {
        console.log('✅ Video loaded successfully:', currentVideoUrl);
        setVideoError(null);
    }, [currentVideoUrl]);

    const handleSave = async () => {
        if (!videoUrl) {
            alert('No hay video para guardar');
            return;
        }

        setSaving(true);

        try {
            console.log('💾 Saving Kling video...', {
                videoUrl: videoUrl.substring(0, 50) + '...',
                model,
                taskId,
                prompt: prompt.substring(0, 50) + '...',
                mode,
                cfgScale,
                cameraControl
            });

            // Llamar a la nueva API optimizada
            const response = await fetch('/api/save-kling-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    videoUrl,
                    prompt,
                    model,
                    taskId,
                    duration,
                    aspectRatio,
                    mode,
                    cfgScale,
                    cameraControl
                })
            });

            const data = await response.json();

            if (data.success) {
                setSavedUrl(data.data.url);
                setSavedState(true);
                console.log('✅ Video saved successfully:', data.data);
            } else {
                console.error('❌ Save failed:', data.error);

                if (response.status === 401) {
                    alert('Debes estar autenticado para guardar videos. Por favor, inicia sesión.');
                } else {
                    alert(`Error al guardar video: ${data.error}`);
                }
            }
        } catch (error) {
            console.error('❌ Save error:', error);
            alert('Error de red al guardar el video. Inténtalo de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    const handleDownload = async () => {
        if (!videoUrl) return;

        try {
            console.log('⬇️ Starting download for URL:', videoUrl);

            // Use the same proxied URL for download
            const downloadUrl = getProxiedVideoUrl(videoUrl);

            const response = await fetch(downloadUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `kling-${model}-${taskId || Date.now()}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
            console.log('✅ Download completed successfully');
        } catch (error) {
            console.error('❌ Download error:', error);
            alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}. Try right-click → Save video as...`);
        }
    };

    const getAspectRatioClass = () => {
        switch (aspectRatio) {
            case '16:9':
                return 'aspect-video'; // 16:9
            case '9:16':
                return 'aspect-[9/16]'; // 9:16 (vertical)
            case '1:1':
                return 'aspect-square'; // 1:1
            default:
                return 'aspect-video';
        }
    };

    return (
        <div className="relative w-full h-[600px] flex items-center justify-center">
            {videoUrl && currentVideoUrl ? (
                <>
                    <div className={`relative ${getAspectRatioClass()} max-w-full max-h-[600px] rounded-lg overflow-hidden shadow-2xl border border-[#8C1AD9]/30`}
                        style={{
                            boxShadow: "0 0 32px 8px rgba(140, 26, 217, 0.2)",
                        }}
                    >
                        {videoError ? (
                            <div className="w-full h-full flex items-center justify-center bg-red-900/20 border border-red-500/30">
                                <div className="text-center p-6">
                                    <div className="text-red-400 text-4xl mb-4">❌</div>
                                    <h3 className="text-red-400 text-lg font-semibold mb-2">Video Load Error</h3>
                                    <p className="text-gray-300 text-sm mb-4">{videoError}</p>
                                    <button
                                        onClick={() => {
                                            setVideoError(null);
                                            setRetryCount(0);
                                            if (videoUrl) {
                                                setCurrentVideoUrl(getProxiedVideoUrl(videoUrl));
                                            }
                                        }}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                                    >
                                        🔄 Retry
                                    </button>
                                    <div className="mt-4 text-xs text-gray-400">
                                        <p>Retry count: {retryCount}/2</p>
                                        <p>Original URL: {videoUrl.substring(0, 50)}...</p>
                                        <p>Current URL: {currentVideoUrl.substring(0, 50)}...</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <video
                                key={currentVideoUrl} // Force re-render on URL change
                                src={currentVideoUrl}
                                controls
                                autoPlay
                                muted
                                loop
                                className="w-full h-full object-cover"
                                onLoadedData={handleVideoLoad}
                                onError={handleVideoError}
                                onLoadStart={() => console.log('🔄 Video loading started...')}
                                onCanPlay={() => console.log('✅ Video can play')}
                            >
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </div>

                    {/* Control Buttons */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <button
                            onClick={handleDownload}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
                        >
                            📥 Download
                        </button>
                        {!saved && (
                            <SaveButton
                                onClick={handleSave}
                                loading={saving}
                                label="Save Video"
                                className="bg-purple-600 hover:bg-purple-700"
                            />
                        )}
                    </div>

                    {/* Video Info */}
                    <div className="absolute top-4 left-4 space-y-2">
                        <div className="bg-black/70 backdrop-blur-sm border border-[#8C1AD9]/30 text-white px-3 py-1 rounded-lg text-sm">
                            🎬 {model.toUpperCase()}
                        </div>
                        {duration && (
                            <div className="bg-black/70 backdrop-blur-sm border border-blue-500/30 text-blue-200 px-3 py-1 rounded-lg text-sm">
                                ⏱️ {duration}s
                            </div>
                        )}
                        <div className="bg-black/70 backdrop-blur-sm border border-green-500/30 text-green-200 px-3 py-1 rounded-lg text-sm">
                            📐 {aspectRatio}
                        </div>
                        {mode && (
                            <div className="bg-black/70 backdrop-blur-sm border border-yellow-500/30 text-yellow-200 px-3 py-1 rounded-lg text-sm">
                                ⚙️ {mode.toUpperCase()}
                            </div>
                        )}
                        {retryCount > 0 && (
                            <div className="bg-black/70 backdrop-blur-sm border border-orange-500/30 text-orange-200 px-3 py-1 rounded-lg text-sm">
                                🔄 Retry {retryCount}/2
                            </div>
                        )}
                    </div>

                    {/* Success Message */}
                    {saved && (
                        <div className="absolute bottom-16 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
                            <p className="text-sm">✅ Video saved successfully!</p>
                            <div className="flex gap-2 mt-2">
                                <a
                                    href="/dashboard/kling"
                                    className="text-center hover:text-green-200 text-white font-semibold text-xs underline"
                                >
                                    Create another video
                                </a>
                                <span className="text-xs">|</span>
                                <a
                                    href="/dashboard/kling/history"
                                    className="text-center hover:text-green-200 text-white font-semibold text-xs underline"
                                >
                                    View history
                                </a>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <div className="text-center p-8 bg-zinc-900/50 rounded-lg border border-[#8C1AD9]/30">
                        <div className="text-6xl mb-4">🎬</div>
                        <h3 className="text-2xl font-bold text-[#8C1AD9] mb-2">
                            Kling Video Generator Ready
                        </h3>
                        <p className="text-gray-300 mb-4">
                            Create stunning AI-generated videos with advanced text-to-video technology
                        </p>
                        <div className="text-sm text-gray-400">
                            <p className="mb-2">✨ <strong>Kling excels at:</strong></p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>• Realistic motion dynamics</div>
                                <div>• Complex scene understanding</div>
                                <div>• Professional camera movements</div>
                                <div>• Temporal consistency</div>
                                <div>• High-quality rendering</div>
                                <div>• Cinematic storytelling</div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-gradient-to-r from-[#8C1AD9]/10 to-cyan-900/10 rounded-lg border border-[#8C1AD9]/20">
                            <h4 className="text-cyan-300 font-semibold mb-2">🎯 Video Generation Tips</h4>
                            <div className="text-xs text-gray-300 space-y-1 text-left">
                                <p>• <strong>Motion:</strong> Describe specific movements and camera actions</p>
                                <p>• <strong>Timing:</strong> Consider pacing for your chosen duration</p>
                                <p>• <strong>Style:</strong> Specify cinematic style (dramatic, smooth, dynamic)</p>
                                <p>• <strong>Quality:</strong> Use Professional mode for best results</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KlingVideoViewer;