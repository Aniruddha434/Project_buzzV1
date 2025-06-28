#!/usr/bin/env node

/**
 * Mark Projects as Featured Script for ProjectBuzz
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../backend/.env') });

async function markFeaturedProjects() {
  console.log('⭐ Marking Projects as Featured\n');
  
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('projectbuzz');
    const projectsCollection = db.collection('projects');
    
    // Get all approved projects
    const projects = await projectsCollection.find({ status: 'approved' }).toArray();
    console.log(`📚 Found ${projects.length} approved projects`);
    
    if (projects.length === 0) {
      console.log('⚪ No approved projects found to mark as featured');
      return;
    }
    
    // Mark the first 2 projects as featured
    const projectsToFeature = projects.slice(0, Math.min(2, projects.length));
    
    for (const project of projectsToFeature) {
      await projectsCollection.updateOne(
        { _id: project._id },
        { $set: { featured: true } }
      );
      console.log(`⭐ Marked "${project.title}" as featured`);
    }
    
    console.log(`\n✅ Successfully marked ${projectsToFeature.length} projects as featured!`);
    
    // Test the featured projects query
    const featuredProjects = await projectsCollection.find({ 
      status: 'approved', 
      featured: true 
    }).toArray();
    
    console.log(`\n🎯 Featured projects verification:`);
    console.log(`   Total featured projects: ${featuredProjects.length}`);
    
    featuredProjects.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.title} - ₹${project.price}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

markFeaturedProjects().catch(console.error);
