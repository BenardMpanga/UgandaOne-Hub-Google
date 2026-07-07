import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className = 'h-4 w-full', count = 1 }) => {
  return (
    <div className="space-y-2.5 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 rounded-sm ${className}`}
        />
      ))}
    </div>
  );
};
