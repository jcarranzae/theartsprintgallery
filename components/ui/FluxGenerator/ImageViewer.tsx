'use client';

import React from 'react';

interface ImageViewerProps {
  imageUrl: string | null;
  alt?: string;
  onDownload?: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ imageUrl, alt = 'Imagen generada', onDownload }) => {
  if (!imageUrl) return null;

  return (
    <div className="flex flex-col items-center mt-6">
      <img
        src={imageUrl}
        alt={alt}
        className="rounded-lg shadow-lg max-w-full h-auto border-2 border-purple-500"
        style={{ maxHeight: 512 }}
      />
      {onDownload && (
        <button
          onClick={onDownload}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-800 text-white font-semibold rounded-lg transition-colors"
        >
          Descargar
        </button>
      )}
    </div>
  );
};

export default ImageViewer;
