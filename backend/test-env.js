import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Environment Variables Test:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'UNDEFINED');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'UNDEFINED');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'UNDEFINED');
console.log('FROM_NAME:', process.env.FROM_NAME);
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);

// Check if .env file exists
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
console.log('\n📁 .env file check:');
console.log('Path:', envPath);
console.log('Exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const smtpLines = envContent.split('\n').filter(line => line.includes('SMTP'));
  console.log('SMTP lines in .env:');
  smtpLines.forEach(line => console.log('  ', line));
}
