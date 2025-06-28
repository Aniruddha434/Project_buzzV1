import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DiscountCode from './models/DiscountCode.js';

// Load environment variables
dotenv.config();

async function checkSpecificDiscount() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const discountCode = 'NEGO-K3GZRKIB';
    const buyerId = '68486aa638884c4054ee095c';
    const projectId = '6848664930222a7118319d1b';

    console.log('\n🔍 Checking specific discount code...');
    console.log(`Code: ${discountCode}`);
    console.log(`Buyer ID: ${buyerId}`);
    console.log(`Project ID: ${projectId}`);

    // First, find the discount code without any filters
    console.log('\n1️⃣ Finding discount code in database...');
    const codeInDb = await DiscountCode.findOne({ code: discountCode.toUpperCase() })
      .populate('buyer', 'email')
      .populate('seller', 'email')
      .populate('project', 'title');

    if (!codeInDb) {
      console.log('❌ Discount code not found in database');
      
      // Check for similar codes
      console.log('\n🔍 Checking for similar codes...');
      const similarCodes = await DiscountCode.find({
        code: { $regex: 'K3GZRKIB', $options: 'i' }
      }).populate('buyer seller project');
      
      console.log(`Found ${similarCodes.length} similar codes:`);
      similarCodes.forEach(code => {
        console.log(`- ${code.code} (${code.buyer?.email} -> ${code.project?.title})`);
      });
      
      return;
    }

    console.log('✅ Discount code found in database');
    console.log(`   Code: ${codeInDb.code}`);
    console.log(`   Project: ${codeInDb.project?.title || 'Unknown'}`);
    console.log(`   Buyer: ${codeInDb.buyer?.email || 'Unknown'}`);
    console.log(`   Seller: ${codeInDb.seller?.email || 'Unknown'}`);
    console.log(`   Original Price: ₹${codeInDb.originalPrice}`);
    console.log(`   Discounted Price: ₹${codeInDb.discountedPrice}`);
    console.log(`   Discount: ₹${codeInDb.discountAmount} (${codeInDb.discountPercentage}%)`);
    console.log(`   Active: ${codeInDb.isActive}`);
    console.log(`   Used: ${codeInDb.isUsed}`);
    console.log(`   Created: ${codeInDb.createdAt.toLocaleString()}`);
    console.log(`   Expires: ${codeInDb.expiresAt.toLocaleString()}`);

    // Check expiration
    const now = new Date();
    const isExpired = now > codeInDb.expiresAt;
    console.log(`   Expired: ${isExpired ? 'Yes' : 'No'}`);
    
    if (!isExpired) {
      const hoursLeft = Math.round((codeInDb.expiresAt - now) / (1000 * 60 * 60));
      console.log(`   Time remaining: ${hoursLeft} hours`);
    }

    // Check buyer match
    console.log('\n2️⃣ Checking buyer match...');
    const buyerMatches = codeInDb.buyer._id.toString() === buyerId;
    console.log(`   Expected buyer: ${buyerId}`);
    console.log(`   Actual buyer: ${codeInDb.buyer._id.toString()}`);
    console.log(`   Buyer matches: ${buyerMatches ? 'Yes' : 'No'}`);

    // Check project match
    console.log('\n3️⃣ Checking project match...');
    const projectMatches = codeInDb.project._id.toString() === projectId;
    console.log(`   Expected project: ${projectId}`);
    console.log(`   Actual project: ${codeInDb.project._id.toString()}`);
    console.log(`   Project matches: ${projectMatches ? 'Yes' : 'No'}`);

    // Test validation method
    console.log('\n4️⃣ Testing validation method...');
    const validation = await DiscountCode.validateForPurchase(discountCode, buyerId, projectId);
    console.log(`   Validation result: ${validation.valid ? 'Valid' : 'Invalid'}`);
    if (!validation.valid) {
      console.log(`   Error: ${validation.error}`);
    }

    // Check what the validation query would find
    console.log('\n5️⃣ Testing validation query directly...');
    const validationQuery = {
      code: discountCode.toUpperCase(),
      buyer: buyerId,
      project: projectId,
      isActive: true,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    };
    
    console.log('   Query:', JSON.stringify(validationQuery, null, 2));
    
    const queryResult = await DiscountCode.findOne(validationQuery);
    console.log(`   Query result: ${queryResult ? 'Found' : 'Not found'}`);

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Code exists: ✅`);
    console.log(`   Active: ${codeInDb.isActive ? '✅' : '❌'}`);
    console.log(`   Not used: ${!codeInDb.isUsed ? '✅' : '❌'}`);
    console.log(`   Not expired: ${!isExpired ? '✅' : '❌'}`);
    console.log(`   Buyer matches: ${buyerMatches ? '✅' : '❌'}`);
    console.log(`   Project matches: ${projectMatches ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkSpecificDiscount();
