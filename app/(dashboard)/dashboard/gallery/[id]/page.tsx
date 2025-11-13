'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Edit2, Check, X, Calendar, Hash } from 'lucide-react';
import Link from 'next/link';

interface ImageData {
  id: number;
  url: string;
  prompt: string;
  original_name: string;
  created_at: string;
  image_id: string | null;
  likes: number;
}

export default function ImageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const imageId = params.id as string;

  const [image, setImage] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    fetchImageDetails();
  }, [imageId]);

  const fetchImageDetails = async () => {
    try {
      const response = await fetch(`/api/image-detail/${imageId}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/dashboard/gallery');
          return;
        }
        throw new Error('Error al cargar la imagen');
      }

      const data = await response.json();
      setImage(data);
      setNewName(data.original_name);
    } catch (error) {
      console.error('Error al cargar imagen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!image || !newName.trim()) return;

    setSavingName(true);
    try {
      const response = await fetch(`/api/update-image-name`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: image.id,
          newName: newName.trim(),
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar el nombre');

      setImage({ ...image, original_name: newName.trim() });
      setEditingName(false);
    } catch (error) {
      console.error('Error al guardar nombre:', error);
      alert('Error al actualizar el nombre');
    } finally {
      setSavingName(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#8C1AD9]" />
      </div>
    );
  }

  if (!image) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-white mb-4">Image not found</h2>
        <Link
          href="/dashboard/gallery"
          className="text-[#8C1AD9] hover:text-[#7B16C2] transition-colors"
        >
          ← Back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header con botón de volver */}
      <div className="mb-6">
        <Link
          href="/dashboard/gallery"
          className="inline-flex items-center gap-2 text-[#8C1AD9] hover:text-[#7B16C2] transition-colors font-semibold"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Gallery
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagen */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
            <img
              src={image.url}
              alt={image.original_name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Botón de descarga */}
          <a
            href={image.url}
            download={image.original_name}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all"
          >
            📥 Download Image
          </a>
        </div>

        {/* Detalles */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Image Details
            </h1>
            <p className="text-gray-400 text-sm">View and edit image information</p>
          </div>

          {/* Nombre (editable) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-[#8C1AD9] flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Name
              </label>
              {!editingName && (
                <button
                  onClick={() => setEditingName(true)}
                  className="text-gray-400 hover:text-[#8C1AD9] transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {editingName ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#8C1AD9]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveName}
                    disabled={savingName || !newName.trim()}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {savingName ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setNewName(image.original_name);
                    }}
                    disabled={savingName}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-white font-medium">{image.original_name}</p>
            )}
          </div>

          {/* Prompt */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <label className="text-sm font-semibold text-[#8C1AD9] mb-2 block">
              💬 Prompt
            </label>
            <p className="text-white whitespace-pre-wrap">{image.prompt}</p>
          </div>

          {/* Fecha de creación */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <label className="text-sm font-semibold text-[#8C1AD9] mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Created
            </label>
            <p className="text-white font-medium">{formatDate(image.created_at)}</p>
          </div>

          {/* Image ID si existe */}
          {image.image_id && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <label className="text-sm font-semibold text-[#8C1AD9] mb-2 block">
                🔑 Image ID
              </label>
              <p className="text-white font-mono text-sm break-all">{image.image_id}</p>
            </div>
          )}

          {/* Likes */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <label className="text-sm font-semibold text-[#8C1AD9] mb-2 block">
              ❤️ Likes
            </label>
            <p className="text-white font-medium text-2xl">{image.likes}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
