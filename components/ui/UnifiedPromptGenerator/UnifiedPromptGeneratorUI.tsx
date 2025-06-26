import React, { useState } from 'react';

// Types definitions
type Platform = 'instagram' | 'youtube_shorts' | 'tiktok' | 'twitter' | 'linkedin';
type FluxModel = 'flux-pro' | 'flux-dev' | 'flux-schnell';
type KlingModel = 'kling-1-0' | 'kling-1-5' | 'kling-1-6' | 'kling-2-0' | 'kling-2-1';
type ContentType = 'image' | 'video';

interface VideoContextData {
    content_type: string;
    industry: string;
    objective: string;
    audience: string;
    visual_style: string;
    video_style: string;
    motion_type: string;
    camera_movement: string;
    duration_preference: string;
    narrative_structure: string;
    temporal_context: string;
    trending_topics: string[];
}

interface AgentResponse {
    agent_name: string;
    content: string;
    confidence: number;
    processing_time: number;
}

interface VideoPromptGenerationResult {
    final_prompt: string;
    metadata: {
        context_data: VideoContextData;
        processing_time: number;
        agents_used: string[];
        confidence_score: number;
        target_model: FluxModel | KlingModel;
        content_type: ContentType;
        estimated_tokens: number;
        video_specs?: {
            duration: string;
            aspect_ratio: string;
            camera_movements: string[];
            motion_elements: string[];
        };
    };
    agent_responses: AgentResponse[];
}

