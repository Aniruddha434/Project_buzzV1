import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImageOptimizationService {
  constructor() {
    this.supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
    this.maxWidth = 1920;
    this.maxHeight = 1080;
    this.quality = {
      jpeg: 85,
      webp: 80,
      png: 90
    };
    
    // Create optimized images directory
    this.optimizedDir = path.join(process.cwd(), 'uploads', 'optimized');
    this.ensureDirectoryExists(this.optimizedDir);
  }

  /**
   * Ensure directory exists
   */
  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(filename) {
    return path.extname(filename).toLowerCase().substring(1);
  }

  /**
   * Generate optimized filename
   */
  generateOptimizedFilename(originalFilename, format, size = null) {
    const name = path.parse(originalFilename).name;
    const sizePrefix = size ? `_${size}` : '';
    return `${name}${sizePrefix}.${format}`;
  }

  /**
   * Optimize single image with multiple formats and sizes
   */
  async optimizeImage(inputPath, originalFilename) {
    try {
      console.log(`🖼️  Optimizing image: ${originalFilename}`);
      
      const results = {
        original: {
          path: inputPath,
          filename: originalFilename,
          size: fs.statSync(inputPath).size
        },
        optimized: {}
      };

      // Get image metadata
      const metadata = await sharp(inputPath).metadata();
      console.log(`📊 Image metadata: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

      // Generate multiple optimized versions
      const variants = [
        { format: 'webp', width: null, suffix: '' },
        { format: 'webp', width: 800, suffix: '_medium' },
        { format: 'webp', width: 400, suffix: '_small' },
        { format: 'jpeg', width: null, suffix: '_fallback' },
        { format: 'jpeg', width: 800, suffix: '_medium_fallback' }
      ];

      for (const variant of variants) {
        try {
          const optimizedFilename = this.generateOptimizedFilename(
            originalFilename, 
            variant.format, 
            variant.width ? `${variant.width}w` : 'original'
          );
          
          const outputPath = path.join(this.optimizedDir, optimizedFilename);
          
          let sharpInstance = sharp(inputPath);
          
          // Resize if width is specified
          if (variant.width && metadata.width > variant.width) {
            sharpInstance = sharpInstance.resize(variant.width, null, {
              withoutEnlargement: true,
              fit: 'inside'
            });
          }
          
          // Apply format-specific optimizations
          if (variant.format === 'webp') {
            sharpInstance = sharpInstance.webp({ 
              quality: this.quality.webp,
              effort: 6 // Higher effort for better compression
            });
          } else if (variant.format === 'jpeg') {
            sharpInstance = sharpInstance.jpeg({ 
              quality: this.quality.jpeg,
              progressive: true,
              mozjpeg: true
            });
          } else if (variant.format === 'png') {
            sharpInstance = sharpInstance.png({ 
              quality: this.quality.png,
              compressionLevel: 9
            });
          }
          
          await sharpInstance.toFile(outputPath);
          
          const optimizedStats = fs.statSync(outputPath);
          const compressionRatio = ((results.original.size - optimizedStats.size) / results.original.size * 100).toFixed(1);
          
          results.optimized[`${variant.format}${variant.suffix}`] = {
            path: outputPath,
            filename: optimizedFilename,
            size: optimizedStats.size,
            compressionRatio: `${compressionRatio}%`,
            width: variant.width || metadata.width
          };
          
          console.log(`✅ Generated ${variant.format} variant: ${optimizedFilename} (${compressionRatio}% smaller)`);
          
        } catch (variantError) {
          console.error(`❌ Failed to generate ${variant.format} variant:`, variantError.message);
        }
      }

      return results;
      
    } catch (error) {
      console.error('❌ Image optimization failed:', error.message);
      throw error;
    }
  }

  /**
   * Get optimized image URL
   */
  getOptimizedImageUrl(originalFilename, format = 'webp', size = 'original') {
    const optimizedFilename = this.generateOptimizedFilename(originalFilename, format, size);
    return `/api/projects/images/optimized/${optimizedFilename}`;
  }

  /**
   * Get responsive image sources
   */
  getResponsiveImageSources(originalFilename) {
    const baseName = path.parse(originalFilename).name;
    
    return {
      webp: {
        original: this.getOptimizedImageUrl(originalFilename, 'webp', 'original'),
        medium: this.getOptimizedImageUrl(originalFilename, 'webp', '800w'),
        small: this.getOptimizedImageUrl(originalFilename, 'webp', '400w')
      },
      jpeg: {
        original: this.getOptimizedImageUrl(originalFilename, 'jpeg', 'original'),
        medium: this.getOptimizedImageUrl(originalFilename, 'jpeg', '800w'),
        fallback: this.getOptimizedImageUrl(originalFilename, 'jpeg', 'fallback')
      }
    };
  }

  /**
   * Clean up old optimized images
   */
  async cleanupOptimizedImages(originalFilename) {
    try {
      const baseName = path.parse(originalFilename).name;
      const files = fs.readdirSync(this.optimizedDir);
      
      const relatedFiles = files.filter(file => file.startsWith(baseName));
      
      for (const file of relatedFiles) {
        const filePath = path.join(this.optimizedDir, file);
        fs.unlinkSync(filePath);
        console.log(`🗑️  Cleaned up optimized image: ${file}`);
      }
      
    } catch (error) {
      console.error('❌ Failed to cleanup optimized images:', error.message);
    }
  }

  /**
   * Check if image needs optimization
   */
  needsOptimization(filePath, maxSizeKB = 500) {
    try {
      const stats = fs.statSync(filePath);
      const sizeKB = stats.size / 1024;
      return sizeKB > maxSizeKB;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      };
    } catch (error) {
      console.error('❌ Failed to get image dimensions:', error.message);
      return null;
    }
  }
}

export default new ImageOptimizationService();
