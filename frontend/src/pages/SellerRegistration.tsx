import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, Phone, Briefcase, Star, Github, Globe,
  FileText, CheckCircle, AlertCircle, Eye, EyeOff, Plus, X
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

// import OTPVerificationModal from '../components/OTPVerificationModal';
import { getCachedApiConfig } from '../config/api.config.js';
import api from '../api.js';

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

const SellerRegistration: React.FC = () => {
  const navigate = useNavigate();
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
    { value: 'individual', label: 'Individual Developer' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'company', label: 'Company' },
    { value: 'startup', label: 'Startup' }
  ];

  const commonSpecializations = [
    'Web Development', 'Mobile Development', 'Backend Development', 'Frontend Development',
    'Full Stack Development', 'DevOps', 'Machine Learning', 'Data Science', 'UI/UX Design',
    'Game Development', 'Blockchain', 'Cloud Computing', 'Cybersecurity', 'API Development'
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

  const handleSpecializationToggle = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  const addWorkExample = () => {
    if (formData.workExamples.length < 5) {
      setFormData(prev => ({
        ...prev,
        workExamples: [...prev.workExamples, {
          title: '',
          description: '',
          url: '',
          technologies: []
        }]
      }));
    }
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
    } else {
      setError('Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
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

      if (!formData.sellerTermsAccepted) {
        setError('You must accept the seller terms and conditions');
        setIsLoading(false);
        return;
      }

      const requestData = {
        ...formData,
        yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
        expectedMonthlyRevenue: parseInt(formData.expectedMonthlyRevenue) || 0
      };

      console.log('📝 Sending registration data:', requestData);
      console.log('📋 Data validation check:');
      console.log('- Email:', requestData.email);
      console.log('- Password length:', requestData.password?.length);
      console.log('- Display name:', requestData.displayName);
      console.log('- Full name:', requestData.fullName);
      console.log('- Terms accepted:', requestData.sellerTermsAccepted);
      console.log('- Specializations:', requestData.specializations);

      // First create seller account and send OTP
      const response = await api.post('/auth/register-seller-with-otp', requestData);

      if (response.data.success) {
        setPendingUserId(response.data.userId);
        setShowOTPModal(true);
        setIsLoading(false);
        return; // Don't proceed with navigation yet
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.details) {
        setError(`Validation failed: ${error.response.data.details}`);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((err: any) => err.msg).join(', ');
        setError(`Validation errors: ${errorMessages}`);
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  placeholder="How you want to be known"
                  required
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Legal Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  placeholder="Your full legal name"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Professional Information</h3>

            {/* Occupation */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Occupation *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  placeholder="e.g., Full Stack Developer, UI/UX Designer"
                  required
                />
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Experience Level *
              </label>
              <div className="relative">
                <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-3 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select your experience level</option>
                  {experienceLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Years of Experience *
              </label>
              <Input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="0"
                min="0"
                max="50"
                required
              />
            </div>

            {/* Portfolio URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Portfolio Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="url"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleInputChange}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>

            {/* GitHub Profile */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                GitHub Profile
              </label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="url"
                  name="githubProfile"
                  value={formData.githubProfile}
                  onChange={handleInputChange}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                  placeholder="https://github.com/yourusername"
                />
              </div>
            </div>

            {/* Business Information */}
            <div className="border-t border-gray-700 pt-6">
              <h4 className="text-lg font-medium text-white mb-4">Business Information (Optional)</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business Type
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {businessTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business Name
                  </label>
                  <Input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Your business name"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Specializations & Motivation</h3>

            {/* Specializations */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Specializations * (Select at least 1)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonSpecializations.map(spec => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => handleSpecializationToggle(spec)}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      formData.specializations.includes(spec)
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Selected: {formData.specializations.length} specialization(s)
              </p>
            </div>

            {/* Motivation */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Why do you want to become a seller? *
              </label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Tell us about your motivation to become a seller, your goals, and what you hope to achieve on our platform. (Minimum 50 characters)"
                required
                minLength={50}
                maxLength={1000}
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.motivation.length}/1000 characters (minimum 50)
              </p>
            </div>

            {/* Expected Monthly Revenue */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Expected Monthly Revenue (₹)
              </label>
              <Input
                type="number"
                name="expectedMonthlyRevenue"
                value={formData.expectedMonthlyRevenue}
                onChange={handleInputChange}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="10000"
                min="0"
              />
              <p className="text-xs text-gray-400 mt-1">
                This helps us understand your business goals
              </p>
            </div>

            {/* Work Examples */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Work Examples (Optional)
                </label>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addWorkExample}
                  disabled={formData.workExamples.length >= 5}
                  className="bg-gray-700 hover:bg-gray-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Example
                </Button>
              </div>

              {formData.workExamples.map((example, index) => (
                <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-700 mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-white">Work Example {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeWorkExample(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Project title"
                      value={example.title}
                      onChange={(e) => updateWorkExample(index, 'title', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <textarea
                      placeholder="Brief description"
                      value={example.description}
                      onChange={(e) => updateWorkExample(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <Input
                      type="url"
                      placeholder="Project URL"
                      value={example.url}
                      onChange={(e) => updateWorkExample(index, 'url', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Terms & Conditions</h3>

            {/* Seller Terms */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-h-64 overflow-y-auto">
              <h4 className="text-lg font-medium text-white mb-4">Seller Terms and Conditions</h4>
              <div className="text-sm text-gray-300 space-y-3">
                <p><strong>1. Seller Responsibilities:</strong> As a seller on ProjectBuzz, you agree to provide high-quality, original projects and maintain professional standards.</p>
                <p><strong>2. Revenue Sharing:</strong> ProjectBuzz retains 15% commission on all sales. You will receive 85% of the sale price.</p>
                <p><strong>3. Content Ownership:</strong> You retain ownership of your projects but grant ProjectBuzz the right to display and market them on the platform.</p>
                <p><strong>4. Quality Standards:</strong> All projects must meet our quality guidelines and be thoroughly tested before submission.</p>
                <p><strong>5. Account Activation:</strong> Your seller account will be activated immediately upon registration so you can start selling right away.</p>
                <p><strong>6. Payment Terms:</strong> Payments are processed within 3-4 working days after successful sales.</p>
                <p><strong>7. Prohibited Content:</strong> No illegal, harmful, or copyrighted content is allowed.</p>
                <p><strong>8. Account Suspension:</strong> ProjectBuzz reserves the right to suspend accounts that violate terms.</p>
              </div>
            </div>

            {/* Acceptance Checkbox */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="sellerTermsAccepted"
                name="sellerTermsAccepted"
                checked={formData.sellerTermsAccepted}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                required
              />
              <label htmlFor="sellerTermsAccepted" className="text-sm text-gray-300">
                I have read and agree to the <strong>Seller Terms and Conditions</strong>. I understand that I can start selling projects immediately after registration. *
              </label>
            </div>

            {/* Summary */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h4 className="text-lg font-medium text-white mb-4">Registration Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Email:</p>
                  <p className="text-white">{formData.email}</p>
                </div>
                <div>
                  <p className="text-gray-400">Display Name:</p>
                  <p className="text-white">{formData.displayName}</p>
                </div>
                <div>
                  <p className="text-gray-400">Occupation:</p>
                  <p className="text-white">{formData.occupation}</p>
                </div>
                <div>
                  <p className="text-gray-400">Experience:</p>
                  <p className="text-white">{formData.experienceLevel} ({formData.yearsOfExperience} years)</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-400">Specializations:</p>
                  <p className="text-white">{formData.specializations.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Step content</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <Card className="p-8 bg-gray-900 border-gray-700">
            <form onSubmit={handleSubmit}>
              {renderStepContent()}

              {/* Error Display */}
              {error && (
                <div className="mt-6 rounded-lg bg-red-900/20 border border-red-700 p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Display */}
              {success && (
                <div className="mt-6 rounded-lg bg-green-900/20 border border-green-700 p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                    <p className="text-sm text-green-300">{success}</p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="bg-gray-700 hover:bg-gray-600 text-white"
                >
                  Previous
                </Button>

{currentStep < 4 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    disabled={isLoading || !validateStep(currentStep)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Complete Registration
                  </Button>
                )}
              </div>
            </form>
          </Card>

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

        {/* OTP Verification Modal */}
        {/* <OTPVerificationModal
          isOpen={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          onVerificationSuccess={handleOTPVerificationSuccess}
          email={formData.email}
          userId={pendingUserId}
          verificationType="email"
        /> */}
      </div>
  );
};

export default SellerRegistration;
