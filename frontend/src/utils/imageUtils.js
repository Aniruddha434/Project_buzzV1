/**
 * Image URL utilities for ProjectBuzz
 * Centralized image URL handling with CORS support and error handling
 */

// Backend URL configuration with comprehensive fallback detection
const getBackendUrl = () => {
  // Always prioritize environment variable first
  const envBackendUrl = import.meta.env.VITE_BACKEND_URL;

  if (envBackendUrl) {
    console.log('🔧 Using environment backend URL:', envBackendUrl);
    return envBackendUrl;
  }

  // Fallback detection for different environments
  if (typeof window !== 'undefined') {
    // Browser environment
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;

    console.log('🌐 Detecting backend URL for hostname:', hostname, 'port:', port);

    // Development environment - handle different Vite ports
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('🔧 Development environment detected');
      // Always use port 5000 for backend in development
      return 'http://localhost:5000';
    }

    // Vercel production environment
    if (hostname.includes('vercel.app') || hostname === 'projectbuzz.tech' || hostname === 'www.projectbuzz.tech') {
      console.log('🚀 Production environment detected');
      return 'https://project-buzzv1-2.onrender.com';
    }

    // Other production environments
    if (protocol === 'https:') {
      console.log('🔒 HTTPS environment detected, using production backend');
      return 'https://project-buzzv1-2.onrender.com';
    }
  }

  // Default fallback for development
  console.log('⚠️ Using default fallback backend URL');
  return 'http://localhost:5000';
};

const BACKEND_URL = getBackendUrl();

/**
 * Get the correct image URL for display with CORS support
 * @param {string} imageUrl - The image URL from the database
 * @returns {string} - The correct URL for displaying the image
 */
export const getImageUrl = (imageUrl) => {
  try {
    if (!imageUrl) {
      console.warn('getImageUrl: No image URL provided, returning placeholder');
      return getPlaceholderUrl('No+Image');
    }

    // Handle object with url property (common mistake)
    if (typeof imageUrl === 'object' && imageUrl.url) {
      console.warn('getImageUrl: Received object instead of string, extracting URL property');
      imageUrl = imageUrl.url;
    }

    // Ensure we have a string
    if (typeof imageUrl !== 'string') {
      console.error('getImageUrl: Invalid image URL type:', typeof imageUrl, imageUrl);
      return getPlaceholderUrl('Invalid+URL');
    }

    // Clean the URL string
    imageUrl = imageUrl.trim();

    // Handle different URL patterns for production compatibility

    // 1. Fix URLs that contain localhost or development URLs
    if (imageUrl.includes('localhost:5000') || imageUrl.includes('http://localhost')) {
      const correctedUrl = imageUrl.replace(/http:\/\/localhost:5000/g, BACKEND_URL);
      console.log('🔄 Corrected localhost URL:', imageUrl, '->', correctedUrl);
      return correctedUrl;
    }

    // 2. Fix URLs that contain old backend URLs (for migration)
    if (imageUrl.includes('project-buzzv1-2.onrender.com') && !imageUrl.startsWith('https://')) {
      const correctedUrl = imageUrl.replace(/http:\/\/project-buzzv1-2\.onrender\.com/g, 'https://project-buzzv1-2.onrender.com');
      console.log('🔄 Fixed HTTP to HTTPS:', imageUrl, '->', correctedUrl);
      return correctedUrl;
    }

    // 3. If it's already a full URL (http/https), validate and return
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // Ensure production URLs use HTTPS
      if (imageUrl.startsWith('http://') && imageUrl.includes('project-buzzv1-2.onrender.com')) {
        const httpsUrl = imageUrl.replace('http://', 'https://');
        console.log('🔒 Upgraded to HTTPS:', imageUrl, '->', httpsUrl);
        return httpsUrl;
      }
      return imageUrl;
    }

    // 4. If it starts with /api/, prepend the backend URL
    if (imageUrl.startsWith('/api/')) {
      const fullUrl = `${BACKEND_URL}${imageUrl}`;
      console.log('🔗 Constructed API URL:', imageUrl, '->', fullUrl);
      return fullUrl;
    }

    // 5. If it's just a filename, construct the full path
    if (!imageUrl.includes('/')) {
      const fullUrl = `${BACKEND_URL}/api/projects/images/${imageUrl}`;
      console.log('📁 Constructed filename URL:', imageUrl, '->', fullUrl);
      return fullUrl;
    }

    // 6. If it's a relative path, prepend the backend URL
    if (imageUrl.startsWith('/')) {
      const fullUrl = `${BACKEND_URL}${imageUrl}`;
      console.log('🔗 Constructed relative URL:', imageUrl, '->', fullUrl);
      return fullUrl;
    }

    // 7. Default case - assume it's a filename
    const fullUrl = `${BACKEND_URL}/api/projects/images/${imageUrl}`;
    console.log('🔧 Default URL construction:', imageUrl, '->', fullUrl);
    return fullUrl;

  } catch (error) {
    console.error('❌ getImageUrl: Error processing image URL:', error, 'Input:', imageUrl);
    return getPlaceholderUrl('Error+Loading');
  }
};

/**
 * Get image URL with CORS-friendly headers and fallback mechanisms
 * @param {string} imageUrl - The image URL from the database
 * @returns {string} - The correct URL with CORS considerations
 */
export const getImageUrlWithCORS = (imageUrl) => {
  const url = getImageUrl(imageUrl);

  // In development, try to use the same origin to avoid CORS issues
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // If we're in development and the URL points to localhost:5000,
    // we might need to handle CORS differently
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && url.includes('localhost:5000')) {
      // For development, add cache-busting and CORS-friendly parameters
      const urlObj = new URL(url);
      urlObj.searchParams.set('_t', Date.now().toString());
      urlObj.searchParams.set('cors', 'true');
      return urlObj.toString();
    }

    // For production, ensure HTTPS and add cache-busting
    if (url.includes(BACKEND_URL) && !hostname.includes('localhost')) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('_t', Date.now().toString());
      return urlObj.toString();
    }
  }

  return url;
};

