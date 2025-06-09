'use client';

import React, { useState } from 'react';
import SaveButton from '../saveButton';
import { saveToSupabase } from '@/lib/saveToSupabase';

interface KontextImageViewerProps {
  imageUrl: string | null;
  alt?: string;
  onDownload?: () => void;
  prompt?: string;
  model?: string;
  usingProxy?: boolean;
  taskId?: string | null;
}

const KontextImageViewer: React.FC<KontextImageViewerProps> = ({
  imageUrl,
  alt = 'Generated Kontext Image',
  onDownload,
  prompt = '',
  model = 'kontext-pro',
  usingProxy = false,
  taskId = null
}) => {
  const [saving, setSaving] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [saved, setSavedState] = useState(false);

  const handleSave = async () => {
    if (!imageUrl) return;
    setSaving(true);

    try {
      let base64Data: string;

      // Si es data URL, extraer base64
      if (imageUrl.startsWith('data:image/')) {
        base64Data = imageUrl.split(',')[1];
      } else {
        // Si es URL (proxy o externa), fetchear y convertir
        let fetchUrl = imageUrl;
        if (!imageUrl.startsWith('/api/proxy-image') && imageUrl.startsWith('http')) {
          fetchUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
        }

        const response = await fetch(fetchUrl);
        const blob = await response.blob();

        // Convertir blob a base64
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const result = reader.result as string;
            base64Data = result.split(',')[1];

            const { success, url, error } = await saveToSupabase({
              base64Data,
              folder: 'images',
              bucket: 'ai-generated-media',
              table: 'images',
              prompt: prompt || '',
              originalName: `flux_kontext_${model}`,
              imageId: taskId,
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
            resolve(null);
          };
          reader.readAsDataURL(blob);
        });
      }

      const { success, url, error } = await saveToSupabase({
        base64Data,
        folder: 'images',
        bucket: 'ai-generated-media',
        table: 'images',
        prompt: prompt || '',
        originalName: `flux_kontext_${model}`,
        imageId: taskId,
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
    } catch (error) {
      setSaving(false);
      console.error('Save error:', error);
      alert('Error saving image');
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      let downloadUrl = imageUrl;

      // Si no es data URL, usar proxy para descarga
      if (!imageUrl.startsWith('data:')) {
        if (!imageUrl.startsWith('/api/proxy-image')) {
          downloadUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
        }

        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `flux-kontext-${model}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
      } else {
        // Data URL - descarga directa
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `flux-kontext-${model}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

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
            onLoad={() => console.log('🖼️ Kontext image loaded successfully')}
            onError={(error) => {
              console.error('❌ Kontext image load error:', error);
            }}
            crossOrigin="anonymous"
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
            {usingProxy && (
              <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 px-3 py-1 rounded-lg text-sm">
                🔄 Via Proxy
              </div>
            )}
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
                href="/kontext"
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
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-[#8C1AD9] mb-2">
              Flux Kontext Ready
            </h3>
            <p className="text-gray-300 mb-4">
              Create advanced contextual images with AI that understands complex scenes
            </p>
            <div className="text-sm text-gray-400">
              <p className="mb-2">✨ <strong>Kontext models excel at:</strong></p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>• Complex scene understanding</div>
                <div>• Environmental coherence</div>
                <div>• Contextual relationships</div>
                <div>• Advanced composition</div>
                <div>• Lighting interactions</div>
                <div>• Atmospheric depth</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KontextImageViewer;