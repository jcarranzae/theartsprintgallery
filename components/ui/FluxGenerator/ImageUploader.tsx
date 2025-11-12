'use client';

import React, { ChangeEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, X, Upload, Grid3X3 } from 'lucide-react';

interface ImageUploaderProps {
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  selectedImageUrl?: string | null;
  setSelectedImageUrl?: (url: string | null) => void;
}

interface SupabaseImage {
  name: string;
  id: string;
  url: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageFile,
  setImageFile,
  selectedImageUrl,
  setSelectedImageUrl
}) => {
  const [supabaseImages, setSupabaseImages] = useState<SupabaseImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedImageUrl) {
      setPreviewUrl(selectedImageUrl);
    } else if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedImageUrl, imageFile]);

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
            sortBy: { column: 'name', order: 'asc' },
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
      console.error('Error al cargar imágenes de Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (setSelectedImageUrl) {
      setSelectedImageUrl(null);
    }
  };

  const handleSupabaseImageSelect = (imageUrl: string) => {
    if (setSelectedImageUrl) {
      setSelectedImageUrl(imageUrl);
      setImageFile(null);
    }
    setIsGalleryOpen(false);
  };

  const clearSelection = () => {
    setImageFile(null);
    if (setSelectedImageUrl) {
      setSelectedImageUrl(null);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-[#8C1AD9] font-semibold text-lg">📸 Input Image (Optional)</label>

      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 space-y-2">
          {/* Upload Button */}
          <label
            className="cursor-pointer bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] text-white px-4 py-2 rounded-lg font-semibold hover:from-[#7B16C2] hover:to-[#1C228C] transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center gap-2"
            style={{
              boxShadow: "0 0 12px 2px rgba(140, 26, 217, 0.3)",
            }}
          >
            <Upload size={16} />
            {imageFile || selectedImageUrl ? 'Change Image' : 'Upload Image'}
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

        {/* Image Preview */}
        {previewUrl && (
          <div className="relative w-20 h-20 flex-shrink-0">
            <img
              src={previewUrl}
              alt="Input Preview"
              className="w-full h-full object-cover rounded-lg border-2 border-[#8C1AD9]/50 shadow-lg"
            />
            <button
              onClick={clearSelection}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Galería de Imágenes</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {loading ? (
              <div className="col-span-full flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#8C1AD9]" />
              </div>
            ) : (
              supabaseImages.map((image) => (
                <Card
                  key={image.id}
                  className={`cursor-pointer overflow-hidden hover:opacity-80 transition-opacity ${selectedImageUrl === image.url ? 'ring-2 ring-[#8C1AD9]' : ''
                    }`}
                  onClick={() => handleSupabaseImageSelect(image.url)}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-32 object-cover"
                  />
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageUploader;
