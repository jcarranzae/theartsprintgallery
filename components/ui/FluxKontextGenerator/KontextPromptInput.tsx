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
        placeholder="Describe the image context and details you want to generate. Be specific about the scene, lighting, style, and any contextual elements..."
      />
      <p className="text-gray-400 text-sm">
        💡 Tip: Kontext models excel at understanding complex scenes and contextual relationships. Be descriptive about the environment and interactions.
      </p>
    </div>
  );
}