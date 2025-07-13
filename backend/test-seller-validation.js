import SellerVerificationService from './services/sellerVerificationService.js';

// Test seller registration validation
const testData = {
  email: 'test@example.com',
  password: 'password123',
  displayName: 'Test User',
  fullName: 'Test Full Name',
  phoneNumber: '1234567890',
  occupation: 'Developer',
  experienceLevel: 'intermediate',
  yearsOfExperience: 5,
  portfolioUrl: 'https://example.com',
  githubProfile: 'https://github.com/test',
  motivation: 'I want to sell my projects',
  specializations: ['web-development'],
  sellerTermsAccepted: true,
  workExamples: []
};

console.log('Testing seller validation with data:', testData);

try {
  const validationRules = SellerVerificationService.getSellerRegistrationValidation();
  console.log('Validation rules loaded successfully');
  console.log('Number of validation rules:', validationRules.length);
} catch (error) {
  console.error('Error loading validation rules:', error);
}
