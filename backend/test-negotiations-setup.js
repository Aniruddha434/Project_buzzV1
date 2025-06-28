import mongoose from 'mongoose';
import User from './models/User.js';
import Project from './models/Project.js';
import Negotiation from './models/Negotiation.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupTestNegotiations() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create test users
    console.log('\n👥 Setting up test users...');

    let seller = await User.findOne({ email: 'seller@test.com' });
    if (!seller) {
      seller = await User.create({
        email: 'seller@test.com',
        password: 'password123',
        displayName: 'Test Seller',
        username: 'testseller',
        role: 'seller',
        emailVerified: true
      });
      console.log('✅ Created test seller');
    } else {
      console.log('✅ Found existing test seller');
    }

    let buyer1 = await User.findOne({ email: 'buyer1@test.com' });
    if (!buyer1) {
      buyer1 = await User.create({
        email: 'buyer1@test.com',
        password: 'password123',
        displayName: 'Test Buyer 1',
        username: 'testbuyer1',
        role: 'buyer',
        emailVerified: true
      });
      console.log('✅ Created test buyer 1');
    } else {
      console.log('✅ Found existing test buyer 1');
    }

    let buyer2 = await User.findOne({ email: 'buyer2@test.com' });
    if (!buyer2) {
      buyer2 = await User.create({
        email: 'buyer2@test.com',
        password: 'password123',
        displayName: 'Test Buyer 2',
        username: 'testbuyer2',
        role: 'buyer',
        emailVerified: true
      });
      console.log('✅ Created test buyer 2');
    } else {
      console.log('✅ Found existing test buyer 2');
    }

    // Update all existing projects to have seller assigned
    console.log('\n🔧 Updating existing projects to assign seller...');
    const projectsWithoutSeller = await Project.find({
      $or: [
        { seller: { $exists: false } },
        { seller: null }
      ]
    });

    if (projectsWithoutSeller.length > 0) {
      await Project.updateMany(
        {
          $or: [
            { seller: { $exists: false } },
            { seller: null }
          ]
        },
        { seller: seller._id }
      );
      console.log(`✅ Updated ${projectsWithoutSeller.length} projects to have seller assigned`);
    } else {
      console.log('✅ All projects already have sellers assigned');
    }

    // Find or create test projects
    console.log('\n📦 Setting up test projects...');

    let project1 = await Project.findOne({ title: 'E-commerce Website Template' });
    if (!project1) {
      project1 = await Project.create({
        title: 'E-commerce Website Template',
        description: 'A modern, responsive e-commerce website template built with React and Node.js. Features include user authentication, product catalog, shopping cart, and payment integration.',
        price: 2500,
        seller: seller._id,
        status: 'approved',
        category: 'web',
        tags: ['react', 'nodejs', 'ecommerce', 'template'],
        githubRepo: 'https://github.com/testseller/ecommerce-template',
        projectDetails: {
          techStack: 'React, Node.js, MongoDB, Express',
          complexityLevel: 'intermediate',
          timeline: '2-3 weeks'
        }
      });
      console.log('✅ Created test project 1');
    } else {
      // Update existing project to have seller assigned
      project1.seller = seller._id;
      await project1.save();
      console.log('✅ Found and updated existing test project 1 with seller');
    }

    let project2 = await Project.findOne({ title: 'Task Management App' });
    if (!project2) {
      project2 = await Project.create({
        title: 'Task Management App',
        description: 'A comprehensive task management application with team collaboration features, real-time updates, and advanced reporting.',
        price: 3500,
        seller: seller._id,
        status: 'approved',
        category: 'web',
        tags: ['react', 'nodejs', 'task-management', 'collaboration'],
        githubRepo: 'https://github.com/testseller/task-manager',
        projectDetails: {
          techStack: 'React, Node.js, Socket.io, PostgreSQL',
          complexityLevel: 'advanced',
          timeline: '3-4 weeks'
        }
      });
      console.log('✅ Created test project 2');
    } else {
      // Update existing project to have seller assigned
      project2.seller = seller._id;
      await project2.save();
      console.log('✅ Found and updated existing test project 2 with seller');
    }

    // Create test negotiations
    console.log('\n💬 Creating test negotiations...');

    // Clear existing test negotiations
    await Negotiation.deleteMany({
      $or: [
        { buyer: buyer1._id },
        { buyer: buyer2._id }
      ]
    });

    // Negotiation 1: Active negotiation with price offer
    const negotiation1 = new Negotiation({
      project: project1._id,
      buyer: buyer1._id,
      seller: seller._id,
      originalPrice: project1.price,
      currentOffer: 2000, // Buyer offered ₹2000 for ₹2500 project
      status: 'active'
    });

    negotiation1.addMessage({
      type: 'template',
      content: 'Hi! I\'m interested in your E-commerce Website Template. Would you consider a lower price?',
      templateId: 'interested',
      sender: buyer1._id
    });

    negotiation1.addMessage({
      type: 'price_offer',
      content: 'I offer ₹2000 for this project.',
      priceOffer: 2000,
      sender: buyer1._id
    });

    await negotiation1.save();
    console.log('✅ Created negotiation 1 (Active with offer)');

    // Negotiation 2: Active negotiation with multiple messages
    const negotiation2 = new Negotiation({
      project: project2._id,
      buyer: buyer2._id,
      seller: seller._id,
      originalPrice: project2.price,
      currentOffer: 3000, // Buyer offered ₹3000 for ₹3500 project
      status: 'active'
    });

    negotiation2.addMessage({
      type: 'template',
      content: 'Hello! I\'m very interested in your Task Management App. Can we discuss the price?',
      templateId: 'interested',
      sender: buyer2._id
    });

    negotiation2.addMessage({
      type: 'template',
      content: 'Thank you for your interest! I\'m open to reasonable offers.',
      sender: seller._id
    });

    negotiation2.addMessage({
      type: 'price_offer',
      content: 'I offer ₹3000 for this project.',
      priceOffer: 3000,
      sender: buyer2._id
    });

    await negotiation2.save();
    console.log('✅ Created negotiation 2 (Active with conversation)');

    // Negotiation 3: Another active negotiation
    const negotiation3 = new Negotiation({
      project: project1._id,
      buyer: buyer2._id,
      seller: seller._id,
      originalPrice: project1.price,
      currentOffer: 2200, // Different buyer, different offer
      status: 'active'
    });

    negotiation3.addMessage({
      type: 'template',
      content: 'I\'m interested in purchasing your E-commerce template. What\'s your best price?',
      templateId: 'best_offer',
      sender: buyer2._id
    });

    negotiation3.addMessage({
      type: 'price_offer',
      content: 'I offer ₹2200 for this project.',
      priceOffer: 2200,
      sender: buyer2._id
    });

    await negotiation3.save();
    console.log('✅ Created negotiation 3 (Another active offer)');

    console.log('\n🎉 Test negotiations setup completed!');
    console.log('\n📊 Summary:');
    console.log(`- Seller: ${seller.email} (${seller._id})`);
    console.log(`- Buyer 1: ${buyer1.email} (${buyer1._id})`);
    console.log(`- Buyer 2: ${buyer2.email} (${buyer2._id})`);
    console.log(`- Project 1: ${project1.title} - ₹${project1.price}`);
    console.log(`- Project 2: ${project2.title} - ₹${project2.price}`);
    console.log(`- Created 3 active negotiations with pending offers`);

    console.log('\n🔑 Test Login Credentials:');
    console.log('Seller Account:');
    console.log('  Email: seller@test.com');
    console.log('  Password: password123');
    console.log('\nBuyer Accounts:');
    console.log('  Email: buyer1@test.com / buyer2@test.com');
    console.log('  Password: password123');

  } catch (error) {
    console.error('❌ Error setting up test negotiations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

setupTestNegotiations();
