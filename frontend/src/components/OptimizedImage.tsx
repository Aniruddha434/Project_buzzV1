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
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const maxRetries = 2;

  // Reset states when src changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
    setRetryCount(0);
  }, [src]);

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

    // For now, just use the original image URL for all sizes
    // TODO: Implement actual image optimization on the backend
    const variants = {
      webp: {
        small: baseUrl,
        medium: baseUrl,
        large: baseUrl
      },
      jpeg: {
        small: baseUrl,
        medium: baseUrl,
        large: baseUrl
      }
    };

    return variants;
  };

  const handleLoad = () => {
    console.log(`✅ OptimizedImage loaded successfully: ${src}`);
    setLoaded(true);
    setError(false); // Reset error state on successful load
    onLoad?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const imgElement = e.currentTarget;
    console.error(`❌ OptimizedImage failed to load (attempt ${retryCount + 1}): ${src}`, {
      naturalWidth: imgElement.naturalWidth,
      naturalHeight: imgElement.naturalHeight,
      complete: imgElement.complete,
      currentSrc: imgElement.currentSrc,
      retryCount
    });

    // Retry logic
    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying image load (${retryCount + 1}/${maxRetries}): ${src}`);
      setRetryCount(prev => prev + 1);
      setError(false);

      // Force reload after a short delay
      setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.src = getImageUrl(src) + `?retry=${retryCount + 1}`;
        }
      }, 500);
    } else {
      console.error(`❌ OptimizedImage failed after ${maxRetries} retries: ${src}`);
      setError(true);
      onError?.();
    }
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
      
      {/* Simplified image loading - use original image for now */}
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
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-400 text-sm border border-gray-800 rounded">
          <div className="text-center p-4">
            <div className="mb-2 text-2xl">📷</div>
            <div className="text-xs">Image unavailable</div>
            <div className="text-xs text-gray-500 mt-1">Retried {retryCount} times</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
