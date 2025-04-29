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
      <label className="cursor-pointer bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded-lg shadow-md transition-colors">
        {imageFile ? 'Cambiar Imagen' : 'Subir Imagen'}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </label>
      {imageFile && (
        <span className="mt-2 text-sm text-gray-300">
          {imageFile.name}
        </span>
      )}
    </div>
  );
};

export default ImageUploader;
