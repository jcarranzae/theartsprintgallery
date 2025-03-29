// components/Controls.tsx
'use client';

import { ChangeEvent, Dispatch, SetStateAction } from 'react';

interface ControlsProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  image: HTMLImageElement | null;
  setImage: Dispatch<SetStateAction<HTMLImageElement | null>>;
}

export default function Controls({ prompt, onPromptChange, image, setImage }: ControlsProps) {
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-2xl flex flex-col md:flex-row items-center justify-center gap-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="w-full md:w-auto file:bg-blue-600 file:text-white file:rounded-md file:px-4 file:py-2 file:cursor-pointer"
      />
      <input
        type="text"
        placeholder="Describe tu imagen..."
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        className="flex-1 border border-gray-300 rounded-md px-4 py-2 w-full"
      />
    </div>
  );
}
