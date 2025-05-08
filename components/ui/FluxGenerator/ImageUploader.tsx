'use client';

import React, { ChangeEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

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

  useEffect(() => {
    fetchSupabaseImages();
  }, []);

  const fetchSupabaseImages = async () => {
    try {
      const { data, error } = await supabase
        .storage
        .from('ai-generated-media')
        .list('images', {
          limit: 50,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) throw error;

      const images = data.map(file => ({
        name: file.name,
        id: file.id,
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ai-generated-media/images/${file.name}`
      }));

      setSupabaseImages(images);
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
  };

  return (
    <div className="flex flex-col items-center mt-6 w-full">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Subir Imagen</TabsTrigger>
          <TabsTrigger value="gallery">Galería</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
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
        </TabsContent>

        <TabsContent value="gallery">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {loading ? (
              <div>Cargando imágenes...</div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImageUploader;
