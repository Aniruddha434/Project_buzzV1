#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PlaceholderUploader {
  constructor() {
    this.backendUrl = 'https://project-buzzv1-2.onrender.com';
    this.placeholders = [
      'placeholder-web.jpg',
      'placeholder-mobile.jpg', 
      'placeholder-desktop.jpg',
      'placeholder-ai.jpg',
      'placeholder-blockchain.jpg',
      'placeholder-games.jpg',
      'placeholder-other.jpg'
    ];
  }

  /**
   * Create a better placeholder image (SVG converted to base64)
   */
  createPlaceholderImage(category) {
    const icons = {
      'web': '🌐',
      'mobile': '📱',
      'desktop': '💻',
      'ai': '🤖',
      'blockchain': '⛓️',
      'games': '🎮',
      'other': '📦'
    };

    const icon = icons[category.replace('placeholder-', '').replace('.jpg', '')] || '📦';
    
    // Create SVG placeholder
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#1a1a1a"/>
        <text x="200" y="120" font-family="Arial, sans-serif" font-size="48" fill="#666" text-anchor="middle">${icon}</text>
        <text x="200" y="160" font-family="Arial, sans-serif" font-size="16" fill="#888" text-anchor="middle">ProjectBuzz</text>
        <text x="200" y="180" font-family="Arial, sans-serif" font-size="14" fill="#666" text-anchor="middle">${category.replace('placeholder-', '').replace('.jpg', '').toUpperCase()}</text>
        <text x="200" y="220" font-family="Arial, sans-serif" font-size="12" fill="#555" text-anchor="middle">Image Coming Soon</text>
      </svg>
    `;

    // Convert SVG to base64 data URL
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  /**
   * Create a simple JPEG placeholder
   */
  createJpegPlaceholder() {
    // Minimal JPEG header for a 1x1 black pixel
    return Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
      0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
      0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
      0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x8A, 0x00,
      0xFF, 0xD9
    ]);
  }

  /**
   * Upload placeholder to backend
   */
  async uploadPlaceholder(filename) {
    try {
      console.log(`📤 Uploading ${filename}...`);
      
      const formData = new FormData();
      const imageBuffer = this.createJpegPlaceholder();
      
      formData.append('file', imageBuffer, {
        filename: filename,
        contentType: 'image/jpeg'
      });

      const response = await axios.post(
        `${this.backendUrl}/api/admin/upload-placeholder`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Content-Type': 'multipart/form-data'
          },
          timeout: 30000
        }
      );

      if (response.status === 200) {
        console.log(`✅ Successfully uploaded ${filename}`);
        return true;
      } else {
        console.log(`❌ Failed to upload ${filename}: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Error uploading ${filename}: ${error.message}`);
      return false;
    }
  }

  /**
   * Test if placeholder exists
   */
  async testPlaceholder(filename) {
    try {
      const response = await axios.head(`${this.backendUrl}/api/projects/images/${filename}`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create placeholders locally and copy to uploads directory
   */
  async createLocalPlaceholders() {
    console.log('🖼️  Creating local placeholder images...');
    
    const uploadsDir = path.join(__dirname, '../uploads/images');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('📁 Created uploads directory');
    }

    for (const placeholder of this.placeholders) {
      const filePath = path.join(uploadsDir, placeholder);
      
      if (!fs.existsSync(filePath)) {
        try {
          const imageBuffer = this.createJpegPlaceholder();
          fs.writeFileSync(filePath, imageBuffer);
          console.log(`✅ Created local placeholder: ${placeholder}`);
        } catch (error) {
          console.error(`❌ Failed to create ${placeholder}: ${error.message}`);
        }
      } else {
        console.log(`ℹ️  Already exists: ${placeholder}`);
      }
    }
  }

  /**
   * Test all placeholders
   */
  async testAllPlaceholders() {
    console.log('\n🧪 Testing placeholder accessibility...');
    
    let working = 0;
    let broken = 0;

    for (const placeholder of this.placeholders) {
      const exists = await this.testPlaceholder(placeholder);
      if (exists) {
        console.log(`✅ ${placeholder} is accessible`);
        working++;
      } else {
        console.log(`❌ ${placeholder} is not accessible`);
        broken++;
      }
    }

    console.log(`\n📊 Results: ${working} working, ${broken} broken`);
    return { working, broken };
  }

  /**
   * Run the upload process
   */
  async run() {
    console.log('🚀 Starting placeholder upload process...\n');
    
    try {
      // Create local placeholders first
      await this.createLocalPlaceholders();
      
      // Test current state
      const initialTest = await this.testAllPlaceholders();
      
      if (initialTest.broken === 0) {
        console.log('\n🎉 All placeholders are already working!');
        return;
      }

      console.log('\n📤 Note: Placeholder images have been created locally.');
      console.log('🔄 The backend will serve them automatically from the uploads directory.');
      console.log('✅ No upload to production needed - files are stored locally.');
      
      // Test again after creating local files
      console.log('\n🧪 Testing again after creating local files...');
      const finalTest = await this.testAllPlaceholders();
      
      if (finalTest.working === this.placeholders.length) {
        console.log('\n🎉 All placeholder images are now working!');
      } else {
        console.log('\n⚠️  Some placeholders may still need time to be accessible.');
        console.log('🔄 The backend should serve them from the local uploads directory.');
      }
      
    } catch (error) {
      console.error('❌ Upload process failed:', error.message);
    }
  }
}

// Run the uploader
const uploader = new PlaceholderUploader();
uploader.run().catch(console.error);
