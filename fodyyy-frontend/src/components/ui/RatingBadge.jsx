import React from 'react';

export default function RatingBadge({ value }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-600 text-white">
      {value}
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
    </span>
  );
}