/**
 * Get a placeholder image URL with multiple fallbacks for production reliability
 * @param {string} text - Text to display in placeholder
 * @param {string} size - Size in format "400x300"
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderUrl = (text = 'No+Image', size = '400x300') => {
  const encodedText = encodeURIComponent(text);

  // Primary placeholder service with better styling
  const primaryUrl = `https://via.placeholder.com/${size}/1a1a1a/ffffff?text=${encodedText}`;

  // For production reliability, we could implement fallback logic here
  // For now, return the primary URL
  return primaryUrl;
};

/**
 * Get project image URL with fallback to placeholder
 * @param {object} project - Project object
 * @param {number} imageIndex - Index of image to get (default: 0 for primary)
 * @returns {string} - Image URL or placeholder
 */
export const getProjectImageUrl = (project, imageIndex = 0) => {
  if (!project) {
    return getPlaceholderUrl('Project+Image', '800x300');
  }

  // Try to get from images array first
  if (project.images && project.images.length > imageIndex) {
    return getImageUrl(project.images[imageIndex].url);
  }

  // Fallback to single image
  if (project.image?.url) {
    return getImageUrl(project.image.url);
  }

  // Return placeholder
  return getPlaceholderUrl('Project+Image', '800x300');
};

/**
 * Get all images for a project with CORS support
 * @param {object} project - Project object
 * @returns {array} - Array of image objects with corrected URLs
 */
export const getProjectImages = (project) => {
  const images = [];

  if (project.images && project.images.length > 0) {
    images.push(...project.images.map(img => ({
      ...img,
      url: getImageUrl(img.url),
      corsUrl: getImageUrlWithCORS(img.url)
    })));
  }

  // Add single image if not already in images array
  if (project.image?.url && !images.some(img => img.url === getImageUrl(project.image.url))) {
    images.push({
      ...project.image,
      url: getImageUrl(project.image.url),
      corsUrl: getImageUrlWithCORS(project.image.url),
      isPrimary: true
    });
  }

  return images;
};

/**
 * Preload an image with CORS support
 * @param {string} imageUrl - The image URL to preload
 * @returns {Promise} - Promise that resolves when image is loaded
 */
export const preloadImage = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // Set crossOrigin to handle CORS
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      console.log(`✅ Image preloaded successfully: ${imageUrl}`);
      resolve(img);
    };

    img.onerror = (error) => {
      console.warn(`⚠️  Failed to preload image: ${imageUrl}`, error);
      reject(error);
    };

    img.src = getImageUrl(imageUrl);
  });
};

/**
 * Check if an image URL is accessible (CORS-friendly)
 * @param {string} imageUrl - The image URL to check
 * @returns {Promise<boolean>} - Promise that resolves to true if accessible
 */
export const checkImageAccessibility = async (imageUrl) => {
  try {
    const url = getImageUrl(imageUrl);
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
      credentials: 'omit'
    });
    return response.ok;
  } catch (error) {
    console.warn(`⚠️  Image accessibility check failed for: ${imageUrl}`, error);
    return false;
  }
};

/**
 * Create a CORS-friendly image URL using various fallback strategies
 * @param {string} imageUrl - The original image URL
 * @returns {string} - CORS-friendly image URL
 */
export const getCORSFriendlyImageUrl = (imageUrl) => {
  const baseUrl = getImageUrl(imageUrl);

  if (typeof window === 'undefined') {
    return baseUrl;
  }

  const hostname = window.location.hostname;

  // Strategy 1: For development, try to use a proxy approach
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // In development, we can try to use the Vite dev server as a proxy
    // or use the direct URL with proper CORS headers
    return baseUrl;
  }

  // Strategy 2: For production, ensure proper URL format
  return baseUrl;
};

/**
 * Load image with fallback handling for CORS issues
 * @param {string} imageUrl - The image URL to load
 * @param {HTMLImageElement} imgElement - The image element to load into
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const loadImageWithFallback = (imageUrl, imgElement, onSuccess, onError) => {
  const primaryUrl = getCORSFriendlyImageUrl(imageUrl);

  // Try primary URL first
  const tryLoad = (url, isRetry = false) => {
    imgElement.onload = () => {
      console.log(`✅ Image loaded successfully: ${url}`);
      if (onSuccess) onSuccess();
    };

    imgElement.onerror = () => {
      console.warn(`❌ Failed to load image: ${url}`);

      if (!isRetry) {
        // Try with CORS-friendly URL
        const corsUrl = getImageUrlWithCORS(imageUrl);
        if (corsUrl !== url) {
          console.log(`🔄 Retrying with CORS-friendly URL: ${corsUrl}`);
          tryLoad(corsUrl, true);
          return;
        }
      }

      // All attempts failed, use placeholder
      const placeholderUrl = getPlaceholderUrl('Image+Not+Available', '400x300');
      console.log(`🔄 Using placeholder: ${placeholderUrl}`);
      imgElement.src = placeholderUrl;
      if (onError) onError();
    };

    imgElement.src = url;
  };

  tryLoad(primaryUrl);
};

export default {
  getImageUrl,
  getImageUrlWithCORS,
  getCORSFriendlyImageUrl,
  loadImageWithFallback,
  getPlaceholderUrl,
  getProjectImageUrl,
  getProjectImages,
  preloadImage,
  checkImageAccessibility
};
