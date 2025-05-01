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
      className="bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] text-white px-4 py-2 rounded-lg font-semibold hover:from-[#7B16C2] hover:to-[#1C228C] disabled:opacity-50 transition-all duration-300 hover:scale-105 shadow-lg"
      style={{
        boxShadow: "0 0 16px 3px #8C1AD9",
        borderRadius: "12px",
      }}
    >
      {loading ? 'Guardando...' : label}
    </button>
  );
}
