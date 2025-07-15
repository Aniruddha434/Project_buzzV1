import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, UserCheck, Shield, Users, Star, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import EnhancedInput from '../components/ui/EnhancedInput';
import EnhancedButton from '../components/ui/EnhancedButton';
import EnhancedOTPInput from '../components/ui/EnhancedOTPInput';

import OTPVerificationModal from '../components/OTPVerificationModal';
import { CanvasRevealEffect } from '../components/ui/CanvasRevealEffect';
import api from '../api.js';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'buyer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingUserId, setPendingUserId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);

  const { login, register, error, clearError, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1: return 'Very Weak';
      case 2: return 'Weak';
      case 3: return 'Fair';
      case 4: return 'Good';
      case 5: return 'Strong';
      default: return '';
    }
  };

  const getPasswordStrengthColor = (strength: number) => {
    switch (strength) {
      case 0:
      case 1: return 'text-red-500';
      case 2: return 'text-orange-500';
      case 3: return 'text-yellow-500';
      case 4: return 'text-blue-500';
      case 5: return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check password strength for registration
    if (name === 'password' && !isLogin) {
      setPasswordStrength(checkPasswordStrength(value));
    }

    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let success = false;

      if (isLogin) {
        // Validate login data
        if (!formData.email.trim() || !formData.password.trim()) {
          throw new Error('Please fill in all required fields');
        }
        success = await login(formData.email.trim(), formData.password);
      } else {
        // Validate registration data (buyers only)
        if (!formData.email.trim() || !formData.password.trim()) {
          throw new Error('Please fill in all required fields');
        }

        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        // Ensure displayName is not empty for registration
        const displayName = formData.displayName.trim() || formData.email.split('@')[0];

        console.log('🔍 Frontend buyer registration data validation:');
        console.log('Email:', formData.email.trim());
        console.log('Password length:', formData.password.length);
        console.log('Display name:', displayName);
        console.log('Role: buyer (forced)');

        // For registration, first create user and send OTP
        const response = await api.post('/auth/register-with-otp', {
          email: formData.email.trim(),
          password: formData.password,
          displayName,
          role: 'buyer'
        });

        if (response.data.success) {
          setPendingUserId(response.data.userId);
          setStep('code');
          setIsLoading(false);
          return; // Don't proceed with navigation yet
        } else {
          throw new Error(response.data.message || 'Registration failed');
        }
      }

      if (success) {
        // Always redirect to home page after successful login
        navigate('/');
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerificationSuccess = async () => {
    setShowOTPModal(false);

    // OTP verification already completed the registration and returned user data
    // Just navigate to home page
    navigate('/');
  };

  // Enhanced OTP handling for inline flow
  const handleEnhancedOTPComplete = async (otp: string) => {
    setOtpCode(otp);
    setOtpError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', {
        userId: pendingUserId,
        otp: otp,
        type: 'email'
      });

      if (response.data.success) {
        // Show reverse canvas animation
        setReverseCanvasVisible(true);
        setTimeout(() => setInitialCanvasVisible(false), 50);

        // Transition to success screen
        setTimeout(() => {
          setStep('success');
          // Handle auth success
          const { handleAuthSuccess } = useAuth();
          handleAuthSuccess(response.data.data.user, response.data.data.token);
        }, 2000);
      } else {
        setOtpError(response.data.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    try {
      const response = await api.post('/auth/resend-otp', {
        userId: pendingUserId,
        type: 'email'
      });

      if (response.data.success) {
        setResendCooldown(60);
        setOtpError('');
      } else {
        setOtpError(response.data.message || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setOtpError('Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleBackToEmail = () => {
    setStep('email');
    setOtpCode('');
    setOtpError('');
    setReverseCanvasVisible(false);
    setInitialCanvasVisible(true);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden page-with-navbar">
      {/* Canvas Background Effects */}
      <div className="absolute inset-0">
        {/* Initial canvas (forward animation) */}
        {initialCanvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={0.1}
              opacities={[0.2, 0.2, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1]}
              colors={[[0, 255, 255]]}
              containerClassName="h-full"
              dotSize={2}
              showGradient={true}
              reverse={false}
            />
          </div>
        )}

        {/* Reverse canvas (appears when code is complete) */}
        {reverseCanvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={0.1}
              opacities={[0.2, 0.2, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1]}
              colors={[[255, 255, 255]]}
              containerClassName="h-full"
              dotSize={2}
              showGradient={true}
              reverse={true}
            />
          </div>
        )}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">


            <AnimatePresence mode="wait">
              {step === 'email' && (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Header */}
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {isLogin ? 'Welcome Developer' : 'Welcome Developer'}
                    </h2>
                    <p className="text-gray-300">
                      {isLogin ? 'Your sign in component' : 'Your sign up component'}
                    </p>
                  </div>

                  {/* Google Sign In Button */}
                  <div className="mb-6">
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
                      className="mb-4"
                    >
                      Sign in with Google
                    </EnhancedButton>
                  </div>

                  {/* Divider */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-black text-gray-400">or</span>
                    </div>
                  </div>

                  {/* Form */}
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <EnhancedInput
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      variant="enhanced"
                      required
                      autoComplete="email"
                    />

              {/* Display Name Field (Registration Only) */}
              {!isLogin && (
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="displayName"
                      name="displayName"
                      type="text"
                      required={!isLogin}
                      className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your display name"
                      value={formData.displayName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator (Registration Only) */}
                {!isLogin && formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Password strength:</span>
                      <span className={`font-medium ${getPasswordStrengthColor(passwordStrength)}`}>
                        {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </div>
                    <div className="mt-1 flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full ${
                            level <= passwordStrength
                              ? passwordStrength <= 2
                                ? 'bg-red-500'
                                : passwordStrength <= 3
                                ? 'bg-yellow-500'
                                : passwordStrength <= 4
                                ? 'bg-blue-500'
                                : 'bg-green-500'
                              : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Account Type Info (Registration Only) */}
              {!isLogin && (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserCheck className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-400">
                        Creating Buyer Account
                      </h3>
                      <p className="text-sm text-gray-300 mt-1">
                        You're registering as a buyer to purchase projects.
                        <br />
                        Want to sell projects? <Link to="/seller-registration" className="font-medium underline text-blue-400 hover:text-blue-300">Register as a seller</Link>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="rounded-lg bg-red-900/20 border border-red-700 p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
                    </form>

                    {/* Toggle Login/Register */}
          <div className="text-center">
            <p className="text-sm text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              {' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  clearError();
                  setPasswordStrength(0);
                  setShowPassword(false);
                }}
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

                    {/* Back to Home */}
                    <div className="text-center">
                      <Link
                        to="/"
                        className="inline-flex items-center text-sm text-gray-400 hover:text-gray-300"
                      >
                        ← Back to home
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerificationSuccess={handleOTPVerificationSuccess}
        email={formData.email}
        userId={pendingUserId}
        verificationType="email"
      />
    </div>
  );
};

export default LoginPage;
