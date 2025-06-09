'use client';

import { Loader2 } from 'lucide-react';

interface SaveButtonProps {
  onClick: () => void;
  loading: boolean;
  label?: string;
  className?: string;
}

export default function SaveButton({
  onClick,
  loading,
  label = 'Save',
  className = ''
}: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={16} />
          Saving...
        </>
      ) : (
        <>
          💾 {label}
        </>
      )}
    </button>
  );
}