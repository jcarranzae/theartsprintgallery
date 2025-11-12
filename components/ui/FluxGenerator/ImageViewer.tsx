'use client';

import React, { useState } from 'react';
import SaveButton from '../../ui/saveButton';
import { saveToSupabase } from '@/lib/saveToSupabase';

interface ImageViewerProps {
  imageUrl: string | null;
  alt?: string;
  onDownload?: () => void;
  prompt?: string;
  imageId?: string | null;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  imageUrl,
  alt = 'Generated Image',
  onDownload,
  prompt = '',
  imageId = null
}) => {
  const [saving, setSaving] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [saved, setSavedState] = useState(false);

  const handleSave = async () => {
    if (!imageUrl) return;
    setSaving(true);

    const base64Data = imageUrl.split(',')[1];
    const { success, url, error } = await saveToSupabase({
      base64Data,
      folder: 'images',
      bucket: 'ai-generated-media',
      table: 'images',
      prompt: prompt || '',
      originalName: 'flux_output',
      imageId,
    });

    setSaving(false);
    if (success && url) {
      setSavedUrl(url);
      setSavedState(true);
    } else {
      if (error === 'Usuario no autenticado') {
        alert('You must be authenticated to save images. Please log in.');
      } else {
        alert(error || 'Error saving image');
      }
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `flux-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onDownload) onDownload();
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Try right-click → Save image as...');
    }
  };

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-[600px] rounded-lg shadow-2xl border border-[#8C1AD9]/30"
            style={{
              boxShadow: "0 0 32px 8px rgba(140, 26, 217, 0.2)",
            }}
            onLoad={() => console.log('🖼️ Image loaded successfully')}
            onError={(error) => {
              console.error('❌ Image load error:', error);
            }}
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              📥 Download
            </button>
            {!savedUrl && (
              <SaveButton
                onClick={handleSave}
                loading={saving}
                label="Save Image"
              />
            )}
          </div>

          {/* Status indicators */}
          <div className="absolute top-4 right-4 space-y-2">
            {saved && (
              <div className="bg-green-500/20 border border-green-500 text-green-200 px-3 py-1 rounded-lg text-sm">
                ✅ Saved
              </div>
            )}
          </div>

          {saved && (
            <div className="absolute bottom-16 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
              <p className="text-sm">Image saved successfully!</p>
              <a
                href="/dashboard/createImage"
                className="block text-center hover:text-green-200 text-white font-semibold text-sm mt-1"
              >
                Create another image
              </a>
            </div>
          )}
        </>
      ) : (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div className="text-center p-8 bg-zinc-900/50 rounded-lg border border-[#8C1AD9]/30">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-[#8C1AD9] mb-2">
              FLUX Ready
            </h3>
            <p className="text-gray-300 mb-4">
              Create professional AI-generated images with Black Forest Labs technology
            </p>
            <div className="text-sm text-gray-400">
              <p className="mb-2">🚀 <strong>FLUX models excel at:</strong></p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>• Photorealistic images</div>
                <div>• Artistic styles</div>
                <div>• Complex compositions</div>
                <div>• High detail</div>
                <div>• Natural lighting</div>
                <div>• Precise control</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageViewer;
