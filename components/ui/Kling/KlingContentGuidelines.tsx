// components/ui/Kling/KlingContentGuidelines.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KlingContentGuidelinesProps {
    show?: boolean;
    onClose?: () => void;
    errorType?: 'risk_control' | 'quota' | 'processing' | 'general';
}

export default function KlingContentGuidelines({
    show = false,
    onClose,
    errorType = 'general'
}: KlingContentGuidelinesProps) {
    const [isExpanded, setIsExpanded] = useState(show);

    const getErrorSpecificContent = () => {
        switch (errorType) {
            case 'risk_control':
                return {
                    title: "❌ Content Moderation Error",
                    description: "Your prompt was rejected by Kling's content policy",
                    color: "border-red-500/50 bg-red-900/20",
                    solutions: [
                        "Remove violent, adult, or controversial content",
                        "Avoid references to real people, brands, or copyrighted material",
                        "Use positive and creative language",
                        "Focus on artistic and imaginative scenarios"
                    ]
                };
            case 'quota':
                return {
                    title: "⏳ Usage Limit Reached",
                    description: "You've reached your generation quota",
                    color: "border-yellow-500/50 bg-yellow-900/20",
                    solutions: [
                        "Wait for your quota to reset (usually 24 hours)",
                        "Check your account usage in the dashboard",
                        "Consider upgrading to a higher plan",
                        "Use shorter videos (5s instead of 10s) to save quota"
                    ]
                };
            case 'processing':
                return {
                    title: "⚙️ Processing Error",
                    description: "There was a technical issue during generation",
                    color: "border-blue-500/50 bg-blue-900/20",
                    solutions: [
                        "Try again in a few minutes",
                        "Simplify your prompt if it's very complex",
                        "Check if Kling services are operational",
                        "Contact support if the issue persists"
                    ]
                };
            default:
                return {
                    title: "📋 Content Guidelines",
                    description: "Follow these guidelines for successful video generation",
                    color: "border-[#8C1AD9]/50 bg-[#8C1AD9]/10",
                    solutions: []
                };
        }
    };

    const errorContent = getErrorSpecificContent();

    const allowedContent = [
        {
            category: "✅ Encouraged Content",
            items: [
                "Natural landscapes and environments",
                "Abstract art and creative visuals",
                "Animals in natural settings",
                "Artistic and cinematic scenes",
                "Product demonstrations (generic)",
                "Educational and informative content",
                "Fantasy and sci-fi scenarios",
                "Cultural celebrations and traditions"
            ]
        },
        {
            category: "⚠️ Use Caution",
            items: [
                "Historical events (be factual and respectful)",
                "Sports and competitive activities",
                "Food preparation and cooking",
                "Technology and innovation",
                "Transportation and vehicles",
                "Architecture and buildings"
            ]
        },
        {
            category: "❌ Avoid Completely",
            items: [
                "Violence, weapons, or harmful activities",
                "Adult or sexual content",
                "Real public figures or celebrities",
                "Copyrighted characters or brands",
                "Illegal activities or substances",
                "Hate speech or discrimination",
                "Medical procedures or advice",
                "Financial or investment advice"
            ]
        }
    ];

    const promptTips = [
        {
            tip: "🎯 Be Specific",
            example: "Instead of 'a dog running', use 'a golden retriever running through a meadow at sunset'"
        },
        {
            tip: "📹 Include Camera Work",
            example: "Add 'cinematic close-up shot' or 'wide-angle aerial view' for better results"
        },
        {
            tip: "🌈 Describe Style",
            example: "Mention 'photorealistic', 'artistic', 'documentary style', or 'animated'"
        },
        {
            tip: "⏰ Consider Duration",
            example: "For 5s videos: single actions. For 10s videos: sequences with multiple movements"
        },
        {
            tip: "🎨 Add Atmosphere",
            example: "Include lighting, weather, and mood: 'dramatic lighting', 'foggy morning'"
        }
    ];

    if (!isExpanded && !show) return null;

    return (
        <Card className={`${errorContent.color} border-2 transition-all duration-300`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">
                        {errorContent.title}
                    </CardTitle>
                    {onClose && (
                        <button
                            onClick={() => {
                                setIsExpanded(false);
                                onClose();
                            }}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>
                {errorContent.description && (
                    <p className="text-gray-300 text-sm">{errorContent.description}</p>
                )}
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Error-specific solutions */}
                {errorContent.solutions.length > 0 && (
                    <div>
                        <h4 className="text-cyan-300 font-semibold mb-3">🔧 Solutions</h4>
                        <ul className="space-y-2">
                            {errorContent.solutions.map((solution, index) => (
                                <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                                    <span className="text-green-400 mt-1">•</span>
                                    <span>{solution}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Content Guidelines */}
                <div>
                    <h4 className="text-cyan-300 font-semibold mb-3">📋 Content Guidelines</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {allowedContent.map((section, index) => (
                            <div key={index} className="bg-black/30 rounded-lg p-4">
                                <h5 className="font-semibold mb-2 text-sm">{section.category}</h5>
                                <ul className="space-y-1">
                                    {section.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="text-xs text-gray-300">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Prompt Tips */}
                <div>
                    <h4 className="text-cyan-300 font-semibold mb-3">💡 Prompt Writing Tips</h4>
                    <div className="space-y-3">
                        {promptTips.map((tip, index) => (
                            <div key={index} className="bg-black/30 rounded-lg p-3">
                                <h6 className="text-green-400 font-semibold text-sm mb-1">{tip.tip}</h6>
                                <p className="text-gray-300 text-xs">{tip.example}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Example Prompts */}
                <div>
                    <h4 className="text-cyan-300 font-semibold mb-3">✨ Example Successful Prompts</h4>
                    <div className="space-y-2">
                        {[
                            "A majestic eagle soaring over snow-capped mountains, cinematic aerial shot, golden hour lighting",
                            "Time-lapse of a blooming flower in a peaceful garden, macro lens, soft natural lighting",
                            "Abstract colorful paint mixing in water, slow motion, artistic macro photography",
                            "A serene lake with gentle ripples reflecting the sunset, wide shot, peaceful atmosphere"
                        ].map((prompt, index) => (
                            <div key={index} className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                                <p className="text-green-200 text-sm">"{prompt}"</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-600">
                    <button
                        onClick={() => window.open('https://klingai.com/terms', '_blank')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                        📖 Read Full Terms
                    </button>
                    <button
                        onClick={() => {
                            const prompt = "A peaceful mountain landscape with flowing water, cinematic wide shot, golden hour lighting";
                            navigator.clipboard.writeText(prompt);
                            alert('✅ Example prompt copied to clipboard!');
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                    >
                        📋 Copy Safe Example
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}