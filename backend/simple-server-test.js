import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

console.log('🚀 Starting simple server test...');

async function startSimpleServer() {
  try {
    // Test MongoDB connection first
    console.log('📊 Testing MongoDB connection...');
    console.log('MONGO_URI:', process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');

    // Create simple Express app
    const app = express();
    app.use(express.json());

    // Simple test route
    app.get('/test', (req, res) => {
      res.json({ 
        success: true, 
        message: 'Server is working!',
        timestamp: new Date().toISOString()
      });
    });

    // Test payment creation route (simplified)
    app.post('/api/payments/create-order', (req, res) => {
      console.log('📝 Payment creation request received');
      console.log('Body:', req.body);
      console.log('Headers:', req.headers);

      res.json({
        success: true,
        message: 'Payment creation endpoint is working',
        receivedData: req.body
      });
    });

    // Start server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 Test URL: http://localhost:${PORT}/test`);
      console.log(`🔗 Payment URL: http://localhost:${PORT}/api/payments/create-order`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
    });

    // Keep server running
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      server.close(() => {
        mongoose.disconnect();
        console.log('✅ Server shut down gracefully');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

startSimpleServer();
