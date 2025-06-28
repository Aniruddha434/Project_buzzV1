import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CreditCard, Shield, Clock, AlertCircle, Lock, CheckCircle, Truck, Award, Star, Package } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import Badge from './ui/Badge';
import paymentService from '../services/paymentService';

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
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen: isOpenProp,
  onClose: onCloseProp,
  project,
  onPaymentSuccess,
  onPaymentError,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(isOpenProp || false);

  const onClose = () => {
    setIsOpen(false);
    onCloseProp?.();
  };

  // Update isOpen when prop changes
  useEffect(() => {
    if (isOpenProp !== undefined) {
      setIsOpen(isOpenProp);
    }
  }, [isOpenProp]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [existingPayment, setExistingPayment] = useState<any>(null);
  const [showExistingPaymentDialog, setShowExistingPaymentDialog] = useState(false);

  // Reset state when modal opens/closes and manage body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      setCustomerPhone('');
      setDiscountCode('');
      setDiscountAmount(0);
      setDiscountError('');
      setIsApplyingDiscount(false);
      setIsProcessing(false);
      setCurrentOrder(null);
      setPaymentStatus('');
      setError('');
      setExistingPayment(null);
      setShowExistingPaymentDialog(false);
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Handle discount code application
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    try {
      setIsApplyingDiscount(true);
      setDiscountError('');

      // Mock discount validation - replace with actual API call
      const validCodes = {
        'SAVE10': 10,
        'WELCOME20': 20,
        'STUDENT15': 15,
        'FIRST25': 25
      };

      const discount = validCodes[discountCode.toUpperCase() as keyof typeof validCodes];

      if (discount) {
        const discountValue = Math.round((project.price * discount) / 100);
        setDiscountAmount(discountValue);
        setDiscountError('');
      } else {
        setDiscountError('Invalid discount code');
        setDiscountAmount(0);
      }
    } catch (error) {
      setDiscountError('Failed to apply discount code');
      setDiscountAmount(0);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  // Handle payment initiation
  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError('');

      // Validate phone number - now mandatory
      if (!customerPhone || customerPhone.trim() === '') {
        throw new Error('Mobile number is required for payment notifications and order updates');
      }

      // Remove any non-digit characters
      const cleanPhone = customerPhone.replace(/\D/g, '');

      // Check if it's a valid 10-digit Indian mobile number
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        throw new Error('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
      }

      // Update the phone number to the cleaned version
      setCustomerPhone(cleanPhone);

      // Create payment order
      const orderResponse = await paymentService.createOrder(project._id, customerPhone, false, null);

      // Handle existing payment scenario
      if (!orderResponse.success && orderResponse.isExistingPayment) {
        console.log('📋 Existing payment found, showing dialog');
        setExistingPayment(orderResponse.data);
        setShowExistingPaymentDialog(true);
        setIsProcessing(false);
        return;
      }

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create payment order');
      }

      const orderData = orderResponse.data;
      setCurrentOrder(orderData);
      setPaymentStatus('ACTIVE');

      // Initiate Razorpay payment
      await paymentService.initiateRazorpayPayment({
        razorpayOrderId: orderData.razorpayOrderId,
        razorpayKeyId: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        customerDetails: orderData.customerDetails
      });

      // The payment will redirect to success/failure page
      // We'll handle the verification there

    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Payment failed';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle existing payment - resume payment
  const handleResumeExistingPayment = async () => {
    if (!existingPayment) return;

    try {
      setIsProcessing(true);
      setShowExistingPaymentDialog(false);

      // Set the existing payment as current order
      setCurrentOrder({
        orderId: existingPayment.orderId,
        razorpayOrderId: existingPayment.razorpayOrderId,
        amount: project.price,
        currency: 'INR'
      });
      setPaymentStatus(existingPayment.status);

      // Initiate Razorpay payment with existing order
      await paymentService.initiateRazorpayPayment({
        razorpayOrderId: existingPayment.razorpayOrderId,
        razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: project.price,
        currency: 'INR',
        customerDetails: {
          customerName: existingPayment.customerName,
          customerEmail: existingPayment.customerEmail,
          customerPhone: existingPayment.customerPhone
        }
      });

    } catch (error: any) {
      console.error('Error resuming payment:', error);
      setError(error.message || 'Failed to resume payment');
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

      // Create new payment order
      const orderResponse = await paymentService.createOrder(project._id, customerPhone);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create payment order');
      }

      const orderData = orderResponse.data;
      setCurrentOrder(orderData);
      setPaymentStatus('ACTIVE');

      // Initiate Razorpay payment
      await paymentService.initiateRazorpayPayment({
        razorpayOrderId: orderData.razorpayOrderId,
        razorpayKeyId: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        customerDetails: orderData.customerDetails
      });

    } catch (error: any) {
      console.error('Error creating new payment:', error);
      setError(error.message || 'Failed to create new payment');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle order status check
  const checkOrderStatus = async () => {
    if (!currentOrder) return;

    try {
      const statusResponse = await paymentService.getOrderStatus(currentOrder.orderId);
      if (statusResponse.success) {
        const newStatus = statusResponse.data.status;
        setPaymentStatus(newStatus);

        if (paymentService.isPaymentSuccessful(newStatus)) {
          onPaymentSuccess(currentOrder.orderId);
          onClose();
        } else if (paymentService.isPaymentFailed(newStatus)) {
          setError('Payment failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Error checking order status:', error);
    }
  };

  // Render trigger if provided
  if (trigger) {
    return (
      <>
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="cursor-pointer"
        >
          {trigger}
        </div>
        {isOpen && (
          <PaymentModalContent
            isOpen={isOpen}
            onClose={onClose}
            project={project}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            discountCode={discountCode}
            setDiscountCode={setDiscountCode}
            discountAmount={discountAmount}
            setDiscountAmount={setDiscountAmount}
            discountError={discountError}
            setDiscountError={setDiscountError}
            isApplyingDiscount={isApplyingDiscount}
            setIsApplyingDiscount={setIsApplyingDiscount}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            currentOrder={currentOrder}
            setCurrentOrder={setCurrentOrder}
            paymentStatus={paymentStatus}
            setPaymentStatus={setPaymentStatus}
            error={error}
            setError={setError}
            existingPayment={existingPayment}
            setExistingPayment={setExistingPayment}
            showExistingPaymentDialog={showExistingPaymentDialog}
            setShowExistingPaymentDialog={setShowExistingPaymentDialog}
            handlePayment={handlePayment}
            handleResumeExistingPayment={handleResumeExistingPayment}
            handleCancelAndCreateNew={handleCancelAndCreateNew}
            checkOrderStatus={checkOrderStatus}
            handleApplyDiscount={handleApplyDiscount}
          />
        )}
      </>
    );
  }

  if (!isOpen) return null;

  // Existing Payment Dialog
  if (showExistingPaymentDialog && existingPayment) {
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
              {existingPayment.expiryTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(existingPayment.expiryTime).toLocaleString()}
                  </span>
                </div>
              )}
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

    // Use portal to render existing payment dialog at document body level
    return createPortal(existingPaymentContent, document.body);
  }

  return <PaymentModalContent
    isOpen={isOpen}
    onClose={onClose}
    project={project}
    onPaymentSuccess={onPaymentSuccess}
    onPaymentError={onPaymentError}
    customerPhone={customerPhone}
    setCustomerPhone={setCustomerPhone}
    discountCode={discountCode}
    setDiscountCode={setDiscountCode}
    discountAmount={discountAmount}
    setDiscountAmount={setDiscountAmount}
    discountError={discountError}
    setDiscountError={setDiscountError}
    isApplyingDiscount={isApplyingDiscount}
    setIsApplyingDiscount={setIsApplyingDiscount}
    isProcessing={isProcessing}
    setIsProcessing={setIsProcessing}
    currentOrder={currentOrder}
    setCurrentOrder={setCurrentOrder}
    paymentStatus={paymentStatus}
    setPaymentStatus={setPaymentStatus}
    error={error}
    setError={setError}
    existingPayment={existingPayment}
    setExistingPayment={setExistingPayment}
    showExistingPaymentDialog={showExistingPaymentDialog}
    setShowExistingPaymentDialog={setShowExistingPaymentDialog}
    handlePayment={handlePayment}
    handleResumeExistingPayment={handleResumeExistingPayment}
    handleCancelAndCreateNew={handleCancelAndCreateNew}
    checkOrderStatus={checkOrderStatus}
    handleApplyDiscount={handleApplyDiscount}
  />;
};

// Separate component for the modal content
interface PaymentModalContentProps {
  isOpen: boolean;
  onClose: () => void;
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
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  discountAmount: number;
  setDiscountAmount: (amount: number) => void;
  discountError: string;
  setDiscountError: (error: string) => void;
  isApplyingDiscount: boolean;
  setIsApplyingDiscount: (applying: boolean) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  currentOrder: any;
  setCurrentOrder: (order: any) => void;
  paymentStatus: string;
  setPaymentStatus: (status: string) => void;
  error: string;
  setError: (error: string) => void;
  existingPayment: any;
  setExistingPayment: (payment: any) => void;
  showExistingPaymentDialog: boolean;
  setShowExistingPaymentDialog: (show: boolean) => void;
  handlePayment: () => Promise<void>;
  handleResumeExistingPayment: () => Promise<void>;
  handleCancelAndCreateNew: () => Promise<void>;
  checkOrderStatus: () => Promise<void>;
  handleApplyDiscount: () => Promise<void>;
}

const PaymentModalContent: React.FC<PaymentModalContentProps> = ({
  isOpen,
  onClose,
  project,
  onPaymentSuccess,
  onPaymentError,
  customerPhone,
  setCustomerPhone,
  discountCode,
  setDiscountCode,
  discountAmount,
  setDiscountAmount,
  discountError,
  setDiscountError,
  isApplyingDiscount,
  setIsApplyingDiscount,
  isProcessing,
  setIsProcessing,
  currentOrder,
  setCurrentOrder,
  paymentStatus,
  setPaymentStatus,
  error,
  setError,
  existingPayment,
  setExistingPayment,
  showExistingPaymentDialog,
  setShowExistingPaymentDialog,
  handlePayment,
  handleResumeExistingPayment,
  handleCancelAndCreateNew,
  checkOrderStatus,
  handleApplyDiscount
}) => {
  if (!isOpen) return null;

  // Existing Payment Dialog
  if (showExistingPaymentDialog && existingPayment) {
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
              {existingPayment.expiryTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(existingPayment.expiryTime).toLocaleString()}
                  </span>
                </div>
              )}
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

    // Use portal to render existing payment dialog at document body level
    return createPortal(existingPaymentContent, document.body);
  }

  // Main payment modal content
  const mainPaymentContent = (
    <div className="modal-payment-backdrop bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="modal-payment-content w-full max-w-2xl bg-white dark:bg-black rounded-2xl shadow-2xl overflow-hidden my-8 mx-auto">
        {/* Header */}
        <div className="bg-black px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Lock className="h-5 w-5 text-white" />
              <h2 className="text-lg font-semibold text-white">Complete Purchase</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
              disabled={isProcessing}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Project Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Project Details
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                      {project.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      by {project.seller?.displayName || 'Unknown Seller'}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="default" className="capitalize bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {project.category}
                      </Badge>
                      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Digital Project
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      ₹{project.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            {!currentOrder && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    maxLength={10}
                    className="w-full"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for payment notifications and order updates
                  </p>
                </div>

                {/* Discount Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discount Code (Optional)
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Enter discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyDiscount}
                      disabled={isApplyingDiscount || !discountCode.trim()}
                      className="px-4"
                    >
                      {isApplyingDiscount ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                  {discountError && (
                    <p className="text-xs text-red-500 mt-1">{discountError}</p>
                  )}
                  {discountAmount > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Discount applied: ₹{discountAmount} off
                    </p>
                  )}
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Project price:</span>
                      <span className="text-gray-900 dark:text-white">
                        ₹{project.price.toLocaleString()}
                      </span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Discount ({discountCode}):</span>
                        <span className="text-green-600">
                          -₹{discountAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                      <div className="flex justify-between">
                        <span className="text-base font-semibold text-gray-900 dark:text-white">
                          Total:
                        </span>
                        <span className="text-base font-bold text-gray-900 dark:text-white">
                          ₹{(project.price - discountAmount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing || !customerPhone.trim()}
                  className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3"
                  leftIcon={<CreditCard className="h-5 w-5" />}
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${(project.price - discountAmount).toLocaleString()}`}
                </Button>

                {/* Payment Methods */}
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500 mb-2">
                    Secure payment powered by Razorpay
                  </p>
                  <div className="flex justify-center space-x-2 text-xs text-gray-400">
                    <span>UPI</span>
                    <span>•</span>
                    <span>Cards</span>
                    <span>•</span>
                    <span>Net Banking</span>
                    <span>•</span>
                    <span>Wallets</span>
                  </div>
                </div>
              </div>
            )}

            {/* Order Status */}
            {currentOrder && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Order Status:
                    </span>
                    <Badge variant={paymentService.getStatusColor(paymentStatus) as any}>
                      {paymentService.getStatusText(paymentStatus)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Order ID: {currentOrder.orderId}
                  </p>
                  {paymentStatus === 'ACTIVE' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={checkOrderStatus}
                      className="mt-3 w-full"
                    >
                      Check Status
                    </Button>
                  )}
                </div>

                {/* Expiry Warning */}
                {paymentStatus === 'ACTIVE' && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-400">
                        Payment session expires in 30 minutes
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Use portal to render main payment modal at document body level
  return createPortal(mainPaymentContent, document.body);
};

export default PaymentModal;
