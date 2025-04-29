'use client';

interface ImageUploaderProps {
  onChange: (file: File | null) => void;
}

export default function ImageUploader({ onChange }: ImageUploaderProps) {
  return (
    <div>
      <label className="block mb-2 text-lg font-semibold text-pink-400">Imagen</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="block w-full p-2 text-cyan-400 bg-zinc-900 border-2 border-green-400 rounded shadow-lg focus:ring-2 focus:ring-fuchsia-500"
      />
    </div>
  );
}
