'use client';

interface SaveButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
}

export default function SaveButton({ onClick, loading = false, label = 'Guardar' }: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
    >
      {loading ? 'Guardando...' : label}
    </button>
  );
}
