'use client';

interface KontextPromptInputProps {
  prompt: string;
  onChangePrompt: (val: string) => void;
}

export default function KontextPromptInput({ prompt, onChangePrompt }: KontextPromptInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-[#8C1AD9] font-semibold text-lg">
        ✨ Contextual Prompt
      </label>
      <textarea
        value={prompt}
        onChange={(e) => onChangePrompt(e.target.value)}
        rows={4}
        className="w-full p-3 rounded-lg bg-zinc-900 text-white border-2 border-[#8C1AD9] focus:ring-2 focus:ring-[#8C1AD9] shadow-md outline-none transition-all placeholder:text-[#8C1AD9]/50 resize-none"
        placeholder="Describe the contextual scene you want to generate. Be specific about the environment, lighting, style, and any interactions between elements..."
      />
      <div className="text-gray-400 text-sm space-y-1">
        <p className="flex items-center gap-2">
          <span className="text-[#8C1AD9]">💡</span>
          <span><strong>Tip:</strong> Kontext models excel at understanding complex scenes and contextual relationships</span>
        </p>
        <p className="text-xs text-gray-500">
          Examples: "A bustling cyberpunk market at night with vendors selling glowing tech gadgets under neon signs" or "A serene Japanese garden with cherry blossoms reflecting in a koi pond at golden hour"
        </p>
      </div>
    </div>
  );
}