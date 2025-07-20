#!/usr/bin/env node

/**
 * Fix Image URLs Script for ProjectBuzz
 * 
 * This script fixes image URLs in the database that contain localhost references
 * and replaces them with relative URLs for production compatibility.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const envPath = join(dirname(fileURLToPath(import.meta.url)), '../backend/.env');
dotenv.config({ path: envPath });

// Import models
import Project from '../backend/models/Project.js';

class ImageUrlFixer {
  constructor() {
    this.fixedCount = 0;
    this.totalProjects = 0;
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/projectbuzz';
      await mongoose.connect(mongoUri);
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
   * Fix a single URL by removing localhost references
   */
  fixUrl(url) {
    if (!url) return url;

    // Replace localhost URLs with relative URLs
    if (url.includes('localhost:5000')) {
      const relativePath = url.replace(/http:\/\/localhost:5000/g, '');
      console.log(`🔧 Fixed URL: ${url} → ${relativePath}`);
      return relativePath;
    }

    // If it's already a relative URL, keep it
    if (url.startsWith('/api/')) {
      return url;
    }

    // If it's a production URL, keep it
    if (url.startsWith('https://')) {
      return url;
    }

    return url;
  }

  /**
   * Fix image URLs in a project object
   */
  fixProjectImageUrls(project) {
    let hasChanges = false;

    // Fix main image URL
    if (project.image && project.image.url) {
      const originalUrl = project.image.url;
      const fixedUrl = this.fixUrl(originalUrl);
      if (originalUrl !== fixedUrl) {
        project.image.url = fixedUrl;
        hasChanges = true;
      }
    }

    // Fix images array URLs
    if (project.images && Array.isArray(project.images)) {
      project.images.forEach(image => {
        if (image.url) {
          const originalUrl = image.url;
          const fixedUrl = this.fixUrl(originalUrl);
          if (originalUrl !== fixedUrl) {
            image.url = fixedUrl;
            hasChanges = true;
          }
        }
      });
    }

    // Fix documentation files URLs
    if (project.documentationFiles && Array.isArray(project.documentationFiles)) {
      project.documentationFiles.forEach(doc => {
        if (doc.url) {
          const originalUrl = doc.url;
          const fixedUrl = this.fixUrl(originalUrl);
          if (originalUrl !== fixedUrl) {
            doc.url = fixedUrl;
            hasChanges = true;
          }
        }
      });
    }

    // Fix project ZIP file URL
    if (project.projectZipFile && project.projectZipFile.url) {
      const originalUrl = project.projectZipFile.url;
      const fixedUrl = this.fixUrl(originalUrl);
      if (originalUrl !== fixedUrl) {
        project.projectZipFile.url = fixedUrl;
        hasChanges = true;
      }
    }

    return hasChanges;
  }

  /**
   * Fix all projects in the database
   */
  async fixAllProjects() {
    try {
      console.log('🔍 Finding projects with image URLs...');
      
      const projects = await Project.find({
        $or: [
          { 'image.url': { $regex: 'localhost:5000' } },
          { 'images.url': { $regex: 'localhost:5000' } },
          { 'documentationFiles.url': { $regex: 'localhost:5000' } },
          { 'projectZipFile.url': { $regex: 'localhost:5000' } }
        ]
      });

      this.totalProjects = projects.length;
      console.log(`📊 Found ${this.totalProjects} projects with localhost URLs`);

      if (this.totalProjects === 0) {
        console.log('✅ No projects need URL fixing');
        return;
      }

      for (const project of projects) {
        console.log(`\n🔧 Processing project: ${project.title} (${project._id})`);
        
        const hasChanges = this.fixProjectImageUrls(project);
        
        if (hasChanges) {
          await project.save();
          this.fixedCount++;
          console.log(`✅ Fixed URLs for project: ${project.title}`);
        } else {
          console.log(`ℹ️  No changes needed for project: ${project.title}`);
        }
      }

      console.log(`\n🎉 URL fixing completed!`);
      console.log(`📊 Total projects processed: ${this.totalProjects}`);
      console.log(`✅ Projects fixed: ${this.fixedCount}`);
      console.log(`ℹ️  Projects unchanged: ${this.totalProjects - this.fixedCount}`);

    } catch (error) {
      console.error('❌ Error fixing project URLs:', error);
      throw error;
    }
  }

  /**
   * Run the URL fixing process
   */
  async run() {
    console.log('🚀 ProjectBuzz Image URL Fixer\n');
    
    try {
      await this.connect();
      await this.fixAllProjects();
    } catch (error) {
      console.error('❌ URL fixing failed:', error.message);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }
}

// Run the script
const fixer = new ImageUrlFixer();
fixer.run().catch(console.error);
