import React, { useState } from 'react';

/**
 * OptimizedImage: lazy loads images with a low-quality placeholder blur.
 * - Uses loading="lazy" for native lazy-loading.
 * - Optional placeholder image or dominant-color background.
 */
export default function OptimizedImage({
  src,
  alt = '',
  width,
  height,
  className = '',
  objectFit = 'object-cover',
  placeholderColor = '#f3f4f6',
  placeholderSrc,
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const aspectStyle = width && height ? {
    aspectRatio: `${width} / ${height}`,
  } : {};

  return (
    <div className={`relative overflow-hidden ${className}`} style={aspectStyle}>
      {!loaded && (
        placeholderSrc ? (
          <img
            src={placeholderSrc}
            alt=""
            aria-hidden
            className={`absolute inset-0 w-full h-full ${objectFit} blur-md scale-105`}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: placeholderColor }}
            aria-hidden
          />
        )
      )}

      {src && !error ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`relative w-full h-full ${objectFit} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-gray-400 text-xs">No Image</div>
      )}
    </div>
  );
}