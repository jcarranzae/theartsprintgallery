'use client';

import React, { ChangeEvent } from 'react';

interface ImageUploaderProps {
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ imageFile, setImageFile }) => {
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  return (
    <div className="flex flex-col items-center mt-6">
      <label 
        className="cursor-pointer bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] text-white px-4 py-2 rounded-lg font-semibold hover:from-[#7B16C2] hover:to-[#1C228C] transition-all duration-300 hover:scale-105 shadow-lg"
        style={{
          boxShadow: "0 0 16px 3px #8C1AD9",
          borderRadius: "12px",
        }}
      >
        {imageFile ? 'Cambiar Imagen' : 'Subir Imagen'}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </label>
      {imageFile && (
        <span className="mt-2 text-sm text-[#8C1AD9] font-medium">
          {imageFile.name}
        </span>
      )}
    </div>
  );
};

export default ImageUploader;
