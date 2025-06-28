import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

async function fixDatabaseIndexes() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    console.log('\n🔍 Checking payments collection indexes...');
    const indexes = await db.collection('payments').indexes();
    
    console.log('📋 Current indexes:');
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Check for problematic cfOrderId index
    const cfOrderIdIndex = indexes.find(index => 
      index.key && index.key.cfOrderId !== undefined
    );

    if (cfOrderIdIndex) {
      console.log('\n❌ Found problematic cfOrderId index:', cfOrderIdIndex.name);
      console.log('🔧 Dropping cfOrderId index...');
      
      try {
        await db.collection('payments').dropIndex(cfOrderIdIndex.name);
        console.log('✅ Successfully dropped cfOrderId index');
      } catch (error) {
        console.log('⚠️  Error dropping index:', error.message);
      }
    } else {
      console.log('\n✅ No problematic cfOrderId index found');
    }

    // Check for any documents with cfOrderId field
    console.log('\n🔍 Checking for documents with cfOrderId field...');
    const docsWithCfOrderId = await db.collection('payments').countDocuments({
      cfOrderId: { $exists: true }
    });
    
    console.log(`📊 Documents with cfOrderId field: ${docsWithCfOrderId}`);

    if (docsWithCfOrderId > 0) {
      console.log('🔧 Removing cfOrderId field from documents...');
      const result = await db.collection('payments').updateMany(
        { cfOrderId: { $exists: true } },
        { $unset: { cfOrderId: "" } }
      );
      console.log(`✅ Updated ${result.modifiedCount} documents`);
    }

    console.log('\n📋 Final index list:');
    const finalIndexes = await db.collection('payments').indexes();
    finalIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\n✅ Database cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixDatabaseIndexes();