const UnifiedPromptGeneratorUI: React.FC = () => {
    const [userInput, setUserInput] = useState('');
    const [contentType, setContentType] = useState<ContentType>('image');
    const [platform, setPlatform] = useState<Platform>('instagram');
    const [targetModel, setTargetModel] = useState<FluxModel | KlingModel>('flux-pro');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<VideoPromptGenerationResult | null>(null);
    const [variations, setVariations] = useState<VideoPromptGenerationResult[]>([]);
    const [activeTab, setActiveTab] = useState<'single' | 'variations' | 'optimize'>('single');
    const [existingPrompt, setExistingPrompt] = useState('');
    const [optimizedPrompt, setOptimizedPrompt] = useState('');

    const platforms: { value: Platform; label: string }[] = [
        { value: 'instagram', label: 'Instagram' },
        { value: 'youtube_shorts', label: 'YouTube Shorts' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'twitter', label: 'Twitter/X' },
        { value: 'linkedin', label: 'LinkedIn' }
    ];

    const fluxModels: { value: FluxModel; label: string; description: string }[] = [
        {
            value: 'flux-pro',
            label: 'FLUX.1 Pro',
            description: 'Maximum quality and prompt adherence'
        },
        {
            value: 'flux-dev',
            label: 'FLUX.1 Dev',
            description: 'Perfect balance between quality and speed'
        },
        {
            value: 'flux-schnell',
            label: 'FLUX.1 Schnell',
            description: 'Ultra-fast generation for iteration'
        }
    ];

    const klingModels: { value: KlingModel; label: string; description: string }[] = [
        {
            value: 'kling-1-0',
            label: 'Kling 1.0',
            description: 'Basic video generation - 5 seconds max'
        },
        {
            value: 'kling-1-5',
            label: 'Kling 1.5',
            description: 'Motion Brush & Face Model - 5-10 seconds'
        },
        {
            value: 'kling-1-6',
            label: 'Kling 1.6',
            description: 'Elements feature - 10 seconds max'
        },
        {
            value: 'kling-2-0',
            label: 'Kling 2.0',
            description: 'Extended duration - 2-3 minutes max'
        },
        {
            value: 'kling-2-1',
            label: 'Kling 2.1',
            description: 'Latest with tiered quality - 3 minutes max'
        }
    ];

    const currentModels = contentType === 'image' ? fluxModels : klingModels;

    // Auto-update target model when content type changes
    React.useEffect(() => {
        if (contentType === 'image') {
            setTargetModel('flux-pro');
        } else {
            setTargetModel('kling-2-1');
        }
    }, [contentType]);

    const generateSinglePrompt = async () => {
        if (!userInput.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/unified-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_input: userInput,
                    content_type: contentType,
                    platform: platform,
                    target_model: targetModel
                })
            });

            const data = await response.json();
            if (data.success) {
                setResult(data.data);
            } else {
                console.error('Error:', data.error);
            }
        } catch (error) {
            console.error('Failed to generate prompt:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateVariations = async () => {
        if (!userInput.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/unified-variations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_input: userInput,
                    content_type: contentType,
                    platform: platform,
                    target_model: targetModel,
                    count: 3
                })
            });

            const data = await response.json();
            if (data.success) {
                setVariations(data.data.variations);
            } else {
                console.error('Error:', data.error);
            }
        } catch (error) {
            console.error('Failed to generate variations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const optimizePrompt = async () => {
        if (!existingPrompt.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/unified-optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    existing_prompt: existingPrompt,
                    content_type: contentType,
                    platform: platform,
                    target_model: targetModel
                })
            });

            const data = await response.json();
            if (data.success) {
                setOptimizedPrompt(data.data.optimized_prompt);
            } else {
                console.error('Error:', data.error);
            }
        } catch (error) {
            console.error('Failed to optimize prompt:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const getContentIcon = () => {
        return contentType === 'image' ? '🖼️' : '🎬';
    };

    const getModelIcon = () => {
        return contentType === 'image' ? '⚡' : '🎭';
    };

    return (
        <div
            className="min-h-screen w-full flex flex-col"
            style={{
                background: "linear-gradient(140deg, #1C228C 0%, #2C2A59 60%, #060826 100%)",
            }}
        >
            <div className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-4">
                            🚀 <span className="text-[#8C1AD9]">Unified AI Prompt</span> Generation System
                        </h1>
                        <p className="text-gray-300 text-lg">
                            Generate optimized prompts for both images (Flux) and videos (Kling) using specialized AI agents
                        </p>
                    </div>

                    {/* Main Container */}
                    <div className="bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden"
                        style={{
                            boxShadow: "0 0 32px 8px rgba(140, 26, 217, 0.3)",
                        }}
                    >
                        {/* Navigation Tabs */}
                        <div className="border-b border-[#8C1AD9]/30">
                            <nav className="flex">
                                {[
                                    { id: 'single', label: '🎯 Single Prompt', icon: '🎯' },
                                    { id: 'variations', label: '🔄 Variations', icon: '🔄' },
                                    { id: 'optimize', label: '⚡ Optimize', icon: '⚡' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`py-4 px-8 border-b-2 font-semibold text-sm transition-all duration-300 ${activeTab === tab.id
                                                ? 'border-[#8C1AD9] text-[#8C1AD9] bg-[#8C1AD9]/10'
                                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="p-8">
                            {/* Configuration Panel */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                {/* Content Type Selector */}
                                <div>
                                    <label className="block text-[#8C1AD9] font-semibold text-lg mb-2">
                                        🎨 Content Type
                                    </label>
                                    <select
                                        value={contentType}
                                        onChange={(e) => setContentType(e.target.value as ContentType)}
                                        className="w-full p-3 rounded-lg bg-black text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] outline-none transition-all"
                                    >
                                        <option value="image">🖼️ Image Generation (Flux)</option>
                                        <option value="video">🎬 Video Generation (Kling)</option>
                                    </select>
                                </div>

                                {/* Platform Selector */}
                                <div>
                                    <label className="block text-[#8C1AD9] font-semibold text-lg mb-2">
                                        🎯 Target Platform
                                    </label>
                                    <select
                                        value={platform}
                                        onChange={(e) => setPlatform(e.target.value as Platform)}
                                        className="w-full p-3 rounded-lg bg-black text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] outline-none transition-all"
                                    >
                                        {platforms.map((p) => (
                                            <option key={p.value} value={p.value}>
                                                {p.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Model Selector */}
                                <div>
                                    <label className="block text-[#8C1AD9] font-semibold text-lg mb-2">
                                        {getModelIcon()} {contentType === 'image' ? 'Flux Model' : 'Kling Model'}
                                    </label>
                                    <select
                                        value={targetModel}
                                        onChange={(e) => setTargetModel(e.target.value as FluxModel | KlingModel)}
                                        className="w-full p-3 rounded-lg bg-black text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] outline-none transition-all"
                                    >
                                        {currentModels.map((m) => (
                                            <option key={m.value} value={m.value}>
                                                {m.label} - {m.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'single' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[#8C1AD9] font-semibold text-lg mb-2">
                                            ✍️ Describe the {contentType} you want to generate
                                        </label>
                                        <textarea
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            placeholder={contentType === 'image'
                                                ? "Example: A young woman doing yoga on the beach at sunrise with warm colors..."
                                                : "Example: A chef preparing pasta in a modern kitchen, with steam rising from the pot and smooth camera movements..."
                                            }
                                            rows={4}
                                            className="w-full p-4 rounded-lg bg-black text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] outline-none transition-all placeholder:text-[#8C1AD9]/50 resize-none"
                                        />
                                    </div>

                                    <button
                                        onClick={generateSinglePrompt}
                                        disabled={isLoading || !userInput.trim()}
                                        className="w-full bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] text-white py-3 px-6 rounded-lg font-semibold hover:from-[#7B16C2] hover:to-[#1C228C] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                                        style={{
                                            boxShadow: "0 0 16px 3px #8C1AD9",
                                        }}
                                    >
                                        {isLoading
                                            ? `🔄 Generating ${contentType === 'image' ? 'Flux' : 'Kling'} Prompt...`
                                            : `⚡ Generate Optimized ${contentType === 'image' ? 'Flux' : 'Kling'} Prompt`
                                        }
                                    </button>

                                    {result && (
                                        <div className="bg-zinc-800 rounded-lg p-6 border border-[#8C1AD9]/30">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xl font-semibold text-[#8C1AD9]">
                                                    ✨ Generated {contentType === 'image' ? 'Image' : 'Video'} Prompt
                                                </h3>
                                                <button
                                                    onClick={() => copyToClipboard(result.final_prompt)}
                                                    className="px-4 py-2 bg-[#8C1AD9]/20 text-[#8C1AD9] rounded-md text-sm hover:bg-[#8C1AD9]/30 transition-colors border border-[#8C1AD9]/50"
                                                >
                                                    📋 Copy
                                                </button>
                                            </div>

                                            <div className="bg-black p-4 rounded-lg border border-[#8C1AD9]/20 mb-4">
                                                <p className="text-gray-100 leading-relaxed">{result.final_prompt}</p>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-sm mb-4">
                                                <div className="bg-black/50 p-3 rounded-lg text-center border border-[#8C1AD9]/20">
                                                    <div className="text-[#8C1AD9] font-semibold">⏱️ Time</div>
                                                    <div className="text-gray-300">{result.metadata.processing_time}ms</div>
                                                </div>
                                                <div className="bg-black/50 p-3 rounded-lg text-center border border-[#8C1AD9]/20">
                                                    <div className="text-[#8C1AD9] font-semibold">🤖 Agents</div>
                                                    <div className="text-gray-300">{result.metadata.agents_used.length}</div>
                                                </div>
                                                <div className="bg-black/50 p-3 rounded-lg text-center border border-[#8C1AD9]/20">
                                                    <div className="text-[#8C1AD9] font-semibold">📊 Confidence</div>
                                                    <div className="text-gray-300">{Math.round(result.metadata.confidence_score * 100)}%</div>
                                                </div>
                                                <div className="bg-black/50 p-3 rounded-lg text-center border border-[#8C1AD9]/20">
                                                    <div className="text-[#8C1AD9] font-semibold">🎯 Platform</div>
                                                    <div className="text-gray-300 capitalize">{platform}</div>
                                                </div>
                                                <div className="bg-black/50 p-3 rounded-lg text-center border border-[#8C1AD9]/20">
                                                    <div className="text-[#8C1AD9] font-semibold">{getModelIcon()} Model</div>
                                                    <div className="text-gray-300">{result.metadata.target_model}</div>
                                                </div>
                                                <div className="bg-black/50 p-3 rounded-lg text-center border border-[#8C1AD9]/20">
                                                    <div className="text-[#8C1AD9] font-semibold">{getContentIcon()} Type</div>
                                                    <div className="text-gray-300 capitalize">{result.metadata.content_type}</div>
                                                </div>
                                            </div>

                                            {/* Video-specific specs */}
                                            {result.metadata.video_specs && (
                                                <div className="bg-black/30 p-4 rounded-lg border border-[#8C1AD9]/20">
                                                    <h4 className="text-[#8C1AD9] font-semibold mb-2">🎬 Video Specifications</h4>
                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-400">Duration:</span>
                                                            <div className="text-gray-200">{result.metadata.video_specs.duration}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">Aspect Ratio:</span>
                                                            <div className="text-gray-200">{result.metadata.video_specs.aspect_ratio}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">Camera:</span>
                                                            <div className="text-gray-200">{result.metadata.video_specs.camera_movements.join(', ')}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">Motion:</span>
                                                            <div className="text-gray-200">{result.metadata.video_specs.motion_elements.join(', ')}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'variations' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[#8C1AD9] font-semibold text-lg mb-2">
                                            ✍️ Describe the base {contentType} for variations
                                        </label>
                                        <textarea
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            placeholder={`Describe the base ${contentType} and the system will generate 3 different variations...`}
                                            rows={4}
                                            className="w-full p-4 rounded-lg bg-black text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] outline-none transition-all placeholder:text-[#8C1AD9]/50 resize-none"
                                        />
                                    </div>

                                    <button
                                        onClick={generateVariations}
                                        disabled={isLoading || !userInput.trim()}
                                        className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                                        style={{
                                            boxShadow: "0 0 16px 3px rgba(34, 197, 94, 0.5)",
                                        }}
                                    >
                                        {isLoading ? '🔄 Generating variations...' : `🎨 Generate 3 ${contentType === 'image' ? 'Image' : 'Video'} Variations`}
                                    </button>

                                    {variations.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-semibold text-[#8C1AD9]">
                                                🎨 Generated {contentType === 'image' ? 'Image' : 'Video'} Variations
                                            </h3>
                                            {variations.map((variation, index) => (
                                                <div key={index} className="bg-zinc-800 rounded-lg p-4 border border-[#8C1AD9]/30">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h4 className="font-semibold text-gray-200">
                                                            Variation {index + 1} ({variation.metadata.target_model})
                                                        </h4>
                                                        <button
                                                            onClick={() => copyToClipboard(variation.final_prompt)}
                                                            className="px-3 py-1 bg-teal-600/20 text-teal-400 rounded-md text-sm hover:bg-teal-600/30 transition-colors border border-teal-400/50"
                                                        >
                                                            📋 Copy
                                                        </button>
                                                    </div>
                                                    <div className="bg-black p-3 rounded-lg border border-[#8C1AD9]/20">
                                                        <p className="text-gray-100 text-sm leading-relaxed">
                                                            {variation.final_prompt}
                                                        </p>
                                                    </div>
                                                    {variation.metadata.video_specs && (
                                                        <div className="mt-2 text-xs text-gray-400">
                                                            🎬 {variation.metadata.video_specs.duration} • {variation.metadata.video_specs.aspect_ratio} • {variation.metadata.video_specs.camera_movements.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'optimize' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[#8C1AD9] font-semibold text-lg mb-2">
                                            📝 Existing {contentType} prompt to optimize
                                        </label>
                                        <textarea
                                            value={existingPrompt}
                                            onChange={(e) => setExistingPrompt(e.target.value)}
                                            placeholder={`Paste your existing ${contentType} prompt here and we'll optimize it for the selected platform and model...`}
                                            rows={4}
                                            className="w-full p-4 rounded-lg bg-black text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] outline-none transition-all placeholder:text-[#8C1AD9]/50 resize-none"
                                        />
                                    </div>

                                    <button
                                        onClick={optimizePrompt}
                                        disabled={isLoading || !existingPrompt.trim()}
                                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                                        style={{
                                            boxShadow: "0 0 16px 3px rgba(251, 146, 60, 0.5)",
                                        }}
                                    >
                                        {isLoading ? '🔄 Optimizing...' : `⚡ Optimize ${contentType === 'image' ? 'Image' : 'Video'} Prompt`}
                                    </button>

                                    {optimizedPrompt && (
                                        <div className="space-y-4">
                                            <div className="bg-zinc-800 rounded-lg p-6 border border-[#8C1AD9]/30">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-300">
                                                        📝 Original Prompt
                                                    </h3>
                                                </div>
                                                <div className="bg-black p-4 rounded-lg border border-gray-600">
                                                    <p className="text-gray-400 leading-relaxed">{existingPrompt}</p>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-lg p-6 border border-orange-400/30">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-semibold text-orange-300">
                                                        ⚡ Optimized {contentType === 'image' ? 'Image' : 'Video'} Prompt
                                                    </h3>
                                                    <button
                                                        onClick={() => copyToClipboard(optimizedPrompt)}
                                                        className="px-4 py-2 bg-orange-600/20 text-orange-400 rounded-md text-sm hover:bg-orange-600/30 transition-colors border border-orange-400/50"
                                                    >
                                                        📋 Copy
                                                    </button>
                                                </div>
                                                <div className="bg-black p-4 rounded-lg border border-orange-400/20">
                                                    <p className="text-gray-100 leading-relaxed">{optimizedPrompt}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedPromptGeneratorUI;
