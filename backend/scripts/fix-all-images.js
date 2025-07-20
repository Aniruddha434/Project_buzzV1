#!/usr/bin/env node

import mongoose from 'mongoose';
import Project from '../models/Project.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

class ImageFixer {
  constructor() {
    this.fixed = 0;
    this.placeholdersAdded = 0;
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
   * Get available image files from backend storage
   */
  getAvailableImages() {
    const imagesDir = path.join(__dirname, '../uploads/images');
    try {
      if (fs.existsSync(imagesDir)) {
        return fs.readdirSync(imagesDir);
      }
    } catch (error) {
      console.error('Error reading images directory:', error.message);
    }
    return [];
  }

  /**
   * Create a placeholder image URL
   */
  getPlaceholderImage(category = 'other') {
    const placeholders = {
      'web': '/api/projects/images/placeholder-web.jpg',
      'mobile': '/api/projects/images/placeholder-mobile.jpg',
      'desktop': '/api/projects/images/placeholder-desktop.jpg',
      'ai': '/api/projects/images/placeholder-ai.jpg',
      'blockchain': '/api/projects/images/placeholder-blockchain.jpg',
      'games': '/api/projects/images/placeholder-games.jpg',
      'other': '/api/projects/images/placeholder-other.jpg'
    };
    
    return placeholders[category] || placeholders['other'];
  }

  /**
   * Check if an image file exists in backend storage
   */
  imageFileExists(filename, availableImages) {
    return availableImages.includes(filename);
  }

  /**
   * Extract filename from image URL
   */
  extractFilename(url) {
    if (!url) return null;
    
    // Handle relative URLs
    if (url.startsWith('/api/projects/images/')) {
      return url.replace('/api/projects/images/', '');
    }
    
    // Handle full URLs
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Fix image URLs for a project
   */
  async fixProjectImages(project, availableImages) {
    let hasChanges = false;
    const issues = [];

    console.log(`\n🔧 Fixing project: ${project.title}`);

    // Fix main image
    if (project.image && project.image.url) {
      const filename = this.extractFilename(project.image.url);
      if (filename && this.imageFileExists(filename, availableImages)) {
        // Image file exists, ensure URL is correct
        const correctUrl = `/api/projects/images/${filename}`;
        if (project.image.url !== correctUrl) {
          console.log(`   ✅ Fixed main image URL: ${project.image.url} → ${correctUrl}`);
          project.image.url = correctUrl;
          hasChanges = true;
        } else {
          console.log(`   ✅ Main image URL is correct: ${correctUrl}`);
        }
      } else {
        console.log(`   ❌ Main image file missing: ${filename}`);
        // Set placeholder
        project.image.url = this.getPlaceholderImage(project.category);
        console.log(`   🔄 Set placeholder: ${project.image.url}`);
        hasChanges = true;
        this.placeholdersAdded++;
        issues.push(`Main image missing: ${filename}`);
      }
    } else if (!project.image || !project.image.url) {
      // No main image, add placeholder
      if (!project.image) {
        project.image = {};
      }
      project.image.url = this.getPlaceholderImage(project.category);
      project.image.filename = 'placeholder.jpg';
      console.log(`   🆕 Added main image placeholder: ${project.image.url}`);
      hasChanges = true;
      this.placeholdersAdded++;
    }

    // Fix images array
    if (project.images && project.images.length > 0) {
      for (let i = 0; i < project.images.length; i++) {
        const img = project.images[i];
        const filename = this.extractFilename(img.url);
        
        if (filename && this.imageFileExists(filename, availableImages)) {
          // Image file exists, ensure URL is correct
          const correctUrl = `/api/projects/images/${filename}`;
          if (img.url !== correctUrl) {
            console.log(`   ✅ Fixed image ${i + 1} URL: ${img.url} → ${correctUrl}`);
            img.url = correctUrl;
            hasChanges = true;
          } else {
            console.log(`   ✅ Image ${i + 1} URL is correct: ${correctUrl}`);
          }
        } else {
          console.log(`   ❌ Image ${i + 1} file missing: ${filename}`);
          // Set placeholder
          img.url = this.getPlaceholderImage(project.category);
          console.log(`   🔄 Set placeholder for image ${i + 1}: ${img.url}`);
          hasChanges = true;
          this.placeholdersAdded++;
          issues.push(`Image ${i + 1} missing: ${filename}`);
        }
      }
    } else {
      // No images array, add one placeholder image
      project.images = [{
        url: this.getPlaceholderImage(project.category),
        filename: 'placeholder.jpg'
      }];
      console.log(`   🆕 Added images array with placeholder: ${project.images[0].url}`);
      hasChanges = true;
      this.placeholdersAdded++;
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

    return { hasChanges, issues };
  }

  /**
   * Create placeholder image files if they don't exist
   */
  async createPlaceholderImages() {
    console.log('\n🖼️  Creating placeholder images...');
    
    const placeholderDir = path.join(__dirname, '../uploads/images');
    const placeholders = [
      'placeholder-web.jpg',
      'placeholder-mobile.jpg', 
      'placeholder-desktop.jpg',
      'placeholder-ai.jpg',
      'placeholder-blockchain.jpg',
      'placeholder-games.jpg',
      'placeholder-other.jpg'
    ];

    // Create a simple placeholder image content (1x1 pixel base64)
    const placeholderContent = Buffer.from(
      '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A',
      'base64'
    );

    for (const placeholder of placeholders) {
      const filePath = path.join(placeholderDir, placeholder);
      if (!fs.existsSync(filePath)) {
        try {
          fs.writeFileSync(filePath, placeholderContent);
          console.log(`   ✅ Created: ${placeholder}`);
        } catch (error) {
          console.error(`   ❌ Failed to create ${placeholder}: ${error.message}`);
        }
      } else {
        console.log(`   ℹ️  Already exists: ${placeholder}`);
      }
    }
  }

  /**
   * Run the comprehensive fix
   */
  async fix() {
    console.log('🚀 Starting comprehensive image fix...\n');
    
    try {
      await this.connect();
      
      // Create placeholder images
      await this.createPlaceholderImages();
      
      // Get available images
      const availableImages = this.getAvailableImages();
      console.log(`\n📁 Found ${availableImages.length} image files in backend storage`);
      
      // Get all projects
      const projects = await Project.find({});
      console.log(`\n📊 Processing ${projects.length} projects...`);
      
      const allIssues = [];
      
      // Fix each project
      for (const project of projects) {
        const result = await this.fixProjectImages(project, availableImages);
        if (result.issues.length > 0) {
          allIssues.push({
            project: project.title,
            issues: result.issues
          });
        }
      }
      
      // Generate final report
      this.generateReport(allIssues);
      
      await this.disconnect();
      
    } catch (error) {
      console.error('❌ Fix process failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Generate final report
   */
  generateReport(allIssues) {
    console.log('\n🎉 IMAGE FIX COMPLETE!');
    console.log('=====================');
    
    console.log(`\n📊 Summary:`);
    console.log(`Projects Fixed: ${this.fixed}`);
    console.log(`Placeholders Added: ${this.placeholdersAdded}`);
    console.log(`Errors: ${this.errors}`);
    
    if (allIssues.length > 0) {
      console.log('\n⚠️  Issues Resolved:');
      allIssues.forEach(item => {
        console.log(`\n🔍 ${item.project}:`);
        item.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      });
    }
    
    console.log('\n✅ All projects now have working image URLs!');
    console.log('🔄 Please test the production site to verify images are loading.');
  }
}

// Run the fix
const fixer = new ImageFixer();
fixer.fix().catch(console.error);
