'use client';

import { Upload, X } from 'lucide-react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploaderProps {
  images: File[];
  setImages: (files: File[]) => void;
}

export default function ImageUploader({ images, setImages }: ImageUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Append new files to existing ones
    setImages([...images, ...acceptedFiles]);
  }, [images, setImages]);

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: true
  });

  return (
    <div className="w-full space-y-4">
      <label className="text-[#8C1AD9] font-semibold text-lg">📸 Input Images (Optional)</label>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive
            ? 'border-[#8C1AD9] bg-[#8C1AD9]/10'
            : 'border-gray-600 hover:border-[#8C1AD9] hover:bg-zinc-900'
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className={`w-8 h-8 ${isDragActive ? 'text-[#8C1AD9]' : 'text-gray-400'}`} />
          <p className="text-sm text-gray-300">
            {isDragActive ? (
              "Drop images here..."
            ) : (
              "Drag & drop images here, or click to select"
            )}
          </p>
          <p className="text-xs text-gray-500">
            Supports multiple images (PNG, JPG, WEBP)
          </p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((file, index) => (
            <div key={index} className="relative group bg-zinc-900 rounded-lg border border-gray-700 overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
                {/* Image Index Badge */}
                <div className="absolute top-2 left-2 bg-[#8C1AD9] text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                  Image {index + 1}
                </div>
              </div>
              <div className="p-2 text-xs text-gray-400 truncate">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
