'use client';

import { useEffect, useState } from 'react';
import ImageCard from './ImageCard';

interface ImageData {
  image_id: string;
  url: string;
  original_name: string;
  created_at: string | null;
  prompt: string;
  likes: number;
}

export default function Gallery() {
  const [images, setImages] = useState<ImageData[]>([]);

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data) => setImages(data))
      .catch((err) => console.error('Error cargando galería:', err));
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {images.map((image, index) => (
        <ImageCard key={index} {...image} />
      ))}
    </div>
  );
}
