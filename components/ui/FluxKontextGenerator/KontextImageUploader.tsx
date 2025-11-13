'use client';

import React, { ChangeEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, X, Image as ImageIcon, Upload, Grid3X3 } from 'lucide-react';

interface KontextImageUploaderProps {
  imageFiles: (File | null)[];
  setImageFiles: (files: (File | null)[]) => void;
  selectedImageUrls?: (string | null)[];
  setSelectedImageUrls?: (urls: (string | null)[]) => void;
}

interface SupabaseImage {
  name: string;
  id: string;
  url: string;
}

const KontextImageUploader: React.FC<KontextImageUploaderProps> = ({
  imageFiles,
  setImageFiles,
  selectedImageUrls = [null, null, null, null],
  setSelectedImageUrls
}) => {
  const [supabaseImages, setSupabaseImages] = useState<SupabaseImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<number>(0); // Slot actual para subir/seleccionar
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([null, null, null, null]);

  useEffect(() => {
    const newPreviews: (string | null)[] = [null, null, null, null];
    const urlsToRevoke: string[] = [];

    for (let i = 0; i < 4; i++) {
      if (selectedImageUrls[i]) {
        newPreviews[i] = selectedImageUrls[i];
      } else if (imageFiles[i]) {
        const url = URL.createObjectURL(imageFiles[i]!);
        newPreviews[i] = url;
        urlsToRevoke.push(url);
      }
    }

    setPreviewUrls(newPreviews);

    return () => {
      urlsToRevoke.forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedImageUrls, imageFiles]);

  useEffect(() => {
    if (isGalleryOpen) {
      fetchSupabaseImages();
    }
  }, [isGalleryOpen]);

  const fetchSupabaseImages = async () => {
    try {
      setLoading(true);
      let allImages: SupabaseImage[] = [];
      let offset = 0;
      const limit = 100;

      while (true) {
        const { data, error } = await supabase
          .storage
          .from('ai-generated-media')
          .list('images', {
            limit,
            offset,
            sortBy: { column: 'name', order: 'desc' },
          });

        if (error) throw error;
        if (!data || data.length === 0) break;

        const images = data.map(file => ({
          name: file.name,
          id: file.id,
          url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ai-generated-media/images/${file.name}`
        }));

        allImages = [...allImages, ...images];
        offset += limit;

        if (data.length < limit) break;
      }

      setSupabaseImages(allImages);
    } catch (error) {
      console.error('Error loading images from Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    const newFiles = [...imageFiles];
    newFiles[currentSlot] = file;
    setImageFiles(newFiles);

    if (setSelectedImageUrls) {
      const newUrls = [...selectedImageUrls];
      newUrls[currentSlot] = null;
      setSelectedImageUrls(newUrls);
    }
  };

  const handleSupabaseImageSelect = (imageUrl: string) => {
    if (setSelectedImageUrls) {
      const newUrls = [...selectedImageUrls];
      newUrls[currentSlot] = imageUrl;
      setSelectedImageUrls(newUrls);

      const newFiles = [...imageFiles];
      newFiles[currentSlot] = null;
      setImageFiles(newFiles);
    }
    setIsGalleryOpen(false);
  };

  const clearSelection = (slotIndex: number) => {
    const newFiles = [...imageFiles];
    newFiles[slotIndex] = null;
    setImageFiles(newFiles);

    if (setSelectedImageUrls) {
      const newUrls = [...selectedImageUrls];
      newUrls[slotIndex] = null;
      setSelectedImageUrls(newUrls);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-[#8C1AD9] font-semibold text-lg">
        📸 Context Images (Up to 4)
        <span className="text-xs text-cyan-400 ml-2">✨ Experimental Multiref</span>
      </label>

      {/* Slot Selector */}
      <div className="flex gap-2 mb-3">
        {[0, 1, 2, 3].map((slot) => (
          <button
            key={slot}
            onClick={() => setCurrentSlot(slot)}
            className={`px-3 py-1 rounded-lg font-semibold text-sm transition-all ${
              currentSlot === slot
                ? 'bg-[#8C1AD9] text-white shadow-lg'
                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
            }`}
          >
            Slot {slot + 1}
            {(previewUrls[slot]) && ' ✓'}
          </button>
        ))}
      </div>

      <div className="flex items-start gap-3 w-full">
        <div className="flex-1 space-y-2">
          {/* Upload Button */}
          <label
            className="cursor-pointer bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] text-white px-4 py-2 rounded-lg font-semibold hover:from-[#7B16C2] hover:to-[#1C228C] transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center gap-2"
            style={{
              boxShadow: "0 0 12px 2px rgba(140, 26, 217, 0.3)",
            }}
          >
            <Upload size={16} />
            {previewUrls[currentSlot] ? 'Change Image' : `Upload to Slot ${currentSlot + 1}`}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {/* Gallery Button */}
          <Button
            variant="outline"
            onClick={() => setIsGalleryOpen(true)}
            className="ml-2 border-[#8C1AD9] text-[#8C1AD9] hover:bg-[#8C1AD9]/10 inline-flex items-center gap-2"
          >
            <Grid3X3 size={16} />
            Browse Gallery
          </Button>
        </div>

        {/* Image Previews Grid */}
        <div className="grid grid-cols-2 gap-2">
          {previewUrls.map((url, index) => (
            url && (
              <div key={index} className="relative w-16 h-16 flex-shrink-0">
                <div className="absolute -top-1 -left-1 bg-[#8C1AD9] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold z-10">
                  {index + 1}
                </div>
                <img
                  src={url}
                  alt={`Context ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border-2 border-[#8C1AD9]/50 shadow-lg"
                />
                <button
                  onClick={() => clearSelection(index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors shadow-lg z-10"
                >
                  <X size={10} />
                </button>
              </div>
            )
          ))}
        </div>
      </div>

      <div className="text-gray-400 text-sm space-y-1">
        <p className="flex items-center gap-2">
          <span className="text-[#8C1AD9]">💡</span>
          <span><strong>Multi-Image Context:</strong> Upload up to 4 reference images for advanced composition control</span>
        </p>
        <p className="text-xs text-gray-500 ml-6">
          {currentSlot === 0 && 'Slot 1: Primary reference image for overall style and composition'}
          {currentSlot > 0 && `Slot ${currentSlot + 1}: Additional reference for enhanced multiref understanding (Experimental)`}
        </p>
      </div>

      {/* Gallery Dialog */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-zinc-900 border border-[#8C1AD9]/30">
          <DialogHeader>
            <DialogTitle className="text-[#8C1AD9] text-xl">
              🖼️ Image Gallery - Slot {currentSlot + 1}
            </DialogTitle>
            <p className="text-gray-400 text-sm">Select an image for context slot {currentSlot + 1}</p>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {loading ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#8C1AD9] mx-auto mb-2" />
                  <p className="text-gray-400">Loading gallery...</p>
                </div>
              </div>
            ) : supabaseImages.length > 0 ? (
              supabaseImages.map((image) => (
                <Card
                  key={image.id}
                  className={`cursor-pointer overflow-hidden hover:opacity-80 transition-all duration-200 hover:scale-105 bg-zinc-800 border-zinc-700 hover:border-[#8C1AD9]/50 ${selectedImageUrls[currentSlot] === image.url ? 'ring-2 ring-[#8C1AD9] border-[#8C1AD9]' : ''
                    }`}
                  onClick={() => handleSupabaseImageSelect(image.url)}
                >
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-32 object-cover"
                    />
                    {selectedImageUrls[currentSlot] === image.url && (
                      <div className="absolute inset-0 bg-[#8C1AD9]/20 flex items-center justify-center">
                        <div className="bg-[#8C1AD9] text-white rounded-full p-2">
                          <ImageIcon size={16} />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <ImageIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No images found</p>
                <p className="text-gray-500 text-sm">
                  Generate some images first and they'll appear here for reuse as context
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-zinc-800 rounded-lg border border-[#8C1AD9]/20">
            <h4 className="text-[#8C1AD9] font-semibold mb-2">🎯 Using Context Images Effectively</h4>
            <div className="text-xs text-gray-300 space-y-1">
              <p>• <strong>Style Transfer:</strong> Use an image to apply its visual style to your prompt</p>
              <p>• <strong>Composition:</strong> Reference the layout and arrangement of elements</p>
              <p>• <strong>Lighting:</strong> Inherit the lighting conditions and atmosphere</p>
              <p>• <strong>Color Palette:</strong> Adopt the color scheme from the reference image</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KontextImageUploader;