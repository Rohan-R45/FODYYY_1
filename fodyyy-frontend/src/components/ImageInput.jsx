import React, { useState, useEffect } from 'react';
import { PhotoIcon, LinkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

const ImageInput = ({ 
  value, 
  onChange, 
  onUpload, 
  uploading = false, 
  placeholder = "Enter image URL or upload a file",
  className = "",
  showPreview = true,
  previewSize = "w-32 h-32",
  uploadText = "Upload Image",
  urlText = "Image URL",
  supportedFormats = "PNG, JPG, JPEG, WebP",
  maxSize = "5MB",
  error = null
}) => {
  const [inputMode, setInputMode] = useState('url'); // 'url' or 'upload'
  const [imageError, setImageError] = useState(false);
  const [urlValue, setUrlValue] = useState(value || '');

  useEffect(() => {
    setUrlValue(value || '');
    setImageError(false);
  }, [value]);

  // Validate URL format
  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  // Validate image URL format
  const isValidImageUrl = (url) => {
    if (!isValidUrl(url)) return false;
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
    return imageExtensions.test(url) || url.includes('cloudinary') || url.includes('imgur') || url.includes('unsplash');
  };

  const handleUrlChange = (e) => {
    const newValue = e.target.value;
    setUrlValue(newValue);
    setImageError(false);
    
    // Validate URL if not empty
    if (newValue && !isValidImageUrl(newValue)) {
      setImageError(true);
    }
    
    onChange(newValue);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      setImageError(true);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImageError(true);
      return;
    }

    if (onUpload) {
      await onUpload(file);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getPlaceholderImage = () => (
    <div className={`${previewSize} flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300`}>
      <PhotoIcon className="h-8 w-8 text-gray-400" />
    </div>
  );

  const renderImagePreview = () => {
    if (!value || imageError) {
      return getPlaceholderImage();
    }

    return (
      <div className={`${previewSize} relative`}>
        <img
          src={value}
          alt="Preview"
          className="w-full h-full object-cover rounded-lg border border-gray-200"
          onError={handleImageError}
          onLoad={() => setImageError(false)}
        />
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <PhotoIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mode Toggle */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setInputMode('url')}
          className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            inputMode === 'url'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          {urlText}
        </button>
        {onUpload && (
          <button
            type="button"
            onClick={() => setInputMode('upload')}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              inputMode === 'upload'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CloudArrowUpIcon className="h-4 w-4 mr-2" />
            {uploadText}
          </button>
        )}
      </div>

      <div className="flex items-start gap-6">
        <div className="flex-1">
          {inputMode === 'url' ? (
            <div>
              <input
                type="url"
                value={urlValue}
                onChange={handleUrlChange}
                placeholder={placeholder}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  error || imageError ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {imageError && urlValue && (
                <p className="mt-1 text-sm text-red-600">
                  Please enter a valid image URL
                </p>
              )}
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter a direct link to an image ({supportedFormats})
              </p>
            </div>
          ) : (
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-file-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="image-file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {uploading ? (
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  ) : (
                    <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                  )}
                  <span className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : 'Click to upload image'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {supportedFormats} up to {maxSize}
                  </span>
                </label>
              </div>
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>
          )}
        </div>

        {/* Image Preview */}
        {showPreview && (
          <div className="flex-shrink-0">
            {renderImagePreview()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageInput;