import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

async function completeCfOrderIdCleanup() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    console.log('\n🔍 Checking all collections for cfOrderId indexes...');
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections`);

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`\n📋 Checking collection: ${collectionName}`);
      
      try {
        const indexes = await db.collection(collectionName).indexes();
        
        // Look for any cfOrderId indexes
        const cfOrderIdIndexes = indexes.filter(index => 
          index.key && (index.key.cfOrderId !== undefined || index.name.includes('cfOrderId'))
        );

        if (cfOrderIdIndexes.length > 0) {
          console.log(`❌ Found ${cfOrderIdIndexes.length} cfOrderId indexes in ${collectionName}:`);
          
          for (const index of cfOrderIdIndexes) {
            console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
            
            try {
              await db.collection(collectionName).dropIndex(index.name);
              console.log(`   ✅ Dropped index: ${index.name}`);
            } catch (error) {
              console.log(`   ⚠️  Error dropping index ${index.name}:`, error.message);
            }
          }
        } else {
          console.log(`✅ No cfOrderId indexes found in ${collectionName}`);
        }

        // Check for documents with cfOrderId field
        if (collectionName === 'payments') {
          const docsWithCfOrderId = await db.collection(collectionName).countDocuments({
            cfOrderId: { $exists: true }
          });
          
          console.log(`📊 Documents with cfOrderId field: ${docsWithCfOrderId}`);

          if (docsWithCfOrderId > 0) {
            console.log('🔧 Removing cfOrderId field from documents...');
            const result = await db.collection(collectionName).updateMany(
              { cfOrderId: { $exists: true } },
              { $unset: { cfOrderId: "" } }
            );
            console.log(`✅ Updated ${result.modifiedCount} documents`);
          }
        }

      } catch (error) {
        console.log(`⚠️  Error checking collection ${collectionName}:`, error.message);
      }
    }

    // Final verification - check payments collection specifically
    console.log('\n🔍 Final verification of payments collection...');
    const paymentsIndexes = await db.collection('payments').indexes();
    
    console.log('📋 Current payments indexes:');
    paymentsIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Check if any cfOrderId references remain
    const cfOrderIdReferences = paymentsIndexes.filter(index => 
      index.key && (index.key.cfOrderId !== undefined || index.name.includes('cfOrderId'))
    );

    if (cfOrderIdReferences.length === 0) {
      console.log('✅ No cfOrderId references found in payments collection');
    } else {
      console.log('❌ Still found cfOrderId references:', cfOrderIdReferences);
    }

    console.log('\n✅ Complete cfOrderId cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

completeCfOrderIdCleanup();
