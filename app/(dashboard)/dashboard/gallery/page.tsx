'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Music, Video, Filter } from 'lucide-react';

interface MediaAsset {
  id: number;
  file_name: string;
  file_type: string;
  bucket_path: string;
  publicUrl?: string;
  metadata: {
    thumbnail_url?: string;
    original_url?: string;
    prompt?: string;
  };
  created_at: string;
}

export default function GalleryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'audio' | 'video'>('all');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar los datos para asegurar que tenemos las URLs públicas correctas
      const assetsWithUrls = data?.map(asset => {
        // Obtener la URL pública del bucket de Supabase
        const { data: urlData } = supabase.storage
          .from('ai-generated-media')
          .getPublicUrl(asset.bucket_path);

         /* const { data, error } = await supabase.storage
            .from('ai-generated-media')
            .createSignedUrl('private-document.pdf', 3600)*/

        // Normalizar el tipo de archivo
        const normalizedType = asset.file_type.toLowerCase();
        const fileType = normalizedType.includes('audio') ? 'audio' :
                        normalizedType.includes('image') ? 'image' :
                        normalizedType.includes('video') ? 'video' : 'other';

        return {
          ...asset,
          file_type: fileType,
          publicUrl: urlData?.publicUrl,
          metadata: {
            ...asset.metadata,
          }
        };
      }) || [];

      console.log('Assets cargados:', assetsWithUrls);
      setAssets(assetsWithUrls);
    } catch (error) {
      console.error('Error al cargar los archivos multimedia:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = (type?: 'image' | 'audio' | 'video') => {
    return assets.filter(asset => !type || asset.file_type === type);
  };

  const MediaCard = ({ asset }: { asset: MediaAsset }) => {
    const getIcon = () => {
      switch (asset.file_type) {
        case 'image':
          return <ImageIcon className="w-6 h-6" />;
        case 'audio':
          return <Music className="w-6 h-6" />;
        case 'video':
          return <Video className="w-6 h-6" />;
        default:
          return <Filter className="w-6 h-6" />;
      }
    };

    const renderMediaPreview = () => {
      switch (asset.file_type) {
        case 'image':
          return (
            <div className="relative aspect-video">
              <img
                src={asset.publicUrl}
                alt={asset.file_name}
                className="w-full h-full object-cover"
              />
            </div>
          );
        case 'audio':
          return (
            <div className="bg-gray-100 aspect-video flex flex-col items-center justify-center p-4">
              {getIcon()}
              <audio
                controls
                className="mt-4 w-full max-w-[250px]"
                src={asset.publicUrl}
              >
                Tu navegador no soporta el elemento de audio.
              </audio>
            </div>
          );
        case 'video':
          return (
            <div className="relative aspect-video">
              <video
                controls
                className="w-full h-full object-cover"
                src={asset.publicUrl}
              >
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          );
        default:
          return (
            <div className="bg-gray-100 aspect-video flex items-center justify-center">
              {getIcon()}
            </div>
          );
      }
    };

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          {renderMediaPreview()}
          <div className="p-4">
            <h3 className="text-sm font-medium truncate">{asset.file_name}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(asset.created_at).toLocaleDateString()}
            </p>
            {asset.metadata.prompt && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                {asset.metadata.prompt}
              </p>
            )}
            {asset.publicUrl && (
              <a
                href={asset.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block"
              >
                Ver archivo completo
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const MediaSection = ({ title, type, showAll = false }: { title: string, type?: 'image' | 'audio' | 'video', showAll?: boolean }) => {
    const items = filteredAssets(type);
    const displayItems = showAll ? items : items.slice(0, 4);

    if (items.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          {!showAll && items.length > 4 && (
            <Button variant="link" asChild>
              <Link href={`/dashboard/gallery/${type}s`}>
                Ver más
              </Link>
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayItems.map((asset) => (
            <MediaCard key={asset.id} asset={asset} />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Tu Galería Multimedia</h1>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="image">Imágenes</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-8">
          <MediaSection title="Imágenes Recientes" type="image" />
          <MediaSection title="Audio Reciente" type="audio" />
          <MediaSection title="Videos Recientes" type="video" />
        </TabsContent>

        <TabsContent value="image">
          <MediaSection title="Todas las Imágenes" type="image" showAll />
        </TabsContent>

        <TabsContent value="audio">
          <MediaSection title="Todo el Audio" type="audio" showAll />
        </TabsContent>

        <TabsContent value="video">
          <MediaSection title="Todos los Videos" type="video" showAll />
        </TabsContent>
      </Tabs>
    </div>
  );
} 
