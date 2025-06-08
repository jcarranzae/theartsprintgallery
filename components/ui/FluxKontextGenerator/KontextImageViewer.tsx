'use client';

import React, { useState } from 'react';
import SaveButton from '../../ui/saveButton';
import { saveToSupabase } from '@/lib/saveToSupabase';
import Image from 'next/image';

interface KontextImageViewerProps {
  imageUrl: string | null;
  alt?: string;
  onDownload?: () => void;
  prompt?: string;
  model?: string;
}

const KontextImageViewer: React.FC<KontextImageViewerProps> = ({ 
  imageUrl, 
  alt = 'Generated Kontext Image', 
  onDownload,
  prompt = '',
  model = 'kontext-pro'
}) => {
  const [saving, setSaving] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [saved, setSavedState] = useState(false);

  const handleSave = async () => {
    if (!imageUrl) return;
    setSaving(true);
    
    let base64Data: string;
    
    // Check if it's already base64 or a URL
    if (imageUrl.startsWith('data:image/')) {
      base64Data = imageUrl.split(',')[1];
    } else {
      // If it's a URL, fetch and convert to base64
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        
        return new Promise((resolve) => {
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
              imageId: null,
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
      } catch (error) {
        setSaving(false);
        alert('Error processing image for save');
        return;
      }
    }
    
    const { success, url, error } = await saveToSupabase({
      base64Data,
      folder: 'images',
      bucket: 'ai-generated-media',
      table: 'images',
      prompt: prompt || '',
      originalName: `flux_kontext_${model}`,
      imageId: null,
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

  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `flux-kontext-${model}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              Download
            </button>
            {!savedUrl && (
              <SaveButton 
                onClick={handleSave} 
                loading={saving}
                label="Save Image"
              />
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
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-[#8C1AD9] mb-2">
              Flux Kontext Ready
            </h3>
            <p className="text-gray-300 mb-4">
              Upload a context image and enter your prompt to generate with advanced contextual understanding
            </p>
            <div className="text-sm text-gray-400">
              <p>✨ Kontext models excel at:</p>
              <ul className="mt-2 space-y-1">
                <li>• Complex scene understanding</li>
                <li>• Contextual relationships</li>
                <li>• Environmental coherence</li>
                <li>• Advanced composition</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KontextImageViewer;