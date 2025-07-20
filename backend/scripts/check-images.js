#!/usr/bin/env node

import mongoose from 'mongoose';
import Project from '../models/Project.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkImages() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://aniruddhagayki0:oWSKPA8ZqqjnrcSt@cluster0.aqgqe.mongodb.net/ProjectBuzz?retryWrites=true&w=majority');
    
    const projects = await Project.find({}).select('title image images');
    
    console.log('\n📊 Project Images Analysis:');
    console.log('================================');
    
    let totalProjects = 0;
    let projectsWithImages = 0;
    let projectsWithoutImages = 0;
    let failingImages = [];
    
    for (const project of projects) {
      totalProjects++;
      console.log(`\n🔍 Project: ${project.title}`);
      
      let hasImages = false;
      
      if (project.image && project.image.url) {
        console.log(`   Main Image: ${project.image.url}`);
        hasImages = true;
        
        // Check if this is one of the failing images
        if (project.image.url.includes('1752522939822_68755ff02d7d4f04d7bddf50_evla5') ||
            project.image.url.includes('1752522220486_68755c8ec3af017aa1579d2d_04u8bu')) {
          failingImages.push({
            project: project.title,
            url: project.image.url,
            type: 'main'
          });
        }
      }
      
      if (project.images && project.images.length > 0) {
        project.images.forEach((img, index) => {
          console.log(`   Image ${index + 1}: ${img.url}`);
          hasImages = true;
          
          // Check if this is one of the failing images
          if (img.url.includes('1752522939822_68755ff02d7d4f04d7bddf50_evla5') ||
              img.url.includes('1752522220486_68755c8ec3af017aa1579d2d_04u8bu')) {
            failingImages.push({
              project: project.title,
              url: img.url,
              type: `image_${index + 1}`
            });
          }
        });
      }
      
      if (hasImages) {
        projectsWithImages++;
      } else {
        projectsWithoutImages++;
        console.log('   ⚠️  No images found');
      }
    }
    
    console.log('\n📈 Summary:');
    console.log('===========');
    console.log(`Total Projects: ${totalProjects}`);
    console.log(`Projects with Images: ${projectsWithImages}`);
    console.log(`Projects without Images: ${projectsWithoutImages}`);
    
    if (failingImages.length > 0) {
      console.log('\n❌ Failing Images Found:');
      console.log('========================');
      failingImages.forEach(img => {
        console.log(`Project: ${img.project}`);
        console.log(`Type: ${img.type}`);
        console.log(`URL: ${img.url}`);
        console.log('---');
      });
    } else {
      console.log('\n✅ No known failing images found in database');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Analysis complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkImages();
