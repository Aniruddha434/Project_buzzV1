/**
 * Image URL utilities for ProjectBuzz
 * Centralized image URL handling with CORS support and error handling
 */

// Backend URL configuration with fallback detection
const getBackendUrl = () => {
  // Try to detect backend URL from environment or use default
  if (typeof window !== 'undefined') {
    // Browser environment
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }

  // Default backend URL
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
};

const BACKEND_URL = getBackendUrl();

/**
 * Get the correct image URL for display with CORS support
 * @param {string} imageUrl - The image URL from the database
 * @returns {string} - The correct URL for displaying the image
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return getPlaceholderUrl('No+Image');
  }

  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it starts with /api/, prepend the backend URL
  if (imageUrl.startsWith('/api/')) {
    return `${BACKEND_URL}${imageUrl}`;
  }

  // If it's just a filename, construct the full path
  return `${BACKEND_URL}/api/projects/images/${imageUrl}`;
};

/**
 * Get image URL with CORS-friendly headers
 * @param {string} imageUrl - The image URL from the database
 * @returns {string} - The correct URL with CORS considerations
 */
export const getImageUrlWithCORS = (imageUrl) => {
  const url = getImageUrl(imageUrl);

  // For cross-origin requests, we might need to add cache-busting or other parameters
  if (url.includes(BACKEND_URL) && typeof window !== 'undefined') {
    const urlObj = new URL(url);
    // Add timestamp to prevent caching issues that might interfere with CORS
    urlObj.searchParams.set('_t', Date.now().toString());
    return urlObj.toString();
  }

  return url;
};

/**
 * Get a placeholder image URL
 * @param {string} text - Text to display in placeholder
 * @param {string} size - Size in format "400x300"
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderUrl = (text = 'No+Image', size = '400x300') => {
  return `https://via.placeholder.com/${size}?text=${text}`;
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

export default {
  getImageUrl,
  getImageUrlWithCORS,
  getPlaceholderUrl,
  getProjectImageUrl,
  getProjectImages,
  preloadImage,
  checkImageAccessibility
};
