import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUtils.js';

interface ImageLoadingTestProps {
  imageUrls: string[];
}

const ImageLoadingTest: React.FC<ImageLoadingTestProps> = ({ imageUrls }) => {
  const [loadingStatus, setLoadingStatus] = useState<Record<string, 'loading' | 'success' | 'error'>>({});

  // Reset loading status when imageUrls change
  useEffect(() => {
    const initialStatus: Record<string, 'loading' | 'success' | 'error'> = {};
    imageUrls.forEach(url => {
      initialStatus[url] = 'loading';
    });
    setLoadingStatus(initialStatus);
  }, [imageUrls]);

  const handleImageLoad = (url: string) => {
    console.log(`✅ Image loaded successfully: ${url}`);
    setLoadingStatus(prev => ({
      ...prev,
      [url]: 'success'
    }));
  };

  const handleImageError = (url: string, e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const imgElement = e.currentTarget;
    console.error(`❌ Image failed to load: ${url}`, {
      src: imgElement.src,
      naturalWidth: imgElement.naturalWidth,
      naturalHeight: imgElement.naturalHeight,
      complete: imgElement.complete
    });
    setLoadingStatus(prev => ({
      ...prev,
      [url]: 'error'
    }));
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
      <h2 className="text-xl font-bold mb-4">Image Loading Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {imageUrls.map((url, index) => (
          <div key={index} className="border border-gray-800 rounded-lg overflow-hidden">
            <div className="p-2 bg-gray-800 text-xs font-mono">
              <div className="truncate">Original URL: {url}</div>
              <div className="truncate">Processed URL: {getImageUrl(url)}</div>
              <div className="mt-1">
                Status: 
                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                  loadingStatus[url] === 'success' ? 'bg-green-900 text-green-300' :
                  loadingStatus[url] === 'error' ? 'bg-red-900 text-red-300' :
                  'bg-yellow-900 text-yellow-300'
                }`}>
                  {loadingStatus[url] || 'loading'}
                </span>
              </div>
            </div>
            
            <div className="relative h-48 bg-gray-950">
              {/* Loading indicator */}
              {loadingStatus[url] === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-gray-600 border-t-white rounded-full"></div>
                </div>
              )}
              
              {/* Error message */}
              {loadingStatus[url] === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center text-red-400">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📷</div>
                    <div>Failed to load image</div>
                  </div>
                </div>
              )}
              
              {/* Image */}
              <img
                src={getImageUrl(url)}
                alt={`Test image ${index + 1}`}
                className={`w-full h-full object-contain ${loadingStatus[url] === 'success' ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => handleImageLoad(url)}
                onError={(e) => handleImageError(url, e)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageLoadingTest;
