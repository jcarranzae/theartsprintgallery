'use client';

interface PromptInputProps {
  prompt: string;
  negativePrompt: string | null;
  onChangePrompt: (val: string) => void;
  onChangeNegativePrompt: (val: string) => void;
}

export default function PromptInput({ prompt, negativePrompt, onChangePrompt, onChangeNegativePrompt }: PromptInputProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[#8C1AD9] font-semibold text-lg">
          ✨ Image Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => onChangePrompt(e.target.value)}
          rows={4}
          className="w-full p-3 rounded-lg bg-zinc-900 text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] shadow-md outline-none transition-all placeholder:text-[#8C1AD9]/50 resize-none"
          placeholder="Describe the image you want to generate. Be specific about style, lighting, composition, and details..."
        />
        <div className="text-gray-400 text-sm space-y-1">
          <p className="flex items-center gap-2">
            <span className="text-[#8C1AD9]">💡</span>
            <span><strong>Tip:</strong> Be specific and descriptive for best results</span>
          </p>
          <p className="text-xs text-gray-500">
            Example: "A majestic lion standing on a cliff at sunset, golden hour lighting, photorealistic, detailed fur texture, dramatic sky with orange and purple clouds"
          </p>
        </div>
      </div>

      {negativePrompt !== null && (
        <div className="space-y-2">
          <label className="text-[#8C1AD9] font-semibold text-lg">
            🚫 Negative Prompt
          </label>
          <textarea
            value={negativePrompt || ''}
            onChange={(e) => onChangeNegativePrompt(e.target.value)}
            rows={2}
            className="w-full p-3 rounded-lg bg-zinc-900 text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] shadow-md outline-none transition-all placeholder:text-[#8C1AD9]/50 resize-none"
            placeholder="Describe what you don't want in the image (optional)"
          />
        </div>
      )}
    </div>
  );
}
