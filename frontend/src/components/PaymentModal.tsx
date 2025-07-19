import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, AlertCircle } from 'lucide-react';
import Button from './ui/Button';
import Badge from './ui/Badge';
import paymentService from '../services/paymentService';
import PaymentLoadingOverlay from './PaymentLoadingOverlay';

interface PaymentModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  project: {
    _id: string;
    title: string;
    price: number;
    seller: {
      displayName: string;
    };
  };
  onPaymentSuccess: (orderId: string) => void;
  onPaymentError: (error: string) => void;
  trigger?: React.ReactNode;
  phoneNumber?: string; // Accept phone number from parent component
  discountCode?: string; // Accept discount code from parent component
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  project,
  onPaymentSuccess,
  onPaymentError,
  trigger,
  phoneNumber
}) => {
  const [customerPhone, setCustomerPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [existingPayment, setExistingPayment] = useState<any>(null);
  const [showExistingPaymentDialog, setShowExistingPaymentDialog] = useState(false);

  // Payment loading overlay states
  const [paymentLoadingState, setPaymentLoadingState] = useState<{
    isVisible: boolean;
    status: 'processing' | 'verifying' | 'success' | 'error' | 'cancelled';
    message?: string;
    errorMessage?: string;
  }>({
    isVisible: false,
    status: 'processing'
  });

  // Reset state when modal opens/closes and manage body scroll
  useEffect(() => {
    if (showExistingPaymentDialog) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      setCustomerPhone('');
      setIsProcessing(false);
      setExistingPayment(null);
      setShowExistingPaymentDialog(false);
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showExistingPaymentDialog]);



  // Streamlined payment handler - directly opens Razorpay
  const handleDirectPayment = async () => {
    if (!customerPhone || !customerPhone.trim()) {
      console.error('Please enter your mobile number');
      return;
    }

    // Validate phone number
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setPaymentLoadingState({
        isVisible: true,
        status: 'error',
        errorMessage: 'Please enter a valid 10-digit mobile number'
      });
      return;
    }

    try {
      setIsProcessing(true);
      setPaymentLoadingState({
        isVisible: true,
        status: 'processing',
        message: 'Initializing payment...'
      });

      // Create payment order
      setPaymentLoadingState({
        isVisible: true,
        status: 'processing',
        message: 'Creating payment order...'
      });

      const orderResponse = await paymentService.createOrder(
        project._id,
        cleanPhone,
        null // No discount code for direct payment
      );

      // Handle existing payment scenario
      if (!orderResponse.success && orderResponse.isExistingPayment) {
        setExistingPayment(orderResponse.data);
        setShowExistingPaymentDialog(true);
        setPaymentLoadingState({ isVisible: false, status: 'processing' });
        setIsProcessing(false);
        return;
      }

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create payment order');
      }

      const orderData = orderResponse.data;

      // Update loading state before opening Razorpay
      setPaymentLoadingState({
        isVisible: true,
        status: 'processing',
        message: 'Opening payment gateway...'
      });

      // Open Razorpay checkout
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'ProjectBuzz',
        description: `Purchase: ${project.title}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          contact: cleanPhone
        },
        theme: {
          color: '#000000'
        },
        handler: async (response: any) => {
          console.log('Payment successful:', response);
          setPaymentLoadingState({
            isVisible: true,
            status: 'verifying',
            message: 'Verifying payment with bank...'
          });

          // Add a small delay to show verification state
          setTimeout(() => {
            setPaymentLoadingState({
              isVisible: true,
              status: 'success',
              message: 'Payment completed successfully!'
            });

            // Auto-close after 2 seconds and trigger success callback
            setTimeout(() => {
              setPaymentLoadingState({ isVisible: false, status: 'processing' });
              onPaymentSuccess(response.razorpay_order_id);
            }, 2000);
          }, 1500);
        },
        modal: {
          ondismiss: () => {
            console.log('Payment cancelled by user');
            setPaymentLoadingState({
              isVisible: true,
              status: 'cancelled',
              message: 'Payment was cancelled'
            });

            // Auto-close after 2 seconds
            setTimeout(() => {
              setPaymentLoadingState({ isVisible: false, status: 'processing' });
              setIsProcessing(false);
            }, 2000);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

      // Hide loading overlay when Razorpay modal opens
      setTimeout(() => {
        setPaymentLoadingState({ isVisible: false, status: 'processing' });
      }, 1000);

    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Payment failed';
      setPaymentLoadingState({
        isVisible: true,
        status: 'error',
        errorMessage: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle trigger click - directly initiate payment or show error
  const handleTriggerClick = async () => {
    // If phone number is provided from parent, directly initiate payment
    if (phoneNumber && phoneNumber.trim()) {
      setCustomerPhone(phoneNumber);
      await handleDirectPayment();
    } else {
      // No phone number provided - use error callback
      onPaymentError('Please enter your mobile number before proceeding with the purchase. You can find the mobile number field in the project details section above the Buy Now button.');
      return;
    }
  };

  // Handle existing payment - resume payment
  const handleResumeExistingPayment = async () => {
    if (!existingPayment) return;

    try {
      setIsProcessing(true);
      setShowExistingPaymentDialog(false);
      setPaymentLoadingState({
        isVisible: true,
        status: 'processing',
        message: 'Resuming existing payment...'
      });

      // Open Razorpay checkout with existing order
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: project.price * 100, // Convert to paise
        currency: 'INR',
        name: 'ProjectBuzz',
        description: `Purchase: ${project.title}`,
        order_id: existingPayment.razorpayOrderId,
        prefill: {
          name: existingPayment.customerName,
          email: existingPayment.customerEmail,
          contact: existingPayment.customerPhone
        },
        theme: {
          color: '#000000'
        },
        handler: async (response: any) => {
          console.log('Payment successful:', response);
          setPaymentLoadingState({
            isVisible: true,
            status: 'verifying',
            message: 'Verifying payment with bank...'
          });

          setTimeout(() => {
            setPaymentLoadingState({
              isVisible: true,
              status: 'success',
              message: 'Payment completed successfully!'
            });

            setTimeout(() => {
              setPaymentLoadingState({ isVisible: false, status: 'processing' });
              onPaymentSuccess(response.razorpay_order_id);
            }, 2000);
          }, 1500);
        },
        modal: {
          ondismiss: () => {
            console.log('Payment cancelled by user');
            setPaymentLoadingState({
              isVisible: true,
              status: 'cancelled',
              message: 'Payment was cancelled'
            });

            setTimeout(() => {
              setPaymentLoadingState({ isVisible: false, status: 'processing' });
              setIsProcessing(false);
            }, 2000);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Error resuming payment:', error);
      setPaymentLoadingState({
        isVisible: true,
        status: 'error',
        errorMessage: error.message || 'Failed to resume payment'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle existing payment - cancel and create new
  const handleCancelAndCreateNew = async () => {
    if (!existingPayment) return;

    try {
      setIsProcessing(true);
      setShowExistingPaymentDialog(false);

      // Cancel existing payment
      await paymentService.cancelOrder(existingPayment.orderId);
      console.log('✅ Existing payment cancelled');

      // Reset existing payment and close dialog
      setExistingPayment(null);
      setShowExistingPaymentDialog(false);

    } catch (error: any) {
      console.error('Error cancelling payment:', error);
      onPaymentError(error.message || 'Failed to cancel existing payment');
    } finally {
      setIsProcessing(false);
    }
  };

  // Render existing payment dialog
  const renderExistingPaymentDialog = () => {
    if (!showExistingPaymentDialog || !existingPayment) return null;

    const existingPaymentContent = (
      <div className="modal-payment-backdrop bg-black/60 backdrop-blur-sm">
        <div className="modal-payment-content w-full max-w-md bg-white dark:bg-black rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" width="48" height="48" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Existing Payment Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You already have a pending payment for this project.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {existingPayment.orderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <Badge variant={paymentService.getStatusColor(existingPayment.status) as any}>
                  {paymentService.getStatusText(existingPayment.status)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(existingPayment.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleResumeExistingPayment}
              disabled={isProcessing}
              className="w-full"
              leftIcon={<CreditCard className="h-4 w-4" width="16" height="16" />}
            >
              {isProcessing ? 'Processing...' : 'Resume Payment'}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleCancelAndCreateNew}
              disabled={isProcessing}
              className="w-full"
            >
              Cancel & Create New
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShowExistingPaymentDialog(false)}
              disabled={isProcessing}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );

    return createPortal(existingPaymentContent, document.body);
  };

  // Render trigger element if provided
  if (trigger) {
    return (
      <>
        <div onClick={handleTriggerClick} style={{ cursor: 'pointer' }}>
          {trigger}
        </div>
        {showExistingPaymentDialog && renderExistingPaymentDialog()}
      </>
    );
  }





  // Payment loading overlay handlers
  const handlePaymentRetry = () => {
    setPaymentLoadingState({ isVisible: false, status: 'processing' });
    handleDirectPayment();
  };

  const handlePaymentClose = () => {
    setPaymentLoadingState({ isVisible: false, status: 'processing' });
    if (paymentLoadingState.status === 'error') {
      onPaymentError(paymentLoadingState.errorMessage || 'Payment failed');
    }
  };

  // Default modal rendering (when no trigger)
  if (showExistingPaymentDialog) {
    return (
      <>
        {renderExistingPaymentDialog()}
        <PaymentLoadingOverlay
          isVisible={paymentLoadingState.isVisible}
          status={paymentLoadingState.status}
          message={paymentLoadingState.message}
          errorMessage={paymentLoadingState.errorMessage}
          onRetry={handlePaymentRetry}
          onClose={handlePaymentClose}
          estimatedTime={30}
        />
      </>
    );
  }

  return (
    <PaymentLoadingOverlay
      isVisible={paymentLoadingState.isVisible}
      status={paymentLoadingState.status}
      message={paymentLoadingState.message}
      errorMessage={paymentLoadingState.errorMessage}
      onRetry={handlePaymentRetry}
      onClose={handlePaymentClose}
      estimatedTime={30}
    />
  );
};

export default PaymentModal;
