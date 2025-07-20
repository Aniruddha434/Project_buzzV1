import React, { useState, useRef, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  lazy?: boolean;
  responsive?: boolean;
  quality?: 'low' | 'medium' | 'high';
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder,
  lazy = true,
  responsive = true,
  quality = 'medium',
  onLoad,
  onError
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || inView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, inView]);

  // Generate responsive image sources
  const generateImageSources = (originalSrc: string) => {
    const baseUrl = getImageUrl(originalSrc);
    const filename = originalSrc.split('/').pop() || '';
    const baseName = filename.split('.')[0];

    // Use production backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://project-buzzv1-2.onrender.com';

    // Generate different quality/size variants
    const variants = {
      webp: {
        small: `${backendUrl}/api/projects/images/optimized/${baseName}_400w.webp`,
        medium: `${backendUrl}/api/projects/images/optimized/${baseName}_800w.webp`,
        large: `${backendUrl}/api/projects/images/optimized/${baseName}_original.webp`
      },
      jpeg: {
        small: `${backendUrl}/api/projects/images/optimized/${baseName}_400w_fallback.jpeg`,
        medium: `${backendUrl}/api/projects/images/optimized/${baseName}_800w_fallback.jpeg`,
        large: `${backendUrl}/api/projects/images/optimized/${baseName}_fallback.jpeg`
      }
    };

    return variants;
  };

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  const imageSources = generateImageSources(src);
  const fallbackSrc = getImageUrl(src);

  // Generate srcSet for responsive images
  const generateSrcSet = (format: 'webp' | 'jpeg') => {
    const sources = imageSources[format];
    return `${sources.small} 400w, ${sources.medium} 800w, ${sources.large} 1200w`;
  };

  // Generate sizes attribute based on quality
  const getSizes = () => {
    if (!responsive) return undefined;
    
    switch (quality) {
      case 'low':
        return '(max-width: 768px) 400px, (max-width: 1200px) 600px, 800px';
      case 'medium':
        return '(max-width: 768px) 400px, (max-width: 1200px) 800px, 1200px';
      case 'high':
        return '(max-width: 768px) 600px, (max-width: 1200px) 1000px, 1600px';
      default:
        return '(max-width: 768px) 400px, (max-width: 1200px) 800px, 1200px';
    }
  };

  if (!inView) {
    return (
      <div 
        ref={imgRef}
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width, height }}
        aria-label={`Loading ${alt}`}
      >
        {placeholder && (
          <img
            src={placeholder}
            alt=""
            className="w-full h-full object-cover opacity-50"
            loading="lazy"
          />
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Loading placeholder */}
      {!loaded && !error && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          style={{ 
            backgroundImage: placeholder ? `url(${placeholder})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      {/* Optimized image with responsive sources */}
      {responsive ? (
        <picture>
          {/* WebP sources for modern browsers */}
          <source
            srcSet={generateSrcSet('webp')}
            sizes={getSizes()}
            type="image/webp"
          />
          
          {/* JPEG fallback for older browsers */}
          <source
            srcSet={generateSrcSet('jpeg')}
            sizes={getSizes()}
            type="image/jpeg"
          />
          
          {/* Final fallback */}
          <img
            ref={imgRef}
            src={fallbackSrc}
            alt={alt}
            loading={lazy ? 'lazy' : 'eager'}
            decoding="async"
            width={width}
            height={height}
            className={`transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            onLoad={handleLoad}
            onError={handleError}
          />
        </picture>
      ) : (
        <img
          ref={imgRef}
          src={fallbackSrc}
          alt={alt}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
          <div className="text-center">
            <div className="mb-2">📷</div>
            <div>Failed to load image</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
