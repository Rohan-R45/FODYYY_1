import React, { useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

const ImageDisplay = ({ 
  src, 
  alt = "Image", 
  className = "", 
  fallbackClassName = "",
  iconSize = "h-12 w-12",
  objectFit = "object-cover",
  showFallback = true,
  fallbackIcon: FallbackIcon = PhotoIcon,
  onError,
  onLoad
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (e) => {
    setHasError(true);
    setIsLoading(false);
    if (onError) onError(e);
  };

  const handleLoad = (e) => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) onLoad(e);
  };

  // If no src provided or error occurred, show fallback
  if (!src || hasError) {
    if (!showFallback) return null;
    
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${fallbackClassName || className}`}>
        <FallbackIcon className={`text-gray-400 ${iconSize}`} />
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={src}
        alt={alt}
        className={`${className} ${objectFit}`}
        onError={handleError}
        onLoad={handleLoad}
      />
      {isLoading && showFallback && (
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${className}`}>
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;