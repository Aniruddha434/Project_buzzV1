import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, Phone, Briefcase, Star, Github, Globe,
  FileText, CheckCircle, AlertCircle, Eye, EyeOff, Plus, X, ArrowLeft, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import EnhancedInput from '../components/ui/EnhancedInput';
import EnhancedButton from '../components/ui/EnhancedButton';

import OTPVerificationModal from '../components/OTPVerificationModal';
import { Squares } from '../components/ui/Squares';
import { getCachedApiConfig } from '../config/api.config.js';
import api from '../api.js';
import { useAuth } from '../context/AuthContext';

interface WorkExample {
  title: string;
  description: string;
  url: string;
  technologies: string[];
}

interface FormData {
  // Basic Information
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  fullName: string;
  phoneNumber: string;

  // Professional Information
  occupation: string;
  experienceLevel: string;
  yearsOfExperience: string;
  portfolioUrl: string;
  githubProfile: string;

  // Business Information
  businessName: string;
  businessType: string;
  businessRegistrationNumber: string;

  // Additional Information
  motivation: string;
  specializations: string[];
  expectedMonthlyRevenue: string;

  // Work Examples
  workExamples: WorkExample[];

  // Terms
  sellerTermsAccepted: boolean;
}

const EnhancedSellerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithGitHub } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingUserId, setPendingUserId] = useState('');

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    fullName: '',
    phoneNumber: '',
    occupation: '',
    experienceLevel: '',
    yearsOfExperience: '',
    portfolioUrl: '',
    githubProfile: '',
    businessName: '',
    businessType: 'individual',
    businessRegistrationNumber: '',
    motivation: '',
    specializations: [],
    expectedMonthlyRevenue: '',
    workExamples: [],
    sellerTermsAccepted: false
  });

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner (0-2 years)' },
    { value: 'intermediate', label: 'Intermediate (2-5 years)' },
    { value: 'advanced', label: 'Advanced (5-10 years)' },
    { value: 'expert', label: 'Expert (10+ years)' }
  ];

  const businessTypes = [
    { value: 'individual', label: 'Individual/Freelancer' },
    { value: 'company', label: 'Company/Business' },
    { value: 'startup', label: 'Startup' },
    { value: 'agency', label: 'Agency' }
  ];

  const specializationOptions = [
    'Web Development', 'Mobile Development', 'Desktop Applications',
    'Game Development', 'AI/Machine Learning', 'Data Science',
    'DevOps/Cloud', 'Blockchain', 'UI/UX Design', 'API Development',
    'E-commerce', 'CMS Development', 'Database Design', 'Security',
    'Testing/QA', 'Project Management'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    setError(null);
  };

  const handleSpecializationChange = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  const addWorkExample = () => {
    setFormData(prev => ({
      ...prev,
      workExamples: [...prev.workExamples, {
        title: '',
        description: '',
        url: '',
        technologies: []
      }]
    }));
  };

  const removeWorkExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workExamples: prev.workExamples.filter((_, i) => i !== index)
    }));
  };

  const updateWorkExample = (index: number, field: keyof WorkExample, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      workExamples: prev.workExamples.map((example, i) => 
        i === index ? { ...example, [field]: value } : example
      )
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.email && formData.password && formData.confirmPassword &&
                 formData.displayName && formData.fullName && formData.phoneNumber);
      case 2:
        return !!(formData.occupation && formData.experienceLevel && formData.yearsOfExperience);
      case 3:
        return !!(formData.motivation && formData.specializations.length > 0);
      case 4:
        return formData.sellerTermsAccepted;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      setError(null);
    } else {
      setError('Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.specializations.length === 0) {
      setError('Please select at least one specialization');
      return;
    }

    if (!formData.sellerTermsAccepted) {
      setError('You must accept the seller terms and conditions');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Client-side validation
      if (!formData.email || !formData.password || !formData.displayName || !formData.fullName) {
        setError('Please fill in all required fields: Email, Password, Display Name, and Full Name');
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }

      const requestData = {
        ...formData,
        yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
        expectedMonthlyRevenue: parseInt(formData.expectedMonthlyRevenue) || 0
      };

      console.log('📝 Sending registration data:', requestData);

      // First create seller account and send OTP
      const response = await api.post('/auth/register-seller-with-otp', requestData);

      if (response.data.success) {
        console.log('✅ Seller registration initiated, showing OTP modal');
        setPendingUserId(response.data.userId);
        setShowOTPModal(true);
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerificationSuccess = async () => {
    setShowOTPModal(false);

    // OTP verification already completed the registration and authentication
    // The user is now logged in and the registration is complete
    setSuccess('Seller registration successful! You can start selling immediately. Welcome to ProjectBuzz!');

    // Redirect to seller dashboard after a short delay
    setTimeout(() => {
      navigate('/dashboard/seller');
    }, 2000);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Basic Information';
      case 2: return 'Professional Details';
      case 3: return 'Specializations & Goals';
      case 4: return 'Terms & Conditions';
      default: return 'Registration';
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] relative overflow-hidden page-with-navbar">
      {/* Squares Background */}
      <div className="absolute inset-0">
        <Squares
          direction="up"
          speed={0.3}
          borderColor="#444"
          squareSize={50}
          hoverFillColor="#333"
          className="w-full h-full"
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex">
        {/* Form */}
        <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl w-full space-y-8">

            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                Seller Registration
              </h2>
              <p className="text-gray-400">
                Complete the verification process to become a verified seller
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                    animate={{
                      scale: step === currentStep ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {step < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step
                    )}
                  </motion.div>
                  {step < 4 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Title */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white">
                {getStepTitle()}
              </h3>
            </div>

            {/* Form */}
            <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        {/* OAuth Buttons */}
                        <div className="space-y-3 mb-6">
                          <EnhancedButton
                            type="button"
                            variant="enhanced-outline"
                            size="lg"
                            fullWidth
                            onClick={loginWithGoogle}
                            leftIcon={
                              <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                                <span className="text-black font-bold text-sm">G</span>
                              </div>
                            }
                          >
                            Continue with Google
                          </EnhancedButton>

                          <div className="relative">
                            <EnhancedButton
                              type="button"
                              variant="enhanced-outline"
                              size="lg"
                              fullWidth
                              onClick={loginWithGitHub}
                              className="opacity-60 cursor-not-allowed"
                              leftIcon={
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                                </svg>
                              }
                            >
                              Continue with GitHub
                            </EnhancedButton>
                            <div className="absolute top-0 right-0 -mt-1 -mr-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-300 border border-yellow-700/50">
                                🚧 Coming Soon
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="relative mb-6">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-black text-gray-400">or continue with email</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <EnhancedInput
                            name="email"
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleInputChange}
                            variant="enhanced"
                            required
                            autoComplete="email"
                          />
                          <EnhancedInput
                            name="displayName"
                            type="text"
                            placeholder="Display Name"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            variant="enhanced"
                            required
                            autoComplete="username"
                          />
                        </div>

                        <EnhancedInput
                          name="fullName"
                          type="text"
                          placeholder="Full Name"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          variant="enhanced"
                          required
                          autoComplete="name"
                        />

                        <EnhancedInput
                          name="phoneNumber"
                          type="tel"
                          placeholder="Phone Number"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          variant="enhanced"
                          required
                          autoComplete="tel"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <EnhancedInput
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            variant="enhanced"
                            required
                            autoComplete="new-password"
                            rightIcon={
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            }
                          />
                          <EnhancedInput
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            variant="enhanced"
                            required
                            autoComplete="new-password"
                            rightIcon={
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            }
                          />
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <EnhancedInput
                          name="occupation"
                          type="text"
                          placeholder="Occupation/Job Title"
                          value={formData.occupation}
                          onChange={handleInputChange}
                          variant="enhanced"
                          required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <select
                              name="experienceLevel"
                              value={formData.experienceLevel}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-full text-white focus:border-white/30 focus:outline-none"
                              required
                            >
                              <option value="">Select Experience Level</option>
                              {experienceLevels.map(level => (
                                <option key={level.value} value={level.value} className="bg-gray-800">
                                  {level.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <EnhancedInput
                            name="yearsOfExperience"
                            type="number"
                            placeholder="Years of Experience"
                            value={formData.yearsOfExperience}
                            onChange={handleInputChange}
                            variant="enhanced"
                            required
                            min="0"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <EnhancedInput
                            name="portfolioUrl"
                            type="url"
                            placeholder="Portfolio URL (Optional)"
                            value={formData.portfolioUrl}
                            onChange={handleInputChange}
                            variant="enhanced"
                          />
                          <EnhancedInput
                            name="githubProfile"
                            type="url"
                            placeholder="GitHub Profile (Optional)"
                            value={formData.githubProfile}
                            onChange={handleInputChange}
                            variant="enhanced"
                          />
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            What motivates you to sell on ProjectBuzz? *
                          </label>
                          <textarea
                            name="motivation"
                            value={formData.motivation}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:border-white/30 focus:outline-none resize-none"
                            rows={4}
                            placeholder="Tell us about your motivation..."
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Specializations * (Select at least one)
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {specializationOptions.map(spec => (
                              <label key={spec} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.specializations.includes(spec)}
                                  onChange={() => handleSpecializationChange(spec)}
                                  className="rounded border-white/20 bg-black/20 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-300">{spec}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 max-h-64 overflow-y-auto">
                          <h4 className="text-lg font-medium text-white mb-4">Seller Terms and Conditions</h4>
                          <div className="text-sm text-gray-300 space-y-3">
                            <p><strong>1. Seller Responsibilities:</strong> As a seller on ProjectBuzz, you agree to provide high-quality, original projects and maintain professional standards.</p>
                            <p><strong>2. Revenue Sharing:</strong> ProjectBuzz retains 15% commission on all sales. You will receive 85% of the sale price.</p>
                            <p><strong>3. Content Ownership:</strong> You retain ownership of your projects but grant ProjectBuzz the right to display and market them on the platform.</p>
                            <p><strong>4. Quality Standards:</strong> All projects must meet our quality guidelines and be thoroughly tested before submission.</p>
                            <p><strong>5. Support:</strong> You agree to provide reasonable support to buyers of your projects.</p>
                          </div>
                        </div>

                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="sellerTermsAccepted"
                            checked={formData.sellerTermsAccepted}
                            onChange={handleInputChange}
                            className="mt-1 rounded border-white/20 bg-black/20 text-blue-600 focus:ring-blue-500"
                            required
                          />
                          <span className="text-sm text-gray-300">
                            I have read and agree to the Seller Terms and Conditions, Privacy Policy, and Platform Guidelines.
                          </span>
                        </label>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Error Display */}
                {error && (
                  <motion.div
                    className="mt-6 rounded-lg bg-red-900/20 border border-red-700 p-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Success Display */}
                {success && (
                  <motion.div
                    className="mt-6 rounded-lg bg-green-900/20 border border-green-700 p-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                      <p className="text-sm text-green-300">{success}</p>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8">
                  {currentStep > 1 ? (
                    <EnhancedButton
                      type="button"
                      variant="enhanced-outline"
                      size="lg"
                      onClick={prevStep}
                      leftIcon={<ArrowLeft className="h-4 w-4" />}
                    >
                      Previous
                    </EnhancedButton>
                  ) : (
                    <div></div>
                  )}

                  {currentStep < 4 ? (
                    <EnhancedButton
                      type="button"
                      variant="enhanced"
                      size="lg"
                      onClick={nextStep}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Next
                    </EnhancedButton>
                  ) : (
                    <EnhancedButton
                      type="submit"
                      variant="enhanced"
                      size="lg"
                      isLoading={isLoading}
                      disabled={isLoading}
                    >
                      Complete Registration
                    </EnhancedButton>
                  )}
                </div>
              </form>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-gray-400 hover:text-white"
              >
                ← Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerificationSuccess={handleOTPVerificationSuccess}
        email={formData.email}
        userId={pendingUserId}
        verificationType="seller_registration"
      />
    </div>
  );
};

export default EnhancedSellerRegistration;
