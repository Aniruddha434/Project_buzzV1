#!/usr/bin/env node

import mongoose from 'mongoose';
import Project from '../models/Project.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

class ImageAnalyzer {
  constructor() {
    this.issues = [];
    this.stats = {
      totalProjects: 0,
      projectsWithImages: 0,
      projectsWithoutImages: 0,
      workingImages: 0,
      brokenImages: 0,
      missingFiles: 0,
      invalidUrls: 0
    };
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
  async testImageUrl(url, projectTitle) {
    try {
      const response = await axios.head(url, { timeout: 5000 });
      if (response.status === 200) {
        this.stats.workingImages++;
        return { status: 'working', url, project: projectTitle };
      } else {
        this.stats.brokenImages++;
        return { status: 'broken', url, project: projectTitle, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      this.stats.brokenImages++;
      if (error.response?.status === 404) {
        this.stats.missingFiles++;
        return { status: 'missing', url, project: projectTitle, error: 'File not found (404)' };
      } else {
        this.stats.invalidUrls++;
        return { status: 'invalid', url, project: projectTitle, error: error.message };
      }
    }
  }

  /**
   * Analyze image URLs in a project
   */
  async analyzeProjectImages(project) {
    const projectIssues = [];
    let hasImages = false;

    // Check main image
    if (project.image && project.image.url) {
      hasImages = true;
      console.log(`   Testing main image: ${project.image.url}`);
      const result = await this.testImageUrl(project.image.url, project.title);
      if (result.status !== 'working') {
        projectIssues.push({ type: 'main_image', ...result });
      }
    }

    // Check images array
    if (project.images && project.images.length > 0) {
      hasImages = true;
      for (let i = 0; i < project.images.length; i++) {
        const img = project.images[i];
        console.log(`   Testing image ${i + 1}: ${img.url}`);
        const result = await this.testImageUrl(img.url, project.title);
        if (result.status !== 'working') {
          projectIssues.push({ type: `image_${i + 1}`, ...result });
        }
      }
    }

    if (hasImages) {
      this.stats.projectsWithImages++;
    } else {
      this.stats.projectsWithoutImages++;
      projectIssues.push({
        type: 'no_images',
        status: 'missing',
        project: project.title,
        error: 'No images configured'
      });
    }

    return projectIssues;
  }

  /**
   * Check backend image storage
   */
  async checkBackendStorage() {
    console.log('\n🗂️  Checking backend image storage...');
    
    const uploadsDir = path.join(__dirname, '../uploads');
    const imagesDir = path.join(uploadsDir, 'images');
    
    try {
      if (fs.existsSync(uploadsDir)) {
        console.log('✅ Uploads directory exists');
        
        if (fs.existsSync(imagesDir)) {
          console.log('✅ Images directory exists');
          const files = fs.readdirSync(imagesDir);
          console.log(`📁 Found ${files.length} files in images directory:`);
          files.forEach(file => console.log(`   - ${file}`));
        } else {
          console.log('⚠️  Images directory does not exist');
        }
      } else {
        console.log('⚠️  Uploads directory does not exist');
      }
    } catch (error) {
      console.log('❌ Error checking storage:', error.message);
    }
  }

  /**
   * Generate image URL fixes
   */
  generateFixes(issues) {
    console.log('\n🔧 Generating fixes...');
    
    const fixes = {
      missingImages: [],
      urlCorrections: [],
      placeholderNeeded: []
    };

    issues.forEach(issue => {
      if (issue.status === 'missing') {
        fixes.missingImages.push(issue);
      } else if (issue.status === 'invalid' && issue.url.includes('localhost')) {
        fixes.urlCorrections.push({
          ...issue,
          suggestedFix: issue.url.replace('http://localhost:5000', 'https://project-buzzv1-2.onrender.com')
        });
      } else if (issue.type === 'no_images') {
        fixes.placeholderNeeded.push(issue);
      }
    });

    return fixes;
  }

  /**
   * Run comprehensive analysis
   */
  async analyze() {
    console.log('🔍 Starting comprehensive image analysis...\n');
    
    try {
      await this.connect();
      
      // Check backend storage
      await this.checkBackendStorage();
      
      // Get all projects
      console.log('\n📊 Analyzing project images...');
      const projects = await Project.find({}).select('title image images');
      this.stats.totalProjects = projects.length;
      
      console.log(`Found ${projects.length} projects to analyze\n`);
      
      // Analyze each project
      for (const project of projects) {
        console.log(`🔍 Analyzing: ${project.title}`);
        const projectIssues = await this.analyzeProjectImages(project);
        this.issues.push(...projectIssues);
      }
      
      // Generate report
      this.generateReport();
      
      await this.disconnect();
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n📈 COMPREHENSIVE IMAGE ANALYSIS REPORT');
    console.log('=====================================');
    
    console.log('\n📊 Statistics:');
    console.log(`Total Projects: ${this.stats.totalProjects}`);
    console.log(`Projects with Images: ${this.stats.projectsWithImages}`);
    console.log(`Projects without Images: ${this.stats.projectsWithoutImages}`);
    console.log(`Working Images: ${this.stats.workingImages}`);
    console.log(`Broken Images: ${this.stats.brokenImages}`);
    console.log(`Missing Files: ${this.stats.missingFiles}`);
    console.log(`Invalid URLs: ${this.stats.invalidUrls}`);
    
    if (this.issues.length > 0) {
      console.log('\n❌ Issues Found:');
      console.log('================');
      
      const groupedIssues = {};
      this.issues.forEach(issue => {
        if (!groupedIssues[issue.project]) {
          groupedIssues[issue.project] = [];
        }
        groupedIssues[issue.project].push(issue);
      });
      
      Object.keys(groupedIssues).forEach(projectTitle => {
        console.log(`\n🔍 Project: ${projectTitle}`);
        groupedIssues[projectTitle].forEach(issue => {
          console.log(`   ${issue.type}: ${issue.status} - ${issue.error || 'No error'}`);
          if (issue.url) {
            console.log(`   URL: ${issue.url}`);
          }
        });
      });
      
      // Generate fixes
      const fixes = this.generateFixes(this.issues);
      
      console.log('\n🔧 RECOMMENDED FIXES:');
      console.log('=====================');
      
      if (fixes.missingImages.length > 0) {
        console.log('\n1. Missing Image Files:');
        fixes.missingImages.forEach(fix => {
          console.log(`   - ${fix.project}: ${fix.url}`);
        });
        console.log('   → Solution: Upload missing image files or set placeholder images');
      }
      
      if (fixes.urlCorrections.length > 0) {
        console.log('\n2. URL Corrections Needed:');
        fixes.urlCorrections.forEach(fix => {
          console.log(`   - ${fix.project}:`);
          console.log(`     Current: ${fix.url}`);
          console.log(`     Fixed:   ${fix.suggestedFix}`);
        });
        console.log('   → Solution: Run URL correction script');
      }
      
      if (fixes.placeholderNeeded.length > 0) {
        console.log('\n3. Projects Need Images:');
        fixes.placeholderNeeded.forEach(fix => {
          console.log(`   - ${fix.project}`);
        });
        console.log('   → Solution: Add placeholder images or default project images');
      }
      
    } else {
      console.log('\n✅ No image issues found!');
    }
    
    console.log('\n🎯 Analysis complete!');
  }
}

// Run the analysis
const analyzer = new ImageAnalyzer();
analyzer.analyze().catch(console.error);
