import React from 'react';

export default function StickyBottomBar({ children, className = '' }) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[-0_-2px_10px_rgba(0,0,0,0.04)] p-3 z-40 ${className}`}>
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        {children}
      </div>
    </div>
  );
}