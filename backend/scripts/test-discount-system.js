import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import DiscountCode from '../models/DiscountCode.js';
import Payment from '../models/Payment.js';
import Project from '../models/Project.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/projectbuzz';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testDiscountSystem() {
  console.log('\n🧪 ===== TESTING DISCOUNT SYSTEM =====\n');

  const testId = Date.now(); // Unique identifier for this test run
  const testEmail = `testbuyer${testId}@example.com`;

  try {
    // Test 1: Create a test buyer
    console.log('📝 Test 1: Creating test buyer...');

    // Clean up any existing test data
    await User.deleteMany({ email: { $regex: /testbuyer.*@example\.com/ } });
    await DiscountCode.deleteMany({ code: 'WELCOME20' });
    await Project.deleteMany({ title: { $regex: /Test.*Project/ } });
    await Payment.deleteMany({ orderId: { $regex: /test-order/ } });

    const testBuyer = new User({
      email: testEmail,
      password: 'testpassword123',
      displayName: 'Test Buyer',
      role: 'buyer',
      emailVerified: true
    });

    await testBuyer.save();
    console.log('✅ Test buyer created:', testBuyer.email);

    // Test 2: Check welcome code eligibility
    console.log('\n📝 Test 2: Checking welcome code eligibility...');
    
    const eligibility = await DiscountCode.isEligibleForWelcomeCode(testBuyer._id);
    console.log('Eligibility result:', eligibility);
    
    if (!eligibility.eligible) {
      throw new Error('New buyer should be eligible for welcome code');
    }
    console.log('✅ New buyer is eligible for welcome code');

    // Test 3: Create welcome code
    console.log('\n📝 Test 3: Creating welcome code...');
    
    const welcomeCode = await DiscountCode.createWelcomeCode(testBuyer._id);
    console.log('Welcome code created:', welcomeCode);
    
    if (!welcomeCode || welcomeCode.code !== 'WELCOME20') {
      throw new Error('Welcome code creation failed');
    }
    console.log('✅ Welcome code created successfully');

    // Test 4: Create a test project
    console.log('\n📝 Test 4: Creating test project...');

    const testProject = new Project({
      title: `Test Project for Discount ${testId}`,
      description: 'A test project to verify discount functionality',
      price: 500,
      category: 'web',
      seller: testBuyer._id, // Using same user as seller for simplicity
      images: [],
      tags: ['test'],
      isActive: true
    });

    await testProject.save();
    console.log('✅ Test project created:', testProject.title);

    // Test 5: Validate welcome code for project
    console.log('\n📝 Test 5: Validating welcome code for project...');
    
    const validation = await DiscountCode.validateForPurchase('WELCOME20', testBuyer._id, testProject._id);
    console.log('Validation result:', validation);
    
    if (!validation.valid) {
      throw new Error('Welcome code validation failed: ' + validation.error);
    }
    
    const expectedDiscount = Math.min(Math.round(testProject.price * 0.2), 500); // 20% of 500 = 100
    const expectedFinalPrice = testProject.price - expectedDiscount; // 500 - 100 = 400
    
    if (validation.discountAmount !== expectedDiscount) {
      throw new Error(`Expected discount ${expectedDiscount}, got ${validation.discountAmount}`);
    }
    
    if (validation.finalPrice !== expectedFinalPrice) {
      throw new Error(`Expected final price ${expectedFinalPrice}, got ${validation.finalPrice}`);
    }
    
    console.log('✅ Welcome code validation successful');
    console.log(`   Original price: ₹${testProject.price}`);
    console.log(`   Discount: ₹${validation.discountAmount} (20%)`);
    console.log(`   Final price: ₹${validation.finalPrice}`);

    // Test 6: Test minimum purchase amount
    console.log('\n📝 Test 6: Testing minimum purchase amount...');
    
    const cheapProject = new Project({
      title: `Cheap Test Project ${testId}`,
      description: 'A cheap project below minimum purchase amount',
      price: 50, // Below minimum of 100
      category: 'other',
      seller: testBuyer._id,
      images: [],
      tags: ['test'],
      isActive: true
    });
    
    await cheapProject.save();
    
    const cheapValidation = await DiscountCode.validateForPurchase('WELCOME20', testBuyer._id, cheapProject._id);
    console.log('Cheap project validation:', cheapValidation);
    
    if (cheapValidation.valid) {
      throw new Error('Welcome code should not be valid for projects below minimum purchase amount');
    }
    
    console.log('✅ Minimum purchase amount validation working correctly');

    // Test 7: Test maximum discount cap
    console.log('\n📝 Test 7: Testing maximum discount cap...');
    
    const expensiveProject = new Project({
      title: `Expensive Test Project ${testId}`,
      description: 'An expensive project to test discount cap',
      price: 5000, // 20% would be 1000, but cap is 500
      category: 'web',
      seller: testBuyer._id,
      images: [],
      tags: ['test'],
      isActive: true
    });
    
    await expensiveProject.save();
    
    const expensiveValidation = await DiscountCode.validateForPurchase('WELCOME20', testBuyer._id, expensiveProject._id);
    console.log('Expensive project validation:', expensiveValidation);
    
    if (!expensiveValidation.valid) {
      throw new Error('Welcome code should be valid for expensive projects');
    }
    
    if (expensiveValidation.discountAmount !== 500) {
      throw new Error(`Expected discount cap of 500, got ${expensiveValidation.discountAmount}`);
    }
    
    console.log('✅ Maximum discount cap working correctly');
    console.log(`   Original price: ₹${expensiveProject.price}`);
    console.log(`   Discount: ₹${expensiveValidation.discountAmount} (capped at ₹500)`);
    console.log(`   Final price: ₹${expensiveValidation.finalPrice}`);

    // Test 8: Test code usage (mark as used)
    console.log('\n📝 Test 8: Testing code usage...');

    // Create a mock payment first to get a valid ObjectId
    const mockPaymentForCode = new Payment({
      orderId: `test-order-for-code-${testId}`,
      razorpayOrderId: `razorpay-test-for-code-${testId}`,
      user: testBuyer._id,
      project: testProject._id,
      amount: 400,
      currency: 'INR',
      status: 'PAID',
      customerDetails: {
        customerId: `test-customer-${testId}`,
        customerName: 'Test Buyer',
        customerEmail: testEmail,
        customerPhone: '9876543210'
      }
    });

    await mockPaymentForCode.save();
    await welcomeCode.use(mockPaymentForCode._id);
    
    const usedValidation = await DiscountCode.validateForPurchase('WELCOME20', testBuyer._id, testProject._id);
    console.log('Used code validation:', usedValidation);
    
    if (usedValidation.valid) {
      throw new Error('Used welcome code should not be valid');
    }
    
    console.log('✅ Used code validation working correctly');

    // Test 9: Test eligibility after purchase
    console.log('\n📝 Test 9: Testing eligibility after purchase...');
    
    // Create a mock successful payment
    const mockPayment = new Payment({
      orderId: `test-order-${testId}`,
      razorpayOrderId: `razorpay-test-${testId}`,
      user: testBuyer._id,
      project: testProject._id,
      amount: 400,
      currency: 'INR',
      status: 'PAID',
      customerDetails: {
        customerId: `test-customer-main-${testId}`,
        customerName: 'Test Buyer',
        customerEmail: testEmail,
        customerPhone: '9876543210'
      }
    });

    await mockPayment.save();
    
    const postPurchaseEligibility = await DiscountCode.isEligibleForWelcomeCode(testBuyer._id);
    console.log('Post-purchase eligibility:', postPurchaseEligibility);
    
    if (postPurchaseEligibility.eligible) {
      throw new Error('Buyer with existing purchases should not be eligible for welcome code');
    }
    
    console.log('✅ Post-purchase eligibility check working correctly');

    console.log('\n🎉 ===== ALL DISCOUNT SYSTEM TESTS PASSED! =====\n');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await User.deleteOne({ _id: testBuyer._id });
    await DiscountCode.deleteMany({ buyer: testBuyer._id });
    await Project.deleteMany({ seller: testBuyer._id });
    await Payment.deleteMany({ user: testBuyer._id });
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

async function main() {
  await connectDB();
  await testDiscountSystem();
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
