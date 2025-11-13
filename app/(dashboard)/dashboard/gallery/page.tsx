'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Loader2, ImageIcon } from 'lucide-react';

interface ImageData {
  id: number;
  url: string;
  prompt: string;
  original_name: string;
  created_at: string;
  image_id: string | null;
  likes: number;
}

export default function GalleryPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Cargar imágenes
  const fetchImages = useCallback(async (pageNum: number) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(`/api/user-images?page=${pageNum}&limit=20`);
      if (!response.ok) throw new Error('Error al cargar imágenes');

      const data = await response.json();

      if (pageNum === 0) {
        setImages(data.images);
      } else {
        setImages(prev => [...prev, ...data.images]);
      }

      setHasMore(data.hasMore);
      setTotal(data.total);
      setPage(pageNum);
    } catch (error) {
      console.error('Error al cargar imágenes:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Cargar primera página
  useEffect(() => {
    fetchImages(0);
  }, [fetchImages]);

  // Intersection Observer para scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchImages(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, page, fetchImages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#8C1AD9]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          🖼️ <span className="text-[#8C1AD9]">Your</span> Gallery
        </h1>
        <p className="text-gray-300">
          {total} image{total !== 1 ? 's' : ''} generated
        </p>
      </div>

      {/* Grid de imágenes */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <ImageIcon className="h-16 w-16 text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No images yet</h3>
          <p className="text-gray-400 mb-4">Start creating images to see them here</p>
          <Link
            href="/dashboard/createImage"
            className="px-6 py-3 bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] text-white font-semibold rounded-lg hover:from-[#7B16C2] hover:to-[#1C228C] transition-all"
          >
            Create Your First Image
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image) => (
              <Link
                key={image.id}
                href={`/dashboard/gallery/${image.id}`}
                className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 hover:border-[#8C1AD9]/50 transition-all duration-300 hover:scale-105"
              >
                <img
                  src={image.url}
                  alt={image.original_name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-xs font-medium line-clamp-2">
                      {image.prompt}
                    </p>
                    <p className="text-gray-300 text-xs mt-1">
                      {new Date(image.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Observer target para scroll infinito */}
          <div ref={observerTarget} className="h-20 flex items-center justify-center">
            {loadingMore && (
              <Loader2 className="h-6 w-6 animate-spin text-[#8C1AD9]" />
            )}
            {!hasMore && images.length > 0 && (
              <p className="text-gray-500 text-sm">No more images to load</p>
            )}
          </div>
        </>
      )}
    </div>
  );
} 
