'use client';

import React, { useState } from 'react';
import SaveButton from '../saveButton';
import { saveKlingVideoToSupabase } from '@/lib/saveVideoToSupabase';

interface KlingVideoViewerProps {
    videoUrl: string | null;
    prompt?: string;
    model?: string;
    taskId?: string | null;
    duration?: string;
    aspectRatio?: string;
}

const KlingVideoViewer: React.FC<KlingVideoViewerProps> = ({
    videoUrl,
    prompt = '',
    model = 'kling-v2-master',
    taskId = null,
    duration = '',
    aspectRatio = '16:9'
}) => {
    const [saving, setSaving] = useState(false);
    const [savedUrl, setSavedUrl] = useState < string | null > (null);
    const [saved, setSavedState] = useState(false);

    const handleSave = async () => {
        if (!videoUrl) return;
        setSaving(true);

        try {
            const { success, url, error } = await saveKlingVideoToSupabase({
                videoUrl,
                prompt: prompt || '',
                model,
                taskId,
                metadata: {
                    duration,
                    aspectRatio,
                    type: 'video',
                    source: 'kling'
                }
            });

            setSaving(false);
            if (success && url) {
                setSavedUrl(url);
                setSavedState(true);
            } else {
                if (error === 'Usuario no autenticado') {
                    alert('You must be authenticated to save videos. Please log in.');
                } else {
                    alert(error || 'Error saving video');
                }
            }
        } catch (error) {
            setSaving(false);
            console.error('Save error:', error);
            alert('Error saving video');
        }
    };

    const handleDownload = async () => {
        if (!videoUrl) return;

        try {
            let downloadUrl = videoUrl;

            // If it's an external URL (Kling), use proxy to avoid CORS issues
            if (videoUrl.startsWith('http') && !videoUrl.startsWith(window.location.origin)) {
                downloadUrl = `/api/proxy-video?url=${encodeURIComponent(videoUrl)}`;
            }

            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `kling-${model}-${Date.now()}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            alert('Download failed. Try right-click → Save video as...');
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
            {videoUrl ? (
                <>
                    <div className={`relative ${getAspectRatioClass()} max-w-full max-h-[600px] rounded-lg overflow-hidden shadow-2xl border border-[#8C1AD9]/30`}
                        style={{
                            boxShadow: "0 0 32px 8px rgba(140, 26, 217, 0.2)",
                        }}
                    >
                        <video
                            src={videoUrl.startsWith('http') && !videoUrl.startsWith(window.location.origin)
                                ? `/api/proxy-video?url=${encodeURIComponent(videoUrl)}`
                                : videoUrl}
                            controls
                            autoPlay
                            muted
                            loop
                            className="w-full h-full object-cover"
                            onLoadedData={() => console.log('🎬 Kling video loaded successfully')}
                            onError={(error) => {
                                console.error('❌ Kling video load error:', error);
                            }}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    {/* Control Buttons */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <button
                            onClick={handleDownload}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
                        >
                            📥 Download
                        </button>
                        {!savedUrl && (
                            <SaveButton
                                onClick={handleSave}
                                loading={saving}
                                label="Save Video"
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
                    </div>

                    {/* Success Message */}
                    {saved && (
                        <div className="absolute bottom-16 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
                            <p className="text-sm">Video saved successfully!</p>
                            <a
                                href="/dashboard/kling"
                                className="block text-center hover:text-green-200 text-white font-semibold text-sm mt-1"
                            >
                                Create another video
                            </a>
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