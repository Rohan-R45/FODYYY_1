import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-3 text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};

// Skeleton loader for cards
export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
    <div className="w-full h-48 skeleton"></div>
    <div className="p-4">
      <div className="h-4 skeleton rounded mb-2"></div>
      <div className="h-3 skeleton rounded mb-3 w-3/4"></div>
      <div className="flex justify-between">
        <div className="h-3 skeleton rounded w-1/4"></div>
        <div className="h-3 skeleton rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

// List item skeleton
export const ListSkeleton = ({ items = 3, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {[...Array(items)].map((_, index) => (
      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="w-16 h-16 skeleton rounded-lg flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-4 skeleton rounded mb-2"></div>
          <div className="h-3 skeleton rounded w-2/3 mb-2"></div>
          <div className="h-3 skeleton rounded w-1/3"></div>
        </div>
        <div className="w-20 h-8 skeleton rounded"></div>
      </div>
    ))}
  </div>
);

// Full page loading
export const PageLoading = ({ text = 'Loading...' }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="xl" text={text} />
    </div>
  </div>
);

export default LoadingSpinner;