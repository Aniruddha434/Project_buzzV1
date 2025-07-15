/**
 * Performance Optimization Component for ProjectBuzz
 * Implements lazy loading, image optimization, and Core Web Vitals improvements
 */

import React, { useEffect, useCallback } from 'react';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({ children }) => {
  
  useEffect(() => {
    // Initialize performance optimizations
    initializeLazyLoading();
    optimizeImages();
    preloadCriticalResources();
    setupIntersectionObserver();
    
    // Web Vitals monitoring
    if (typeof window !== 'undefined') {
      import('web-vitals').then((webVitals) => {
        // Check if functions exist before calling them
        if (webVitals.getCLS) webVitals.getCLS(sendToAnalytics);
        if (webVitals.getFID) webVitals.getFID(sendToAnalytics);
        if (webVitals.getFCP) webVitals.getFCP(sendToAnalytics);
        if (webVitals.getLCP) webVitals.getLCP(sendToAnalytics);
        if (webVitals.getTTFB) webVitals.getTTFB(sendToAnalytics);
      }).catch((error) => {
        console.warn('Web Vitals not available:', error);
      });
    }
  }, []);

  /**
   * Initialize lazy loading for images and components
   */
  const initializeLazyLoading = useCallback(() => {
    // Native lazy loading support check
    if ('loading' in HTMLImageElement.prototype) {
      const images = document.querySelectorAll('img[data-src]');
      images.forEach((img) => {
        const imageElement = img as HTMLImageElement;
        imageElement.src = imageElement.dataset.src || '';
        imageElement.loading = 'lazy';
      });
    } else {
      // Fallback for browsers without native lazy loading
      const lazyImageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.classList.remove('lazy');
            lazyImageObserver.unobserve(img);
          }
        });
      });

      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach((img) => lazyImageObserver.observe(img));
    }
  }, []);

  /**
   * Optimize images for better performance
   */
  const optimizeImages = useCallback(() => {
    const images = document.querySelectorAll('img');
    
    images.forEach((img) => {
      // Add loading="lazy" to all images
      if (!img.hasAttribute('loading')) {
        img.loading = 'lazy';
      }

      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.decoding = 'async';
      }

      // Optimize image dimensions
      if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
        img.addEventListener('load', () => {
          if (!img.hasAttribute('width')) {
            img.setAttribute('width', img.naturalWidth.toString());
          }
          if (!img.hasAttribute('height')) {
            img.setAttribute('height', img.naturalHeight.toString());
          }
        });
      }
    });
  }, []);

  /**
   * Preload critical resources
   */
  const preloadCriticalResources = useCallback(() => {
    // Skip API prefetching in development to avoid cache issues
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (!isDevelopment) {
      // Only preload in production
      const criticalEndpoints = [
        '/api/projects/featured',
        '/api/projects/approved'
      ];

      criticalEndpoints.forEach((endpoint) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `${import.meta.env.VITE_API_URL}${endpoint}`;
        document.head.appendChild(link);
      });
    }

    // Preload critical fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    fontLink.as = 'style';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);
  }, []);

  /**
   * Setup intersection observer for performance monitoring
   */
  const setupIntersectionObserver = useCallback(() => {
    // Monitor viewport visibility for analytics
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;
            
            // Track section visibility
            if (element.hasAttribute('data-section')) {
              const sectionName = element.getAttribute('data-section');
              sendToAnalytics({
                name: 'section_view',
                value: sectionName,
                id: Date.now().toString()
              });
            }
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    // Observe sections with data-section attribute
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => observer.observe(section));
  }, []);

  /**
   * Send performance metrics to analytics
   */
  const sendToAnalytics = useCallback((metric: any) => {
    // In production, send to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metric:', metric);
    }

    // Example: Send to Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.value),
        metric_id: metric.id,
        custom_parameter: metric.name
      });
    }
  }, []);

  return <>{children}</>;
};

/**
 * Lazy Image Component with optimized loading
 */
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
}> = ({ src, alt, className, width, height, placeholder }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const handleLoad = () => setLoaded(true);
  const handleError = () => setError(true);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
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
      
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500">
          Failed to load image
        </div>
      )}
    </div>
  );
};

/**
 * Critical CSS Inliner
 */
export const CriticalCSS: React.FC = () => {
  useEffect(() => {
    // Inline critical CSS for above-the-fold content
    const criticalCSS = `
      .page-with-navbar { padding-top: 80px; }
      .hero-section { min-height: 100vh; }
      .loading-spinner { 
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;

    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

/**
 * Resource Hints Component
 */
export const ResourceHints: React.FC = () => {
  useEffect(() => {
    // DNS prefetch for external domains
    const dnsPrefetchDomains = [
      '//fonts.googleapis.com',
      '//fonts.gstatic.com',
      '//www.google-analytics.com',
      '//checkout.razorpay.com'
    ];

    dnsPrefetchDomains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

    // Preconnect to critical origins
    const preconnectOrigins = [
      'https://project-buzzv1-2.onrender.com',
      'https://fonts.gstatic.com'
    ];

    preconnectOrigins.forEach((origin) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }, []);

  return null;
};

export default PerformanceOptimizer;
