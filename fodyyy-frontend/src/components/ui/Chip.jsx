import React from 'react';

export default function Chip({ active, onClick, children, icon = null, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 h-9 rounded-full text-sm flex items-center gap-2 whitespace-nowrap
        ${active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} ${className}`}
    >
      {icon}{children}
    </button>
  );
}