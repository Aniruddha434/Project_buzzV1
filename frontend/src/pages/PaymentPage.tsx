import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Shield, CreditCard, CheckCircle, AlertCircle, Loader, Tag, User, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import paymentService from '../services/paymentService';
import api from '../api';

interface Project {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  seller: {
    _id: string;
    displayName: string;
  };
  tags: string[];
  createdAt: string;
}

const PaymentPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);

  // Get return URL from query params
  const returnUrl = searchParams.get('returnUrl') || '/';
  const source = searchParams.get('source') || 'unknown';

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError('Project ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/projects/${projectId}`);
        if (response.data.success) {
          setProject(response.data.data);
        } else {
          setError('Project not found');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate(`/login?redirect=/payment/${projectId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    }
  }, [user, loading, navigate, projectId, searchParams]);

  // Calculate final price
  const finalPrice = project ? Math.max(0, project.price - discountAmount) : 0;

  // Handle payment
  const handlePayment = async () => {
    if (!project || !user) return;

    if (!customerPhone.trim()) {
      setError('Phone number is required');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Set up payment callbacks
      paymentService.onPaymentSuccess = (orderId: string) => {
        console.log('✅ Payment successful:', orderId);
        setSuccess(true);
        setProcessing(false);
        
        // Redirect after success
        setTimeout(() => {
          navigate(returnUrl);
        }, 2000);
      };

      paymentService.onPaymentError = (error: string) => {
        console.error('❌ Payment failed:', error);
        setError(error || 'Payment failed. Please try again.');
        setProcessing(false);
      };

      // Create payment order
      const orderResponse = await paymentService.createOrder(
        project._id,
        customerPhone.trim(),
        discountCode.trim() || null
      );

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create payment order');
      }

      // Initiate payment
      await paymentService.initiateRazorpayPayment({
        razorpayOrderId: orderResponse.data.razorpayOrderId,
        razorpayKeyId: orderResponse.data.razorpayKeyId,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency || 'INR',
        customerDetails: {
          name: user.displayName || user.email,
          email: user.email,
          phone: customerPhone.trim()
        }
      });

    } catch (error: any) {
      console.error('❌ Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  // Apply discount code - using real backend validation
  const applyDiscount = async () => {
    if (!discountCode.trim() || !project) return;

    try {
      setError(''); // Clear previous errors

      console.log('🔄 Validating discount code:', discountCode.trim());

      // Call backend API to validate discount code
      const response = await api.post('/negotiations/validate-code', {
        code: discountCode.trim(),
        projectId: project._id
      });

      if (response.data.success && response.data.valid) {
        const { discountAmount, finalPrice, originalPrice } = response.data;

        console.log('✅ Discount code valid:', {
          discountAmount,
          finalPrice,
          originalPrice
        });

        setDiscountAmount(discountAmount);
        setDiscountApplied(true);
        setError(''); // Clear any errors

        // Show success message briefly
        const successMessage = `Discount applied! You save ₹${discountAmount}`;
        console.log(successMessage);

      } else {
        console.log('❌ Invalid discount code:', response.data.message);
        setError(response.data.message || 'Invalid discount code');
        setDiscountAmount(0);
        setDiscountApplied(false);
      }
    } catch (error) {
      console.error('❌ Error validating discount code:', error);
      const errorMessage = error.response?.data?.message || 'Failed to validate discount code';
      setError(errorMessage);
      setDiscountAmount(0);
      setDiscountApplied(false);
    }
  };

  // Handle discount code input change
  const handleDiscountCodeChange = (value: string) => {
    setDiscountCode(value);
    // Clear applied discount when user changes the code
    if (discountApplied && value.trim() !== discountCode.trim()) {
      setDiscountAmount(0);
      setDiscountApplied(false);
      setError('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="h-6 w-6 text-white animate-spin" />
          <span className="text-white">Loading payment details...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">Project Not Found</h1>
          <p className="text-gray-400 mb-4">{error || 'The requested project could not be found.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-100 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-gray-400 mb-4">Your purchase of "{project.title}" is complete.</p>
          <p className="text-sm text-gray-500">Redirecting you back...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(returnUrl)}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-xl font-semibold text-white">Secure Checkout</h1>
            <div className="flex items-center text-green-400">
              <Shield className="h-5 w-5 mr-2" />
              <span className="text-sm">Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Details */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
              
              <div className="flex space-x-4">
                {project.images && project.images.length > 0 && (
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-white">{project.title}</h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{project.description}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded">
                      {project.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-800 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Project Price</span>
                  <span className="text-white">₹{project.price}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Discount</span>
                    <span className="text-green-400">-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t border-gray-800 pt-2">
                  <span className="text-white">Total</span>
                  <span className="text-white">₹{finalPrice}</span>
                </div>
              </div>
            </div>

            {/* Source Information */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500">
                Purchasing from: <span className="text-gray-400">{source}</span>
              </p>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Details
              </h2>

              <div className="space-y-4">
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Discount Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Discount Code (Optional)
                  </label>

                  {/* Welcome Code Suggestion */}
                  {!discountApplied && user && (
                    <div className="mb-3 p-3 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-700/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-yellow-400 mr-2">🎁</span>
                          <div>
                            <p className="text-yellow-300 text-sm font-medium">First-time buyer?</p>
                            <p className="text-yellow-400/80 text-xs">Try code WELCOME20 for 20% off!</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setDiscountCode('WELCOME20');
                            handleDiscountCodeChange('WELCOME20');
                          }}
                          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium rounded transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => handleDiscountCodeChange(e.target.value)}
                      placeholder="Enter discount code (e.g., WELCOME20, NEGO-ABC123)"
                      className={`flex-1 px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${
                        discountApplied
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                          : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                    />
                    <button
                      onClick={applyDiscount}
                      disabled={!discountCode.trim() || discountApplied}
                      className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                        discountApplied
                          ? 'bg-green-600 text-white cursor-default'
                          : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white'
                      }`}
                    >
                      {discountApplied ? '✓ Applied' : 'Apply'}
                    </button>
                  </div>

                  {/* Success Message */}
                  {discountApplied && discountAmount > 0 && (
                    <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
                      <p className="text-green-400 text-sm">
                        ✅ Discount applied! You save ₹{discountAmount}
                      </p>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={processing || !customerPhone.trim()}
                  className="w-full py-3 bg-black hover:bg-gray-900 text-white font-medium rounded-lg border border-gray-600 hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {processing ? (
                    <>
                      <Loader className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Pay ₹{finalPrice}
                    </>
                  )}
                </button>

                {/* Security Notice */}
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    🔒 Your payment is secured by Razorpay
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
