'use client';

import React, { useState } from 'react';
import SaveButton from '../../ui/saveButton';
import { saveToSupabase } from '@/lib/saveToSupabase';

interface ImageViewerProps {
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  alt?: string;
  onDownload?: () => void;
  prompt?: string;
  imageId?: string | null;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  imageUrl,
  imageUrls,
  alt = 'Generated Image',
  onDownload,
  prompt = '',
  imageId = null
}) => {
  const [saving, setSaving] = useState<number | null>(null);
  const [savedUrls, setSavedUrls] = useState<Record<number, string>>({});
  const [saved, setSavedState] = useState<Record<number, boolean>>({});

  // Normalizar para trabajar siempre con un array
  const images = imageUrls || (imageUrl ? [imageUrl] : null);
  const hasMultipleImages = images && images.length > 1;

  const handleSave = async (index: number, imgUrl: string) => {
    setSaving(index);

    const base64Data = imgUrl.split(',')[1];
    const { success, url, error } = await saveToSupabase({
      base64Data,
      folder: 'images',
      bucket: 'ai-generated-media',
      table: 'images',
      prompt: prompt || '',
      originalName: `flux_output_${index + 1}`,
      imageId,
    });

    setSaving(null);
    if (success && url) {
      setSavedUrls(prev => ({ ...prev, [index]: url }));
      setSavedState(prev => ({ ...prev, [index]: true }));
    } else {
      if (error === 'Usuario no autenticado') {
        alert('You must be authenticated to save images. Please log in.');
      } else {
        alert(error || 'Error saving image');
      }
    }
  };

  const handleDownload = async (imgUrl: string, index: number) => {
    try {
      const link = document.createElement('a');
      link.href = imgUrl;
      link.download = `flux-image-${index + 1}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onDownload) onDownload();
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Try right-click → Save image as...');
    }
  };

  const handleDownloadAll = async () => {
    if (!images) return;
    for (let i = 0; i < images.length; i++) {
      await handleDownload(images[i], i);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <div className="relative w-full min-h-[600px] flex items-center justify-center">
      {images ? (
        <>
          {hasMultipleImages ? (
            /* Grid para múltiples imágenes */
            <div className="w-full space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {images.map((imgUrl, index) => {
                  // Definir etiquetas para cada variación
                  const getVariationLabel = (idx: number) => {
                    switch (idx) {
                      case 0: return '📸 Original';
                      case 1: return '✨ Upsampled';
                      case 2: return '🔄 Alt. Perspective';
                      case 3: return '🎨 Diff. Composition';
                      default: return `#${idx + 1}`;
                    }
                  };

                  return (
                    <div key={index} className="relative group">
                      <div className="relative">
                        <img
                          src={imgUrl}
                          alt={`${alt} ${index + 1}`}
                          className="w-full h-auto rounded-lg shadow-2xl border border-[#8C1AD9]/30"
                          style={{
                            boxShadow: "0 0 32px 8px rgba(140, 26, 217, 0.2)",
                          }}
                          onLoad={() => console.log(`🖼️ Image ${index + 1} loaded successfully`)}
                          onError={(error) => {
                            console.error(`❌ Image ${index + 1} load error:`, error);
                          }}
                        />

                        {/* Etiqueta de variación */}
                        <div className="absolute top-2 left-2 bg-[#8C1AD9] text-white font-bold px-3 py-1 rounded-lg text-xs">
                          {getVariationLabel(index)}
                        </div>

                      {/* Botones individuales */}
                      <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDownload(imgUrl, index)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg text-sm"
                        >
                          📥
                        </button>
                        {!savedUrls[index] && (
                          <SaveButton
                            onClick={() => handleSave(index, imgUrl)}
                            loading={saving === index}
                            label="💾"
                          />
                        )}
                      </div>

                      {/* Indicador de guardado */}
                      {saved[index] && (
                        <div className="absolute top-2 right-2 bg-green-500/20 border border-green-500 text-green-200 px-2 py-1 rounded-lg text-xs">
                          ✅
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* Leyenda de variaciones (solo si hay 4 imágenes) */}
              {images.length === 4 && (
                <div className="bg-zinc-900/50 border border-[#8C1AD9]/30 rounded-lg p-4 mt-4">
                  <h4 className="text-[#8C1AD9] font-semibold text-sm mb-2">🎯 Variation Guide</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                    <div><span className="font-bold">📸 Original:</span> Your exact prompt</div>
                    <div><span className="font-bold">✨ Upsampled:</span> AI-enhanced prompt for better detail</div>
                    <div><span className="font-bold">🔄 Alt. Perspective:</span> Different viewpoint interpretation</div>
                    <div><span className="font-bold">🎨 Diff. Composition:</span> Alternative arrangement & layout</div>
                  </div>
                </div>
              )}

              {/* Botones globales */}
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={handleDownloadAll}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold rounded-lg transition-all shadow-lg"
                >
                  📥 Download All ({images.length})
                </button>
              </div>
            </div>
          ) : (
            /* Vista única para una sola imagen */
            <>
              <img
                src={images[0]}
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
                  onClick={() => handleDownload(images[0], 0)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
                >
                  📥 Download
                </button>
                {!savedUrls[0] && (
                  <SaveButton
                    onClick={() => handleSave(0, images[0])}
                    loading={saving === 0}
                    label="Save Image"
                  />
                )}
              </div>

              {/* Status indicators */}
              <div className="absolute top-4 right-4 space-y-2">
                {saved[0] && (
                  <div className="bg-green-500/20 border border-green-500 text-green-200 px-3 py-1 rounded-lg text-sm">
                    ✅ Saved
                  </div>
                )}
              </div>

              {saved[0] && (
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
