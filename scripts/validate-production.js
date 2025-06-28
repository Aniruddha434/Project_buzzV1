#!/usr/bin/env node

/**
 * Production Environment Validation Script for ProjectBuzz
 * 
 * This script validates all production environment variables and configurations
 */

import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const envPath = join(dirname(fileURLToPath(import.meta.url)), '../backend/.env.production');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('❌ .env.production file not found');
  process.exit(1);
}

class ProductionValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  run() {
    console.log('🔍 ProjectBuzz Production Environment Validation\n');
    
    this.validateEnvironment();
    this.validateDatabase();
    this.validateSecurity();
    this.validatePayments();
    this.validateEmail();
    this.validateCORS();
    this.validateFiles();
    
    this.printReport();
    
    if (this.errors.length > 0) {
      console.log('\n❌ Validation failed. Please fix the errors above before deploying to production.');
      process.exit(1);
    } else {
      console.log('\n✅ All validations passed! Ready for production deployment.');
      process.exit(0);
    }
  }

  validateEnvironment() {
    console.log('🌍 Validating environment configuration...');
    
    // Node environment
    if (process.env.NODE_ENV !== 'production') {
      this.errors.push('NODE_ENV must be set to "production"');
    } else {
      this.passed.push('NODE_ENV is set to production');
    }
    
    // URLs
    const requiredUrls = ['FRONTEND_URL', 'BACKEND_URL'];
    for (const url of requiredUrls) {
      if (!process.env[url]) {
        this.errors.push(`${url} is required`);
      } else if (!process.env[url].startsWith('https://')) {
        this.warnings.push(`${url} should use HTTPS in production`);
      } else {
        this.passed.push(`${url} is properly configured`);
      }
    }
  }

  validateDatabase() {
    console.log('🗄️  Validating database configuration...');
    
    if (!process.env.MONGO_URI) {
      this.errors.push('MONGO_URI is required');
      return;
    }
    
    // Check if it's Atlas URI
    if (!process.env.MONGO_URI.includes('mongodb+srv://')) {
      this.warnings.push('Consider using MongoDB Atlas (mongodb+srv://) for production');
    }
    
    // Check for localhost
    if (process.env.MONGO_URI.includes('localhost') || process.env.MONGO_URI.includes('127.0.0.1')) {
      this.errors.push('Database URI should not use localhost in production');
    } else {
      this.passed.push('Database URI is configured for production');
    }
    
    // Check connection parameters
    const requiredParams = ['retryWrites=true', 'w=majority'];
    for (const param of requiredParams) {
      if (!process.env.MONGO_URI.includes(param)) {
        this.warnings.push(`Database URI should include ${param} for reliability`);
      }
    }
    
    // Database connection settings
    const dbSettings = [
      'DB_MAX_POOL_SIZE',
      'DB_SERVER_SELECTION_TIMEOUT',
      'DB_SOCKET_TIMEOUT'
    ];
    
    for (const setting of dbSettings) {
      if (!process.env[setting]) {
        this.warnings.push(`${setting} should be configured for production`);
      } else {
        this.passed.push(`${setting} is configured`);
      }
    }
  }

  validateSecurity() {
    console.log('🔐 Validating security configuration...');
    
    // JWT Secret
    if (!process.env.JWT_SECRET) {
      this.errors.push('JWT_SECRET is required');
    } else if (process.env.JWT_SECRET.length < 32) {
      this.errors.push('JWT_SECRET should be at least 32 characters long');
    } else if (process.env.JWT_SECRET.length < 64) {
      this.warnings.push('JWT_SECRET should be at least 64 characters for better security');
    } else {
      this.passed.push('JWT_SECRET is properly configured');
    }
    
    // BCRYPT rounds
    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS);
    if (!bcryptRounds) {
      this.warnings.push('BCRYPT_ROUNDS should be set (recommended: 12-14)');
    } else if (bcryptRounds < 12) {
      this.warnings.push('BCRYPT_ROUNDS should be at least 12 for production');
    } else {
      this.passed.push('BCRYPT_ROUNDS is properly configured');
    }
    
    // Session secret
    if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
      this.warnings.push('SESSION_SECRET should be at least 32 characters long');
    }
  }

  validatePayments() {
    console.log('💳 Validating payment configuration...');
    
    // Razorpay
    const razorpayKeys = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
    for (const key of razorpayKeys) {
      if (!process.env[key]) {
        this.errors.push(`${key} is required for payment processing`);
      } else if (key === 'RAZORPAY_KEY_ID' && !process.env[key].startsWith('rzp_')) {
        this.warnings.push('RAZORPAY_KEY_ID should start with "rzp_"');
      } else {
        this.passed.push(`${key} is configured`);
      }
    }
    
    // Check for test vs live keys
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID.includes('test')) {
      this.warnings.push('Using Razorpay test keys - ensure you switch to live keys for production');
    } else if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID.includes('live')) {
      this.passed.push('Using Razorpay live keys for production');
    }
    
    // Webhook secret
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      this.warnings.push('RAZORPAY_WEBHOOK_SECRET should be configured for webhook verification');
    } else {
      this.passed.push('Razorpay webhook secret is configured');
    }
  }

  validateEmail() {
    console.log('📧 Validating email configuration...');
    
    const emailSettings = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    for (const setting of emailSettings) {
      if (!process.env[setting]) {
        this.errors.push(`${setting} is required for email functionality`);
      } else {
        this.passed.push(`${setting} is configured`);
      }
    }
    
    // Check email addresses
    const emailAddresses = ['FROM_EMAIL', 'SUPPORT_EMAIL'];
    for (const email of emailAddresses) {
      if (!process.env[email]) {
        this.warnings.push(`${email} should be configured`);
      } else if (!process.env[email].includes('@')) {
        this.errors.push(`${email} should be a valid email address`);
      } else {
        this.passed.push(`${email} is configured`);
      }
    }
  }

  validateCORS() {
    console.log('🌐 Validating CORS configuration...');
    
    if (!process.env.CORS_ORIGIN) {
      this.warnings.push('CORS_ORIGIN should be configured for production');
    } else {
      const origins = process.env.CORS_ORIGIN.split(',');
      let hasHttps = false;
      
      for (const origin of origins) {
        if (origin.trim().startsWith('https://')) {
          hasHttps = true;
        } else if (origin.trim().startsWith('http://')) {
          this.warnings.push(`CORS origin ${origin.trim()} should use HTTPS in production`);
        }
      }
      
      if (hasHttps) {
        this.passed.push('CORS origins include HTTPS URLs');
      }
    }
  }

  validateFiles() {
    console.log('📁 Validating file configuration...');
    
    // Check upload settings
    const fileSettings = ['MAX_FILE_SIZE', 'UPLOAD_PATH', 'MAX_FILES_PER_PROJECT'];
    for (const setting of fileSettings) {
      if (!process.env[setting]) {
        this.warnings.push(`${setting} should be configured`);
      } else {
        this.passed.push(`${setting} is configured`);
      }
    }
    
    // Check upload directory
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      this.warnings.push(`Upload directory ${uploadPath} does not exist`);
    } else {
      this.passed.push('Upload directory exists');
    }
  }

  printReport() {
    console.log('\n📋 Validation Report');
    console.log('='.repeat(50));
    
    if (this.passed.length > 0) {
      console.log('\n✅ Passed Validations:');
      this.passed.forEach(item => console.log(`   ✓ ${item}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(item => console.log(`   ⚠ ${item}`));
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(item => console.log(`   ✗ ${item}`));
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`Summary: ${this.passed.length} passed, ${this.warnings.length} warnings, ${this.errors.length} errors`);
  }
}

// Run the validation
const validator = new ProductionValidator();
validator.run();
