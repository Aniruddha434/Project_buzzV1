import React, { useState, useEffect } from 'react';
import { X, Mail, MessageSquare, Shield } from 'lucide-react';
import OTPInput from './ui/OTPInput';
import Button from './ui/Button';
import Card from './ui/Card';
import api from '../api.js';
import { useAuth } from '../context/AuthContext';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: () => void;
  email: string;
  userId: string;
  verificationType: 'email' | 'sms';
  phoneNumber?: string;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerificationSuccess,
  email,
  userId,
  verificationType,
  phoneNumber
}) => {
  const { handleAuthSuccess } = useAuth();
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const maxAttempts = 3;

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (resendCooldown > 0 && isOpen) {
      timer = setTimeout(() => {
        setResendCooldown(prev => {
          const newValue = prev - 1;
          // Only log significant countdown milestones to reduce console spam
          if (newValue === 0) {
            console.log('⏰ OTP resend cooldown completed');
          } else if (newValue % 10 === 0) {
            console.log(`⏳ OTP resend available in ${newValue}s`);
          }
          return newValue;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [resendCooldown, isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setOtp('');
      setError('');
      setAttempts(0);
      setResendCooldown(0);
      setIsProcessing(false);
      setIsVerifying(false);
      console.log('🔓 OTP verification modal opened');
    } else {
      // Clear countdown when modal closes to prevent background timers
      setResendCooldown(0);
      setIsProcessing(false);
      setIsVerifying(false);
      console.log('🔒 OTP verification modal closed');
    }
  }, [isOpen]);

  const handleOTPComplete = async (otpValue: string) => {
    if (isVerifying || isProcessing) {
      console.log('⚠️ OTP verification already in progress, skipping...');
      return;
    }

    setOtp(otpValue);
    setError('');
    setIsVerifying(true);
    setIsProcessing(true);

    try {
      console.log('🔍 Starting OTP verification...', {
        userId,
        otp: otpValue,
        type: verificationType
      });

      const response = await api.post('/auth/verify-otp', {
        userId,
        otp: otpValue,
        type: verificationType
      });

      console.log('📋 OTP verification response:', response.data);

      if (response.data.success) {
        // Handle authentication success with user data and token
        const { user, token } = response.data.data;
        console.log('✅ OTP verification successful, completing authentication...');

        // Clear any running timers before completing authentication
        setResendCooldown(0);
        setError('');

        handleAuthSuccess(user, token);
        onVerificationSuccess();
      } else {
        throw new Error(response.data.message || 'Invalid OTP');
      }
    } catch (err: any) {
      console.error('❌ OTP verification error:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });

      setAttempts(prev => {
        const newAttempts = prev + 1;

        if (newAttempts >= maxAttempts) {
          setError('Maximum attempts reached. Please request a new code.');
          setResendCooldown(60);
          console.log('🚫 Maximum OTP attempts reached, starting 60s cooldown');
        } else {
          const errorMessage = err.response?.data?.message ||
                              err.response?.data?.errors?.[0]?.msg ||
                              'Invalid OTP. Please try again.';
          setError(errorMessage);
          console.log(`⚠️ OTP verification failed, ${maxAttempts - newAttempts} attempts remaining`);
        }

        return newAttempts;
      });
    } finally {
      setIsVerifying(false);
      setIsProcessing(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError('');
    setAttempts(0);

    try {
      console.log('📤 Resending OTP...');
      const response = await api.post('/auth/resend-otp', {
        userId,
        type: verificationType,
        email,
        phoneNumber
      });

      if (response.data.success) {
        setResendCooldown(60);
        console.log('✅ OTP resent successfully, starting 60s cooldown');
      } else {
        throw new Error(response.data.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      console.error('❌ Resend OTP error:', err.message);
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                {verificationType === 'email' ? (
                  <Mail className="h-5 w-5 text-white" />
                ) : (
                  <MessageSquare className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Verify Your {verificationType === 'email' ? 'Email' : 'Phone'}
                </h3>
                <p className="text-sm text-gray-400">
                  Enter the verification code
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <p className="text-sm text-gray-300 text-center">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-sm font-medium text-white text-center mt-1">
              {verificationType === 'email' ? email : phoneNumber}
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <OTPInput
              length={6}
              onComplete={handleOTPComplete}
              onResend={handleResendOTP}
              isLoading={isVerifying || isResending}
              error={error}
              resendCooldown={resendCooldown}
            />
          </div>

          {/* Security Notice */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-6">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-300">
                  For your security, this code will expire in 10 minutes.
                  {attempts > 0 && (
                    <span className="block mt-1 text-yellow-400">
                      Attempts remaining: {maxAttempts - attempts}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              disabled={isVerifying || isResending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (otp.length === 6) {
                  handleOTPComplete(otp);
                }
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={otp.length !== 6 || isVerifying || isResending}
              isLoading={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OTPVerificationModal;
