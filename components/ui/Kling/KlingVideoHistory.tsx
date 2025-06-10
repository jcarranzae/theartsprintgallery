'use client';

import { useState, useEffect } from 'react';
import { Loader2, Play, Download, Calendar, Clock, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KlingVideo {
    task_id: string;
    status: string;
    status_message?: string;
    progress: number;
    completed: boolean;
    failed: boolean;
    created_at: number;
    updated_at: number;
    external_task_id?: string;
    videoData?: {
        id: string;
        url: string;
        duration: string;
    };
}

export default function KlingVideoHistory() {
    const [videos, setVideos] = useState < KlingVideo[] > ([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState < string | null > (null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(12);
    const [selectedVideo, setSelectedVideo] = useState < string | null > (null);

    useEffect(() => {
        fetchVideos();
    }, [currentPage]);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/kling-tasks?pageNum=${currentPage}&pageSize=${pageSize}`);
            const data = await response.json();

            if (data.success) {
                setVideos(data.data);
            } else {
                setError(data.error || 'Failed to fetch videos');
            }
        } catch (err) {
            setError('Network error while fetching videos');
            console.error('Fetch videos error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoPlay = (videoId: string) => {
        setSelectedVideo(selectedVideo === videoId ? null : videoId);
    };

    const handleDownload = async (videoUrl: string, taskId: string) => {
        try {
            let downloadUrl = videoUrl;

            // Use proxy for external URLs
            if (videoUrl.startsWith('http') && !videoUrl.startsWith(window.location.origin)) {
                downloadUrl = `/api/proxy-video?url=${encodeURIComponent(videoUrl)}`;
            }

            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `kling-video-${taskId}-${Date.now()}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            alert('Download failed. Please try again.');
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string, failed: boolean) => {
        if (failed) return 'text-red-400';
        switch (status) {
            case 'succeed': return 'text-green-400';
            case 'processing': return 'text-yellow-400';
            case 'submitted': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusIcon = (status: string, failed: boolean, progress: number) => {
        if (failed) return '❌';
        switch (status) {
            case 'succeed': return '✅';
            case 'processing': return '⏳';
            case 'submitted': return '📝';
            default: return '⏸️';
        }
    };

    if (loading && videos.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#8C1AD9] mx-auto mb-4" />
                    <p className="text-gray-400">Loading your Kling videos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-400 text-4xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Videos</h3>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <Button
                        onClick={fetchVideos}
                        className="bg-[#8C1AD9] hover:bg-[#7B16C2]"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-6xl mb-4">🎬</div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No Videos Yet</h3>
                    <p className="text-gray-400 mb-4">
                        Your generated videos will appear here. Start creating your first video!
                    </p>
                    <Button
                        asChild
                        className="bg-[#8C1AD9] hover:bg-[#7B16C2]"
                    >
                        <a href="/dashboard/kling">Generate Video</a>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">🎬 Kling Video History</h2>
                    <p className="text-gray-400">View and manage your generated videos</p>
                </div>
                <Button
                    onClick={fetchVideos}
                    disabled={loading}
                    className="bg-[#8C1AD9] hover:bg-[#7B16C2]"
                >
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : '🔄 Refresh'}
                </Button>
            </div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                    <Card
                        key={video.task_id}
                        className="bg-zinc-900 border-zinc-700 hover:border-[#8C1AD9]/50 transition-all duration-300"
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-white text-sm flex items-center justify-between">
                                <span className="truncate">Task: {video.external_task_id || video.task_id.slice(-8)}</span>
                                <span className={`text-xs ${getStatusColor(video.status, video.failed)}`}>
                                    {getStatusIcon(video.status, video.failed, video.progress)} {video.status}
                                </span>
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Video Preview or Status */}
                            {video.completed && video.videoData ? (
                                <div className="relative">
                                    {selectedVideo === video.task_id ? (
                                        <video
                                            src={video.videoData.url.startsWith('http') && !video.videoData.url.startsWith(window.location.origin)
                                                ? `/api/proxy-video?url=${encodeURIComponent(video.videoData.url)}`
                                                : video.videoData.url}
                                            controls
                                            autoPlay
                                            muted
                                            loop
                                            className="w-full h-40 object-cover rounded-lg"
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <div
                                            className="w-full h-40 bg-zinc-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors border-2 border-dashed border-zinc-600 hover:border-[#8C1AD9]/50"
                                            onClick={() => handleVideoPlay(video.task_id)}
                                        >
                                            <div className="text-center">
                                                <Play className="h-8 w-8 text-[#8C1AD9] mx-auto mb-2" />
                                                <p className="text-gray-400 text-sm">Click to play</p>
                                                <p className="text-gray-500 text-xs">{video.videoData.duration}s</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : video.failed ? (
                                <div className="w-full h-40 bg-red-900/20 rounded-lg flex items-center justify-center border border-red-500/30">
                                    <div className="text-center">
                                        <div className="text-red-400 text-2xl mb-2">❌</div>
                                        <p className="text-red-400 text-sm">Generation Failed</p>
                                        <p className="text-gray-500 text-xs mt-1">{video.status_message}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-40 bg-zinc-800 rounded-lg flex items-center justify-center border border-yellow-500/30">
                                    <div className="text-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-yellow-400 mx-auto mb-2" />
                                        <p className="text-yellow-400 text-sm">{video.status}</p>
                                        <div className="w-24 bg-zinc-700 rounded-full h-1.5 mt-2">
                                            <div
                                                className="bg-yellow-400 h-1.5 rounded-full transition-all duration-300"
                                                style={{ width: `${video.progress * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-gray-500 text-xs mt-1">{Math.round(video.progress * 100)}%</p>
                                    </div>
                                </div>
                            )}

                            {/* Video Info */}
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(video.created_at)}</span>
                                </div>
                                {video.videoData && (
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Clock className="h-3 w-3" />
                                        <span>{video.videoData.duration} seconds</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            {video.completed && video.videoData && (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleVideoPlay(video.task_id)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                                    >
                                        <Play className="h-3 w-3 mr-1" />
                                        {selectedVideo === video.task_id ? 'Hide' : 'Play'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleDownload(video.videoData!.url, video.task_id)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                                    >
                                        <Download className="h-3 w-3 mr-1" />
                                        Download
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                    disabled={currentPage === 1 || loading}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    variant="outline"
                    className="border-[#8C1AD9] text-[#8C1AD9] hover:bg-[#8C1AD9]/10"
                >
                    Previous
                </Button>
                <span className="text-gray-400">Page {currentPage}</span>
                <Button
                    disabled={videos.length < pageSize || loading}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    variant="outline"
                    className="border-[#8C1AD9] text-[#8C1AD9] hover:bg-[#8C1AD9]/10"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}