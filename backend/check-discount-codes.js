import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DiscountCode from './models/DiscountCode.js';

// Load environment variables
dotenv.config();

async function checkDiscountCodes() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Checking all discount codes...');
    const codes = await DiscountCode.find({})
      .populate('buyer', 'email')
      .populate('seller', 'email')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    console.log(`📋 Found ${codes.length} discount codes:\n`);

    if (codes.length === 0) {
      console.log('❌ No discount codes found in database');
      return;
    }

    codes.forEach((code, index) => {
      const now = new Date();
      const isExpired = now > code.expiresAt;
      const isValid = code.isActive && !code.isUsed && !isExpired;
      
      console.log(`${index + 1}. Code: ${code.code}`);
      console.log(`   Project: ${code.project?.title || 'Unknown'}`);
      console.log(`   Buyer: ${code.buyer?.email || 'Unknown'}`);
      console.log(`   Seller: ${code.seller?.email || 'Unknown'}`);
      console.log(`   Original Price: ₹${code.originalPrice}`);
      console.log(`   Discounted Price: ₹${code.discountedPrice}`);
      console.log(`   Discount: ₹${code.discountAmount} (${code.discountPercentage}%)`);
      console.log(`   Status: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
      console.log(`   Active: ${code.isActive}`);
      console.log(`   Used: ${code.isUsed}`);
      console.log(`   Created: ${code.createdAt.toLocaleString()}`);
      console.log(`   Expires: ${code.expiresAt.toLocaleString()}`);
      console.log(`   Expired: ${isExpired ? 'Yes' : 'No'}`);
      
      if (isValid) {
        console.log(`   ⏰ Time remaining: ${Math.round((code.expiresAt - now) / (1000 * 60 * 60))} hours`);
      }
      
      console.log('');
    });

    // Check for valid codes
    const validCodes = codes.filter(code => {
      const now = new Date();
      return code.isActive && !code.isUsed && now <= code.expiresAt;
    });

    console.log(`\n📊 Summary:`);
    console.log(`   Total codes: ${codes.length}`);
    console.log(`   Valid codes: ${validCodes.length}`);
    console.log(`   Expired codes: ${codes.filter(c => new Date() > c.expiresAt).length}`);
    console.log(`   Used codes: ${codes.filter(c => c.isUsed).length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkDiscountCodes();
