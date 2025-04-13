'use client';

interface ImageUploaderProps {
  onChange: (file: File | null) => void;
}

export default function ImageUploader({ onChange }: ImageUploaderProps) {
  return (
    <div>
      <label className="block mb-1 font-medium">Imagen</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="block w-full"
      />
    </div>
  );
}
