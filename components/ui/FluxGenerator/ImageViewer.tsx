'use client';

interface ImageViewerProps {
  url: string | null;
  loading?: boolean;
}


export default function ImageViewer({ url, loading }: ImageViewerProps) {
  return (
    <div className="my-6 text-center">
      {loading && (
        <div className="mb-3 text-fuchsia-400 animate-pulse">Generando imagen...</div>
      )}
      {url && (
        <img
          src={url}
          alt="Imagen generada"
          className="mx-auto rounded-2xl border-4 border-cyan-400 shadow-xl"
          style={{
            boxShadow: '0 0 24px 4px #00fff7, 0 0 8px 2px #ff1aff'
          }}
        />
      )}
      
    </div>
  );
}
