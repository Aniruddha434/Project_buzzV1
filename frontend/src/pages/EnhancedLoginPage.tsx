import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, UserCheck, Shield, Users, Star, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import EnhancedInput from '../components/ui/EnhancedInput';
import EnhancedButton from '../components/ui/EnhancedButton';
import EnhancedOTPInput from '../components/ui/EnhancedOTPInput';
import api from '../api.js';

import { Squares } from '../components/ui/Squares';
import InlineError from '../components/ui/InlineError';

const EnhancedLoginPage: React.FC = () => {
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
  const [pendingUserId, setPendingUserId] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [githubError, setGithubError] = useState('');

  const { login, error, clearError, handleAuthSuccess, loginWithGoogle, loginWithGitHub } = useAuth();
  const navigate = useNavigate();

  const handleGitHubLogin = () => {
    setGithubError('GitHub Login is currently under development. Please use Google Sign-in for now.');
    // Clear the error after 8 seconds
    setTimeout(() => setGithubError(''), 8000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login flow
        if (!formData.email.trim() || !formData.password.trim()) {
          throw new Error('Please fill in all required fields');
        }
        const success = await login(formData.email.trim(), formData.password);
        if (success) {
          navigate('/');
        }
      } else {
        // Registration flow
        if (!formData.email.trim()) {
          throw new Error('Please enter your email');
        }

        if (!formData.password.trim()) {
          throw new Error('Please enter a password');
        }

        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        const displayName = formData.displayName.trim() || formData.email.split('@')[0];

        const response = await api.post('/auth/register-with-otp', {
          email: formData.email.trim(),
          password: formData.password,
          displayName,
          role: 'buyer'
        });

        if (response.data.success) {
          setPendingUserId(response.data.userId);
          setStep('code');
        } else {
          throw new Error(response.data.message || 'Registration failed');
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnhancedOTPComplete = async (otp: string) => {
    setOtpError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', {
        userId: pendingUserId,
        otp: otp,
        type: 'email'
      });

      if (response.data.success) {
        // Transition to success screen
        setTimeout(() => {
          setStep('success');
          handleAuthSuccess(response.data.data.user, response.data.data.token);
        }, 1000);
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
    setOtpError('');
  };

  const handleContinueToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#060606] relative overflow-hidden page-with-navbar">
      {/* Squares Background */}
      <div className="absolute inset-0">
        <Squares
          direction="diagonal"
          speed={0.5}
          borderColor="#333"
          squareSize={40}
          hoverFillColor="#222"
          className="w-full h-full"
        />
      </div>

      {/* Content Layer - Mobile Responsive */}
      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex auth-page-mobile">
        {/* Form */}
        <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 w-full auth-content-mobile">
          <div className="max-w-md w-full space-y-6 sm:space-y-8 login-form-card">

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
                      Welcome Developer
                    </h2>
                    <p className="text-gray-300">
                      Your {isLogin ? 'sign in' : 'sign up'} component
                    </p>
                  </div>

                  {/* OAuth Buttons - Mobile Optimized */}
                  <div className="mb-6 space-y-3">
                    <EnhancedButton
                      type="button"
                      variant="enhanced-outline"
                      size="lg"
                      fullWidth
                      onClick={loginWithGoogle}
                      className="oauth-button-mobile"
                      leftIcon={
                        <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                          <span className="text-black font-bold text-sm">G</span>
                        </div>
                      }
                    >
                      Sign in with Google
                    </EnhancedButton>

                    <EnhancedButton
                      type="button"
                      variant="enhanced-outline"
                      size="lg"
                      fullWidth
                      onClick={handleGitHubLogin}
                      className="oauth-button-mobile"
                      leftIcon={
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                        </svg>
                      }
                    >
                      Sign in with GitHub
                    </EnhancedButton>
                  </div>

                  {/* GitHub Error Message */}
                  {githubError && (
                    <div className="mb-4">
                      <InlineError
                        message={githubError}
                        variant="info"
                        dismissible
                        onDismiss={() => setGithubError('')}
                      />
                    </div>
                  )}

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
                      <EnhancedInput
                        name="displayName"
                        type="text"
                        placeholder="Enter your display name"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        variant="enhanced"
                        autoComplete="name"
                      />
                    )}

                    {/* Password Field - Show for both login and registration */}
                    <EnhancedInput
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={isLogin ? "Enter your password" : "Create a password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      variant="enhanced"
                      required
                      autoComplete={isLogin ? "current-password" : "new-password"}
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

                    {/* Error Display */}
                    {error && (
                      <motion.div
                        className="rounded-lg bg-red-900/20 border border-red-700 p-4"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-sm text-red-300">{error}</p>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <EnhancedButton
                      type="submit"
                      variant="enhanced"
                      size="lg"
                      isLoading={isLoading}
                      disabled={isLoading}
                      fullWidth
                      rightIcon={<span>→</span>}
                    >
                      {isLogin ? 'Sign In' : 'Continue'}
                    </EnhancedButton>
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
                          setShowPassword(false);
                        }}
                        className="font-medium text-blue-400 hover:text-blue-300"
                      >
                        {isLogin ? 'Sign up' : 'Sign in'}
                      </button>
                    </p>
                  </div>

                  {/* Terms */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      By signing up, you agree to the MSA, Product Terms, Policies, Privacy Notice, and Cookie Notice.
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

              {step === 'code' && (
                <motion.div
                  key="code-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Header */}
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      We sent you a code
                    </h2>
                    <p className="text-gray-300">
                      Please enter it
                    </p>
                  </div>

                  {/* OTP Input */}
                  <div className="space-y-6">
                    <EnhancedOTPInput
                      length={6}
                      onComplete={handleEnhancedOTPComplete}
                      onResend={handleResendOTP}
                      isLoading={isLoading}
                      error={otpError}
                      resendCooldown={resendCooldown}
                    />
                  </div>

                  {/* Back Button */}
                  <div className="flex justify-between items-center">
                    <EnhancedButton
                      type="button"
                      variant="enhanced-outline"
                      size="md"
                      onClick={handleBackToEmail}
                      leftIcon={<ArrowLeft className="h-4 w-4" />}
                    >
                      Back
                    </EnhancedButton>

                    <EnhancedButton
                      type="button"
                      variant="enhanced"
                      size="md"
                      disabled={true}
                    >
                      Continue
                    </EnhancedButton>
                  </div>

                  {/* Terms */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      By signing up, you agree to the MSA, Product Terms, Policies, Privacy Notice, and Cookie Notice.
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success-step"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8 text-center"
                >
                  {/* Header */}
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      You're in!
                    </h2>
                    <p className="text-gray-300">
                      Welcome
                    </p>
                  </div>

                  {/* Success Icon */}
                  <div className="flex justify-center">
                    <motion.div
                      className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Continue Button */}
                  <EnhancedButton
                    type="button"
                    variant="enhanced"
                    size="lg"
                    fullWidth
                    onClick={handleContinueToDashboard}
                  >
                    Continue to Dashboard
                  </EnhancedButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoginPage;
