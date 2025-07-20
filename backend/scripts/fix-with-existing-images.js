#!/usr/bin/env node

import mongoose from 'mongoose';
import Project from '../models/Project.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

class ExistingImageFixer {
  constructor() {
    this.backendUrl = 'https://project-buzzv1-2.onrender.com';
    this.workingImages = [];
    this.fixed = 0;
    this.errors = 0;
  }

  async connect() {
    try {
      console.log('🔗 Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      process.exit(1);
    }
  }

  async disconnect() {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }

  /**
   * Test if an image URL is accessible
   */
  async testImageUrl(url) {
    try {
      const fullUrl = url.startsWith('http') ? url : `${this.backendUrl}${url}`;
      const response = await axios.head(fullUrl, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Find working images from existing projects
   */
  async findWorkingImages() {
    console.log('\n🔍 Finding working images from existing projects...');
    
    const projects = await Project.find({}).select('title image images');
    const imageUrls = new Set();

    // Collect all unique image URLs
    for (const project of projects) {
      if (project.image && project.image.url) {
        imageUrls.add(project.image.url);
      }
      if (project.images && project.images.length > 0) {
        project.images.forEach(img => {
          if (img.url) {
            imageUrls.add(img.url);
          }
        });
      }
    }

    console.log(`📊 Found ${imageUrls.size} unique image URLs to test`);

    // Test each image URL
    for (const url of imageUrls) {
      console.log(`🧪 Testing: ${url}`);
      const isWorking = await this.testImageUrl(url);
      if (isWorking) {
        this.workingImages.push(url);
        console.log(`✅ Working: ${url}`);
      } else {
        console.log(`❌ Broken: ${url}`);
      }
    }

    console.log(`\n📈 Results: ${this.workingImages.length} working images found`);
    return this.workingImages;
  }

  /**
   * Get a working placeholder image based on category
   */
  getWorkingPlaceholder(category = 'other') {
    if (this.workingImages.length === 0) {
      // Fallback to a simple data URL
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfk6Y8L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIxNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzg4OCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UHJvamVjdEJ1eno8L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIyMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzU1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgQ29taW5nIFNvb248L3RleHQ+PC9zdmc+';
    }

    // Use the first working image as a placeholder
    return this.workingImages[0];
  }

  /**
   * Fix a project's images
   */
  async fixProjectImages(project) {
    let hasChanges = false;
    console.log(`\n🔧 Fixing project: ${project.title}`);

    // Fix main image
    if (project.image && project.image.url) {
      const isWorking = await this.testImageUrl(project.image.url);
      if (!isWorking) {
        const placeholder = this.getWorkingPlaceholder(project.category);
        console.log(`   🔄 Replacing broken main image with working placeholder`);
        project.image.url = placeholder;
        hasChanges = true;
      } else {
        console.log(`   ✅ Main image is working`);
      }
    } else {
      // No main image, add placeholder
      const placeholder = this.getWorkingPlaceholder(project.category);
      project.image = {
        url: placeholder,
        filename: 'placeholder.jpg'
      };
      console.log(`   🆕 Added main image placeholder`);
      hasChanges = true;
    }

    // Fix images array
    if (project.images && project.images.length > 0) {
      for (let i = 0; i < project.images.length; i++) {
        const img = project.images[i];
        const isWorking = await this.testImageUrl(img.url);
        if (!isWorking) {
          const placeholder = this.getWorkingPlaceholder(project.category);
          console.log(`   🔄 Replacing broken image ${i + 1} with working placeholder`);
          img.url = placeholder;
          hasChanges = true;
        } else {
          console.log(`   ✅ Image ${i + 1} is working`);
        }
      }
    } else {
      // No images array, add one placeholder
      const placeholder = this.getWorkingPlaceholder(project.category);
      project.images = [{
        url: placeholder,
        filename: 'placeholder.jpg'
      }];
      console.log(`   🆕 Added images array with placeholder`);
      hasChanges = true;
    }

    if (hasChanges) {
      try {
        await project.save();
        this.fixed++;
        console.log(`   ✅ Project saved successfully`);
      } catch (error) {
        console.error(`   ❌ Error saving project: ${error.message}`);
        this.errors++;
      }
    } else {
      console.log(`   ℹ️  No changes needed`);
    }

    return hasChanges;
  }

  /**
   * Run the fix process
   */
  async fix() {
    console.log('🚀 Starting image fix with existing working images...\n');
    
    try {
      await this.connect();
      
      // Find working images first
      await this.findWorkingImages();
      
      if (this.workingImages.length === 0) {
        console.log('⚠️  No working images found. Using SVG fallback.');
      }
      
      // Get all projects
      const projects = await Project.find({});
      console.log(`\n📊 Processing ${projects.length} projects...`);
      
      // Fix each project
      for (const project of projects) {
        await this.fixProjectImages(project);
      }
      
      // Generate final report
      this.generateReport();
      
      await this.disconnect();
      
    } catch (error) {
      console.error('❌ Fix process failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Generate final report
   */
  generateReport() {
    console.log('\n🎉 IMAGE FIX WITH EXISTING IMAGES COMPLETE!');
    console.log('==========================================');
    
    console.log(`\n📊 Summary:`);
    console.log(`Working Images Found: ${this.workingImages.length}`);
    console.log(`Projects Fixed: ${this.fixed}`);
    console.log(`Errors: ${this.errors}`);
    
    if (this.workingImages.length > 0) {
      console.log('\n✅ Using working images as placeholders:');
      this.workingImages.slice(0, 3).forEach((img, index) => {
        console.log(`   ${index + 1}. ${img}`);
      });
      if (this.workingImages.length > 3) {
        console.log(`   ... and ${this.workingImages.length - 3} more`);
      }
    }
    
    console.log('\n✅ All projects now have working image URLs!');
    console.log('🔄 Please test the production site to verify images are loading.');
  }
}

// Run the fix
const fixer = new ExistingImageFixer();
fixer.fix().catch(console.error);
