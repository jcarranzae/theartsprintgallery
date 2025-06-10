// components/ui/KlingVideoGenerator/KlingPromptInput.tsx
'use client';

interface KlingPromptInputProps {
    prompt: string;
    onChangePrompt: (val: string) => void;
    negativePrompt: string;
    onChangeNegativePrompt: (val: string) => void;
}

export default function KlingPromptInput({
    prompt,
    onChangePrompt,
    negativePrompt,
    onChangeNegativePrompt
}: KlingPromptInputProps) {
    return (
        <div className="space-y-4">
            {/* Positive Prompt */}
            <div className="space-y-2">
                <label className="text-[#8C1AD9] font-semibold text-lg">
                    ✨ Video Prompt
                </label>
                <textarea
                    value={prompt}
                    onChange={(e) => onChangePrompt(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-lg bg-zinc-900 text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] shadow-md outline-none transition-all placeholder:text-[#8C1AD9]/50 resize-none"
                    placeholder="Describe the video you want to generate. Include details about motion, camera movement, scene, lighting, and style..."
                    maxLength={2500}
                />
                <div className="flex justify-between items-center text-xs">
                    <div className="text-gray-400 space-y-1">
                        <p className="flex items-center gap-2">
                            <span className="text-[#8C1AD9]">💡</span>
                            <span><strong>Tip:</strong> Be specific about motion, camera angles, and temporal elements</span>
                        </p>
                        <p className="text-gray-500">
                            Examples: "A majestic eagle soaring over snow-capped mountains, cinematic camera following its flight" or "Time-lapse of a bustling city at night with flowing traffic lights"
                        </p>
                    </div>
                    <span className={`${prompt.length > 2000 ? 'text-red-400' : 'text-gray-500'}`}>
                        {prompt.length}/2500
                    </span>
                </div>
            </div>

            {/* Negative Prompt */}
            <div className="space-y-2">
                <label className="text-orange-400 font-semibold text-lg">
                    🚫 Negative Prompt (Optional)
                </label>
                <textarea
                    value={negativePrompt}
                    onChange={(e) => onChangeNegativePrompt(e.target.value)}
                    rows={2}
                    className="w-full p-3 rounded-lg bg-zinc-900 text-white border-2 border-orange-400 focus:ring-2 focus:ring-orange-400 shadow-md outline-none transition-all placeholder:text-orange-400/50 resize-none"
                    placeholder="Describe what you don't want in the video (low quality, blurry, shaky camera, artifacts...)"
                    maxLength={2500}
                />
                <div className="flex justify-between items-center text-xs">
                    <div className="text-gray-400 space-y-1">
                        <p className="flex items-center gap-2">
                            <span className="text-orange-400">⚠️</span>
                            <span><strong>Avoid:</strong> Specify unwanted elements, styles, or quality issues</span>
                        </p>
                        <p className="text-gray-500">
                            Common: "blurry, low quality, shaky camera, distorted, artifacts, bad lighting"
                        </p>
                    </div>
                    <span className={`${negativePrompt.length > 2000 ? 'text-red-400' : 'text-gray-500'}`}>
                        {negativePrompt.length}/2500
                    </span>
                </div>
            </div>

            {/* Video Generation Tips */}
            <div className="bg-gradient-to-r from-[#8C1AD9]/10 to-cyan-900/10 rounded-lg p-4 border border-[#8C1AD9]/30">
                <h4 className="text-cyan-300 font-semibold mb-2">🎬 Video Generation Tips</h4>
                <div className="text-xs text-gray-300 space-y-1">
                    <p><strong>Motion:</strong> Describe movement patterns (slow motion, fast-paced, smooth tracking)</p>
                    <p><strong>Camera:</strong> Specify angles (close-up, wide shot, tracking, panning, zooming)</p>
                    <p><strong>Lighting:</strong> Define atmosphere (golden hour, dramatic shadows, neon lighting)</p>
                    <p><strong>Style:</strong> Mention cinematography (cinematic, documentary, artistic, realistic)</p>
                    <p><strong>Duration:</strong> Consider pacing appropriate for your chosen video length</p>
                </div>
            </div>
        </div>
    );
}