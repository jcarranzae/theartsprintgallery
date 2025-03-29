'use client';

import { useState } from 'react';

interface ImageCardProps {
  url: string;
  original_name: string;
  created_at: string | null;
  prompt: string;
  likes: number;
  image_id: string;
}

export default function ImageCard({ url, original_name, created_at, prompt, likes, image_id }: ImageCardProps) {
  const [likeCount, setLikeCount] = useState(likes);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = async () => {
    if (hasLiked) return;

    const res = await fetch('/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId: image_id }),
    });

    const data = await res.json();
    if (res.ok) {
      setLikeCount((prev) => prev + 1);
      setHasLiked(true);
    } else {
      alert(data.error || data.message);
    }
  };

  return (
    <>
      <div className="relative cursor-pointer group">
        <img src={url} alt={original_name} className="w-full h-auto rounded-lg shadow-md" />

        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          <button
            onClick={handleLike}
            disabled={hasLiked}
            className={`px-2 py-1 rounded-full text-sm font-medium ${
              hasLiked ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'
            } text-white`}
          >
            ❤️ {likeCount}
          </button>
        </div>
      </div>
    </>
  );
}
