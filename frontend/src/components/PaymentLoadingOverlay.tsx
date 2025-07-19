import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Shield, CreditCard, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface PaymentLoadingOverlayProps {
  isVisible: boolean;
  status: 'processing' | 'verifying' | 'success' | 'error' | 'cancelled';
  message?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onClose?: () => void;
  estimatedTime?: number; // in seconds
}

const PaymentLoadingOverlay: React.FC<PaymentLoadingOverlayProps> = ({
  isVisible,
  status,
  message,
  errorMessage,
  onRetry,
  onClose,
  estimatedTime = 30
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // Timer for elapsed time and warnings
  useEffect(() => {
    if (!isVisible || status !== 'processing') {
      setTimeElapsed(0);
      setShowWarning(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        // Show warning after 20 seconds
        if (newTime >= 20) {
          setShowWarning(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, status]);

  // Prevent page navigation during payment
  useEffect(() => {
    if (!isVisible || status === 'success' || status === 'error' || status === 'cancelled') {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Payment is in progress. Are you sure you want to leave?';
      return 'Payment is in progress. Are you sure you want to leave?';
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (window.confirm('Payment is in progress. Are you sure you want to navigate away?')) {
        return;
      }
      window.history.pushState(null, '', window.location.href);
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    // Push current state to prevent back navigation
    window.history.pushState(null, '', window.location.href);

    // Disable body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, status]);

  const getStatusConfig = () => {
    switch (status) {
      case 'processing':
        return {
          icon: <Loader2 className="h-12 w-12 text-white animate-spin" />,
          title: 'Payment in Progress',
          subtitle: message || 'Please wait while we process your payment...',
          bgColor: 'bg-black',
          showProgress: true
        };
      case 'verifying':
        return {
          icon: <Shield className="h-12 w-12 text-blue-400 animate-pulse" />,
          title: 'Verifying Payment',
          subtitle: 'Confirming your transaction with the bank...',
          bgColor: 'bg-black',
          showProgress: true
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-12 w-12 text-green-400" />,
          title: 'Payment Successful!',
          subtitle: 'Your transaction has been completed successfully.',
          bgColor: 'bg-green-900',
          showProgress: false
        };
      case 'error':
        return {
          icon: <XCircle className="h-12 w-12 text-red-400" />,
          title: 'Payment Failed',
          subtitle: errorMessage || 'There was an issue processing your payment.',
          bgColor: 'bg-red-900',
          showProgress: false
        };
      case 'cancelled':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-yellow-400" />,
          title: 'Payment Cancelled',
          subtitle: 'You have cancelled the payment process.',
          bgColor: 'bg-yellow-900',
          showProgress: false
        };
      default:
        return {
          icon: <Loader2 className="h-12 w-12 text-white animate-spin" />,
          title: 'Processing...',
          subtitle: 'Please wait...',
          bgColor: 'bg-black',
          showProgress: true
        };
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  const config = getStatusConfig();

  const overlayContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
      
      {/* Content */}
      <div className={`relative ${config.bgColor} border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl`}>
        {/* ProjectBuzz Logo */}
        <div className="text-center mb-6">
          <h3 className="text-white text-lg font-semibold">ProjectBuzz</h3>
          <div className="w-12 h-0.5 bg-white mx-auto mt-2"></div>
        </div>

        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {config.icon}
        </div>

        {/* Status Text */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{config.title}</h2>
          <p className="text-gray-300 leading-relaxed">{config.subtitle}</p>
        </div>

        {/* Progress Information */}
        {config.showProgress && (
          <div className="space-y-4 mb-6">
            {/* Important Instructions */}
            <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p className="font-medium text-yellow-400 mb-1">Important:</p>
                  <p>Do not close this page or navigate away during payment processing.</p>
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>Time elapsed:</span>
              <span className="font-mono">{formatTime(timeElapsed)}</span>
            </div>

            {/* Estimated time */}
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>Estimated time:</span>
              <span>~{estimatedTime}s</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${Math.min((timeElapsed / estimatedTime) * 100, 100)}%` 
                }}
              />
            </div>

            {/* Warning message for long processing */}
            {showWarning && (
              <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3">
                <p className="text-yellow-300 text-sm">
                  Payment is taking longer than usual. Please continue to wait...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          {status === 'error' && onRetry && (
            <button
              onClick={onRetry}
              className="w-full bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Try Again
            </button>
          )}
          
          {(status === 'success' || status === 'error' || status === 'cancelled') && onClose && (
            <button
              onClick={onClose}
              className="w-full bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              {status === 'success' ? 'Continue' : 'Close'}
            </button>
          )}
        </div>

        {/* Security Badge */}
        {config.showProgress && (
          <div className="flex items-center justify-center mt-6 text-xs text-gray-500">
            <Shield className="h-3 w-3 mr-1" />
            <span>Secured by Razorpay</span>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
};

export default PaymentLoadingOverlay;
