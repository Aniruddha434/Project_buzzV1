import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Project from './models/Project.js';
import Payment from './models/Payment.js';
import Wallet from './models/Wallet.js';
import Payout from './models/Payout.js';
import Transaction from './models/Transaction.js';

dotenv.config();

// Test wallet system functionality
async function testWalletSystem() {
  try {
    console.log('🧪 Starting Wallet System Tests...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Commission Calculation
    console.log('📊 Test 1: Commission Calculation');
    const saleAmount = 1000; // ₹10.00
    const platformCommissionRate = 0.15;
    const sellerCommissionRate = 0.85;
    
    const platformCommission = Math.round(saleAmount * platformCommissionRate);
    const sellerCommission = Math.round(saleAmount * sellerCommissionRate);
    
    console.log(`Sale Amount: ₹${(saleAmount / 100).toFixed(2)}`);
    console.log(`Platform Commission (15%): ₹${(platformCommission / 100).toFixed(2)}`);
    console.log(`Seller Commission (85%): ₹${(sellerCommission / 100).toFixed(2)}`);
    console.log(`Total: ₹${((platformCommission + sellerCommission) / 100).toFixed(2)}`);
    
    if (platformCommission + sellerCommission === saleAmount) {
      console.log('✅ Commission calculation is correct\n');
    } else {
      console.log('❌ Commission calculation is incorrect\n');
    }

    // Test 2: Find or create test users
    console.log('👥 Test 2: Setting up test users');
    let seller = await User.findOne({ email: 'seller@test.com' });
    if (!seller) {
      seller = await User.create({
        email: 'seller@test.com',
        password: 'password123',
        displayName: 'Test Seller',
        role: 'seller'
      });
    }
    
    let buyer = await User.findOne({ email: 'buyer@test.com' });
    if (!buyer) {
      buyer = await User.create({
        email: 'buyer@test.com',
        password: 'password123',
        displayName: 'Test Buyer',
        role: 'buyer'
      });
    }
    
    console.log(`✅ Seller: ${seller.displayName} (${seller._id})`);
    console.log(`✅ Buyer: ${buyer.displayName} (${buyer._id})\n`);

    // Test 3: Create or find wallet
    console.log('💰 Test 3: Wallet Creation');
    let wallet = await Wallet.findByUser(seller._id);
    if (!wallet) {
      wallet = await Wallet.createForUser(seller._id);
    }
    
    console.log(`✅ Wallet created for seller: ${wallet._id}`);
    console.log(`Initial Balance: ₹${wallet.getBalanceInRupees()}\n`);

    // Test 4: Simulate sale and commission credit
    console.log('💳 Test 4: Simulating Sale Transaction');
    const testSaleAmount = 50000; // ₹500.00
    const testPlatformCommission = Math.round(testSaleAmount * 0.15);
    const testSellerCommission = Math.round(testSaleAmount * 0.85);
    
    const initialBalance = wallet.balance;
    
    // Credit seller commission
    await wallet.credit(
      testSellerCommission,
      'TEST_PAYMENT_123',
      `Test sale commission (85%) - ₹${(testSaleAmount / 100).toFixed(2)}`,
      'sale'
    );
    
    await wallet.reload();
    console.log(`✅ Credited ₹${(testSellerCommission / 100).toFixed(2)} to seller wallet`);
    console.log(`New Balance: ₹${wallet.getBalanceInRupees()}`);
    console.log(`Balance Increase: ₹${((wallet.balance - initialBalance) / 100).toFixed(2)}\n`);

    // Test 5: Payout Request
    console.log('📤 Test 5: Payout Request');
    const payoutAmount = 20000; // ₹200.00
    
    if (wallet.canWithdraw(payoutAmount)) {
      const payout = new Payout({
        payoutId: Payout.generatePayoutId(),
        user: seller._id,
        wallet: wallet._id,
        amount: payoutAmount,
        netAmount: payoutAmount,
        bankDetails: {
          accountNumber: '1234567890',
          ifscCode: 'TEST0001234',
          accountHolderName: 'Test Seller'
        }
      });
      
      await payout.save();
      console.log(`✅ Payout request created: ${payout.payoutId}`);
      console.log(`Amount: ₹${(payoutAmount / 100).toFixed(2)}`);
      console.log(`Status: ${payout.status}\n`);
      
      // Test 6: Payout Approval
      console.log('✅ Test 6: Payout Approval');
      const balanceBeforeApproval = wallet.balance;
      
      // Approve payout
      await payout.approve(seller._id, 'Test approval');
      
      // Debit wallet
      await wallet.debit(
        payout.amount,
        payout.payoutId,
        `Payout withdrawal - ${payout.payoutId}`,
        'payout',
        payout._id
      );
      
      await wallet.reload();
      console.log(`✅ Payout approved and wallet debited`);
      console.log(`Balance before: ₹${(balanceBeforeApproval / 100).toFixed(2)}`);
      console.log(`Balance after: ₹${wallet.getBalanceInRupees()}`);
      console.log(`Amount debited: ₹${((balanceBeforeApproval - wallet.balance) / 100).toFixed(2)}\n`);
      
    } else {
      console.log('❌ Insufficient balance for payout\n');
    }

    // Test 7: Transaction History
    console.log('📋 Test 7: Transaction History');
    const transactions = await Transaction.getWalletTransactions(wallet._id, { limit: 10 });
    console.log(`✅ Found ${transactions.length} transactions:`);
    
    transactions.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.type.toUpperCase()} - ₹${(tx.amount / 100).toFixed(2)} - ${tx.description}`);
    });
    
    console.log('\n🎉 All wallet system tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run tests
testWalletSystem();
