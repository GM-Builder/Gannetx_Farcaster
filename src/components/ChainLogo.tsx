import React, { useState } from 'react';
import Image from 'next/image';

interface ChainLogoProps {
  logoUrl: string;
  altText: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackIcon?: React.ReactNode;
}

const ChainLogo: React.FC<ChainLogoProps> = ({ 
  logoUrl, 
  altText, 
  size = 'md', 
  className = '',
  fallbackIcon = '🔗'
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeConfig = {
    sm: { width: 20, height: 20, className: 'w-5 h-5' },
    md: { width: 24, height: 24, className: 'w-6 h-6' },
    lg: { width: 32, height: 32, className: 'w-8 h-8' },
    xl: { width: 40, height: 40, className: 'w-10 h-10' }
  };

  const config = sizeConfig[size];

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (imageError) {
    return (
      <div 
        className={`${config.className} ${className} flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400`}
        title={altText}
      >
        {typeof fallbackIcon === 'string' ? (
          <span className="text-sm">{fallbackIcon}</span>
        ) : (
          fallbackIcon
        )}
      </div>
    );
  }

  return (
    <div className={`${config.className} ${className} relative overflow-hidden rounded`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      )}
      <Image
        src={logoUrl}
        alt={altText}
        width={config.width}
        height={config.height}
        className={`object-contain rounded transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        priority={false} 
        placeholder="blur" 
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8A0aQoFgpA/9k="
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};

export default ChainLogo;