import React from 'react';

export default function AddControls({ qty, onAdd, onInc, onDec }) {
  if (!qty) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onAdd?.(); }}
        className="px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold shadow-sm active:scale-95"
      >
        ADD
      </button>
    );
  }

  return (
    <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button onClick={(e) => { e.stopPropagation(); onDec?.(); }} className="w-9 h-9 grid place-items-center text-rose-600 font-bold">−</button>
      <span className="w-10 text-center font-semibold">{qty}</span>
      <button onClick={(e) => { e.stopPropagation(); onInc?.(); }} className="w-9 h-9 grid place-items-center text-rose-600 font-bold">+</button>
    </div>
  );
}