import api from '../api.js';

const paymentService = {
  // Create payment order
  async createOrder(projectId, customerPhone = '', discountCode = null) {
    try {
      console.log('🔄 Creating payment order:', { projectId, customerPhone, discountCode });

      const requestData = {
        projectId,
        customerPhone
      };

      // Add discount code if provided
      if (discountCode) {
        requestData.discountCode = discountCode;
      }

      console.log('📤 Sending request to backend:', requestData);

      const response = await api.post('/payments/create-order', requestData);

      console.log('✅ Payment order created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating payment order:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      // Check if it's a "pending payment exists" error
      if (error.response?.status === 400 &&
          error.response?.data?.message?.includes('already have a pending payment')) {

        // Return the existing payment data with enhanced information
        const existingPaymentData = error.response.data.data;
        console.log('📋 Found existing payment order:', existingPaymentData);

        return {
          success: false,
          isExistingPayment: true,
          message: error.response.data.message,
          data: {
            ...existingPaymentData,
            timeRemainingMinutes: existingPaymentData.timeRemainingMinutes || 0,
            canCancel: existingPaymentData.canCancel || false
          }
        };
      }

      // Check for validation errors
      if (error.response?.status === 400 && error.response?.data?.errors) {
        console.error('❌ Validation errors:', error.response.data.errors);
        const validationError = error.response.data.errors[0];
        throw new Error(validationError.msg || validationError.message || 'Validation failed');
      }

      // Check for specific error messages
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  },

  // Get order status
  async getOrderStatus(orderId) {
    try {
      const response = await api.get(`/payments/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order status:', error);
      throw error;
    }
  },

  // Cancel existing payment order
  async cancelOrder(orderId) {
    try {
      const response = await api.post(`/payments/cancel/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling payment order:', error);
      throw error;
    }
  },

  // Verify payment by order ID (GET method)
  async verifyPayment(orderId) {
    try {
      const response = await api.get(`/payments/verify/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  // Cancel pending payment for a project
  async cancelPendingPayment(projectId) {
    try {
      console.log('🔄 Cancelling pending payment for project:', projectId);

      const response = await api.post('/payments/cancel-pending', {
        projectId
      });

      console.log('✅ Pending payment cancelled successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error cancelling pending payment:', error);
      throw error;
    }
  },

  // Get user payment history
  async getPaymentHistory(params = {}) {
    try {
      const { status, page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (status) {
        queryParams.append('status', status);
      }

      const response = await api.get(`/payments/user?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },

  // Initialize Razorpay checkout
  async initiateRazorpayPayment(paymentData) {
    try {
      const { razorpayOrderId, razorpayKeyId, amount, currency, customerDetails } = paymentData;

      // Debug logging
      console.log('Payment data received:', paymentData);
      console.log('Razorpay Order ID:', razorpayOrderId);

      // Check if we're using mock keys for development
      const isMockPayment = razorpayKeyId === 'rzp_test_mock_development' ||
                           razorpayOrderId?.includes('mock');

      if (isMockPayment) {
        console.log('🧪 Mock payment detected - simulating payment success');
        // Simulate payment success after a short delay
        setTimeout(async () => {
          const mockResponse = {
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_order_id: razorpayOrderId,
            razorpay_signature: 'mock_signature_for_development'
          };
          console.log('✅ Mock payment successful:', mockResponse);

          // For mock payments, skip verification and directly mark as successful
          try {
            console.log('🧪 Mock payment - skipping verification, marking as successful');

            // Call success callback directly for mock payments
            if (this.onPaymentSuccess) {
              this.onPaymentSuccess(razorpayOrderId);
            }

            // Show success message
            console.log('✅ Mock payment completed successfully');
          } catch (error) {
            console.error('❌ Mock payment error:', error);
            if (this.onPaymentError) {
              this.onPaymentError('Mock payment failed');
            }
          }
        }, 1000);
        return { success: true, mock: true };
      }

      // For real payments, proceed with actual Razorpay integration
      console.log('💳 Real payment detected - opening Razorpay checkout');

      // Load Razorpay SDK if not already loaded
      if (!window.Razorpay) {
        await this.loadRazorpaySDK();
      }

      // Validate required fields
      if (!razorpayOrderId) {
        throw new Error('Razorpay order ID is missing.');
      }

      if (!razorpayKeyId) {
        throw new Error('Razorpay key ID is missing.');
      }

      // Validate Razorpay SDK is properly loaded
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not properly loaded');
      }

      // Create Razorpay checkout options
      const options = {
        key: razorpayKeyId,
        amount: amount * 100, // Convert to paise
        currency: currency || 'INR',
        name: 'ProjectBuzz',
        description: 'Project Purchase',
        order_id: razorpayOrderId,
        prefill: {
          name: customerDetails?.customerName || '',
          email: customerDetails?.customerEmail || '',
          contact: customerDetails?.customerPhone || ''
        },
        theme: {
          color: '#000000'
        },
        handler: (response) => {
          console.log('✅ Razorpay payment successful:', response);
          this.handleRazorpaySuccess(response);
        },
        modal: {
          ondismiss: () => {
            console.log('❌ Razorpay payment cancelled by user');
            this.handleRazorpayFailure('Payment cancelled by user');
          }
        }
      };

      console.log('Opening Razorpay checkout with options:', options);

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();

      console.log('✅ Razorpay checkout opened successfully');
      return { success: true };
    } catch (error) {
      console.error('Error initiating Razorpay payment:', error);
      throw error;
    }
  },

  // Load Razorpay SDK dynamically
  loadRazorpaySDK() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.Razorpay) {
        console.log('Razorpay SDK already loaded');
        resolve();
        return;
      }

      // Remove any existing Razorpay script to avoid conflicts
      const existingScript = document.querySelector('script[src*="razorpay"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Create script element
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      script.onload = () => {
        if (window.Razorpay) {
          console.log('✅ Razorpay SDK loaded successfully');
          resolve();
        } else {
          console.error('❌ Razorpay SDK loaded but not properly initialized');
          reject(new Error('Razorpay SDK not properly initialized'));
        }
      };

      script.onerror = (error) => {
        console.error('❌ Failed to load Razorpay SDK:', error);
        reject(new Error('Failed to load Razorpay SDK'));
      };

      // Add to document head
      document.head.appendChild(script);
    });
  },

  // Handle Razorpay payment success
  async handleRazorpaySuccess(response) {
    try {
      console.log('Processing Razorpay payment success:', response);

      // Verify payment signature with backend
      const verificationResult = await this.verifyPaymentSignature({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      });

      if (verificationResult.success) {
        console.log('✅ Payment verified successfully');
        // Redirect to success page or show success message
        window.location.href = `/payment/success?order_id=${verificationResult.data.orderId}`;
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Error handling payment success:', error);
      this.handleRazorpayFailure(error.message);
    }
  },

  // Handle Razorpay payment failure
  handleRazorpayFailure(error) {
    console.error('Razorpay payment failed:', error);
    alert(`Payment failed: ${error}`);
    // You can redirect to failure page or show error message
  },

  // Verify payment with Razorpay (POST method)
  async verifyPaymentSignature(paymentData) {
    try {
      const response = await api.post('/payments/verify-payment', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  // Handle payment success callback
  handlePaymentSuccess(orderId) {
    // This can be called from the success page
    return this.getOrderStatus(orderId);
  },

  // Handle payment failure
  handlePaymentFailure(orderId, error) {
    console.error('Payment failed for order:', orderId, error);
    // You can add additional error handling here
    return {
      success: false,
      orderId,
      error: error.message || 'Payment failed'
    };
  },

  // Format currency for display
  formatCurrency(amount, currency = 'INR') {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });
    return formatter.format(amount);
  },

  // Validate payment amount
  validateAmount(amount) {
    const minAmount = 1;
    const maxAmount = 500000;

    if (!amount || isNaN(amount)) {
      throw new Error('Invalid amount');
    }

    if (amount < minAmount) {
      throw new Error(`Minimum amount is ₹${minAmount}`);
    }

    if (amount > maxAmount) {
      throw new Error(`Maximum amount is ₹${maxAmount}`);
    }

    return true;
  },

  // Get payment status display text
  getStatusText(status) {
    const normalizedStatus = status?.toUpperCase();
    const statusMap = {
      'PENDING': 'Pending',
      'ACTIVE': 'Processing',
      'PAID': 'Completed',
      'EXPIRED': 'Expired',
      'CANCELLED': 'Cancelled',
      'FAILED': 'Failed'
    };
    return statusMap[normalizedStatus] || status || 'Unknown';
  },

  // Get payment status color for UI
  getStatusColor(status) {
    const normalizedStatus = status?.toUpperCase();
    const colorMap = {
      'PENDING': 'warning',
      'ACTIVE': 'info',
      'PAID': 'success',
      'EXPIRED': 'secondary',
      'CANCELLED': 'error',
      'FAILED': 'error'
    };
    return colorMap[normalizedStatus] || 'secondary';
  },

  // Check if payment is successful
  isPaymentSuccessful(status) {
    return status === 'PAID';
  },

  // Check if payment is pending
  isPaymentPending(status) {
    return ['PENDING', 'ACTIVE'].includes(status);
  },

  // Check if payment has failed
  isPaymentFailed(status) {
    return ['FAILED', 'EXPIRED', 'CANCELLED'].includes(status);
  },

  // Validate discount code
  async validateDiscountCode(discountCode, projectId) {
    try {
      console.log('🔄 Validating discount code:', { discountCode, projectId });

      const response = await api.post('/negotiations/validate-code', {
        discountCode,
        projectId
      });

      console.log('✅ Discount code validation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error validating discount code:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to validate discount code',
        data: { isValid: false, discountAmount: 0 }
      };
    }
  }
};

export default paymentService;
