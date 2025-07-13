import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Github, ExternalLink, Eye, Calendar, Tag, User, ShoppingCart, CheckCircle, CreditCard, Shield, Lock, AlertCircle, Clock, Star, Download, FileText, Code, Zap, Target, BookOpen, Settings, Play } from 'lucide-react';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Input from './ui/Input';
import paymentService from '../services/paymentService';
import { projectService } from '../services/projectService';
import { getImageUrl } from '../utils/imageUtils';
import InlineError from './ui/InlineError';

interface ProjectImage {
  url: string;
  filename: string;
  originalName: string;
  isPrimary?: boolean;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags?: string[];
  githubRepo?: string;
  demoUrl?: string;
  images?: ProjectImage[];
  image?: ProjectImage;
  seller?: {
    displayName?: string;
    photoURL?: string;
  };
  stats?: {
    views: number;
    sales: number;
    downloads: number;
  };
  status: string;
  createdAt: string;
  // Enhanced project information fields
  completionStatus?: number;
  documentationFiles?: Array<{
    url: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    uploadedAt: string;
    fileType: 'readme' | 'technical' | 'specification';
    description?: string;
  }>;
  projectZipFile?: {
    url: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    uploadedAt: string;
    description?: string;
  };
  projectDetails?: {
    timeline?: string;
    techStack?: string;
    complexityLevel?: 'beginner' | 'intermediate' | 'advanced';
    installationInstructions?: string;
    usageInstructions?: string;
    prerequisites?: string;
  };
}

interface EnhancedProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onPaymentSuccess: (orderId: string) => void;
  onPaymentError: (error: string) => void;
  isPurchased?: boolean;
  user?: any;
}

const EnhancedProjectModal: React.FC<EnhancedProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onPaymentSuccess,
  onPaymentError,
  isPurchased = false,
  user
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [existingPayment, setExistingPayment] = useState<any>(null);
  const [showExistingPaymentDialog, setShowExistingPaymentDialog] = useState(false);
  const [useTestMode, setUseTestMode] = useState(false);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [roleError, setRoleError] = useState<string>('');
  const [downloadError, setDownloadError] = useState<string>('');

  // Reset state when modal opens/closes and manage body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      setShowCheckout(false);
      setCustomerPhone('');
      setIsProcessing(false);
      setCurrentOrder(null);
      setPaymentStatus('');
      setError('');
      setRoleError('');
      setDownloadError('');
      setSelectedImageIndex(0);
      setUseTestMode(false);
      setDiscountCode('');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Early return if project data is invalid
  if (!project || !project._id || !project.title) {
    console.warn('EnhancedProjectModal: Invalid project data received', project);
    const invalidDataContent = (
      <div className="modal-detail-backdrop bg-black/50 backdrop-blur-sm overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <X className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Invalid Project Data</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The project information could not be loaded properly.
              </p>
              <Button onClick={onClose} variant="primary">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
    return createPortal(invalidDataContent, document.body);
  }

  // Get all project images with properly processed URLs
  const getProjectImages = () => {
    const images = [];
    if (project.images && project.images.length > 0) {
      images.push(...project.images.map(img => ({
        ...img,
        url: getImageUrl(img.url)
      })));
    }
    if (project.image?.url && !images.some(img => img.url === getImageUrl(project.image?.url))) {
      images.push({
        ...project.image,
        url: getImageUrl(project.image.url)
      });
    }
    return images;
  };

  const images = getProjectImages();
  const currentImage = images[selectedImageIndex];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Handle payment initiation
  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError('');

      // Validate phone number if provided (more lenient validation)
      if (customerPhone && customerPhone.trim() !== '') {
        // Remove any non-digit characters
        const cleanPhone = customerPhone.replace(/\D/g, '');

        // Check if it's a valid 10-digit Indian mobile number
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
          throw new Error('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
        }

        // Update the phone number to the cleaned version
        setCustomerPhone(cleanPhone);
      }

      // Create payment order
      const orderResponse = await paymentService.createOrder(project._id, customerPhone, useTestMode, discountCode || null);

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
        customerDetails: orderData.customerDetails,
        testMode: useTestMode
      });

    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Payment failed';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyNowClick = () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (user.role !== 'buyer') {
      setRoleError('Only buyers can purchase projects. Please contact support if you need to change your role.');
      return;
    }
    setShowCheckout(true);
  };

  // Main modal content
  const modalContent = (
    <div className="modal-detail-backdrop bg-black/50 backdrop-blur-sm overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Projects</span>
              <span>›</span>
              <span className="capitalize">{project.category}</span>
              <span>›</span>
              <span className="text-gray-900 dark:text-white font-medium truncate max-w-xs">
                {project.title}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
            <div className={`grid gap-8 p-6 ${showCheckout ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'}`}>
              {/* Left Column - Images and Details */}
              <div className={showCheckout ? 'lg:col-span-1' : 'lg:col-span-2'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Images */}
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      {currentImage?.url ? (
                        <img
                          src={currentImage.url}
                          alt={project.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Eye className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">No preview available</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Image Thumbnails */}
                    {images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {images.slice(0, 4).map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                              index === selectedImageIndex
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={image.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Project Details */}
                  <div className="space-y-6">
                    {/* Title and Category */}
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="default" className="capitalize bg-blue-100 text-blue-800">
                          {project.category}
                        </Badge>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Digital Product
                        </Badge>
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                        {project.title}
                      </h1>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                            {project.seller?.displayName || 'Unknown Seller'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(project.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-baseline space-x-2 mb-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(project.price)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Digital download • Instant access
                      </div>
                    </div>

                    {/* Description Preview */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">About this project</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
                        {project.description}
                      </p>
                    </div>

                    {/* Technologies */}
                    {project.tags && project.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <Tag className="h-4 w-4 mr-2" />
                          Technologies
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.slice(0, 6).map((tag, index) => (
                            <Badge key={index} variant="default" size="sm" className="bg-blue-50 text-blue-700">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Project Completion Status */}
                    {project.completionStatus !== undefined && (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <Target className="h-4 w-4 mr-2" />
                          Completion Status
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{project.completionStatus}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.completionStatus}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {project.completionStatus === 100 ? 'Project completed' : 'Project in development'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Complexity Level */}
                    {project.projectDetails?.complexityLevel && (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <Zap className="h-4 w-4 mr-2" />
                          Complexity Level
                        </h3>
                        <Badge
                          variant="default"
                          className={`capitalize ${
                            project.projectDetails.complexityLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                            project.projectDetails.complexityLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {project.projectDetails.complexityLevel}
                        </Badge>
                      </div>
                    )}

                    {/* Stats - Hidden for buyers who purchased */}
                    {!isPurchased && (
                      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {project.stats?.views || 0}
                          </div>
                          <div className="text-xs text-gray-500">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {project.stats?.sales || 0}
                          </div>
                          <div className="text-xs text-gray-500">Sales</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {project.stats?.downloads || 0}
                          </div>
                          <div className="text-xs text-gray-500">Downloads</div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!showCheckout && (
                      <div className="space-y-3">
                        {user && user.role === 'buyer' ? (
                          isPurchased ? (
                            <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                              <span className="text-green-800 dark:text-green-400 font-medium">
                                You own this project
                              </span>
                            </div>
                          ) : (
                            <Button
                              variant="primary"
                              size="lg"
                              leftIcon={<ShoppingCart className="h-5 w-5" />}
                              onClick={handleBuyNowClick}
                              className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3"
                            >
                              Buy Now - {formatCurrency(project.price)}
                            </Button>
                          )
                        ) : (
                          <Button
                            variant="primary"
                            size="lg"
                            leftIcon={<ShoppingCart className="h-5 w-5" />}
                            onClick={() => window.location.href = '/login'}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                          >
                            {user ? 'Contact Seller' : 'Sign in to Buy'}
                          </Button>
                        )}

                        {/* Role Error Display */}
                        {roleError && (
                          <div className="mt-3">
                            <InlineError
                              message={roleError}
                              variant="warning"
                              dismissible
                              onDismiss={() => setRoleError('')}
                            />
                          </div>
                        )}

                        {/* Demo Link */}
                        {project.demoUrl && (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Button
                              variant="outline"
                              size="md"
                              leftIcon={<ExternalLink className="h-4 w-4" />}
                              className="w-full"
                            >
                              View Live Demo
                            </Button>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Checkout Section */}
              {showCheckout && (
                <div className="lg:col-span-1">
                  <div className="sticky top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg">
                    {/* Checkout Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                        <Lock className="h-5 w-5 mr-2 text-green-600" />
                        Secure Checkout
                      </h3>
                      <button
                        onClick={() => setShowCheckout(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Order Summary */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Order Summary</h4>
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                            {project.title}
                          </h5>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            by {project.seller?.displayName || 'Unknown Seller'}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="default" size="sm" className="bg-blue-100 text-blue-800">
                              {project.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(project.price)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-start">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                      </div>
                    )}

                    {/* Current Order Status */}
                    {currentOrder && (
                      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Order Status:</span>
                          <Badge variant={paymentService.getStatusColor(paymentStatus) as any}>
                            {paymentService.getStatusText(paymentStatus)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Order ID: {currentOrder.orderId}</p>
                        {paymentStatus === 'ACTIVE' && (
                          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                              <p className="text-xs text-yellow-800 dark:text-yellow-400">
                                Payment session expires in 30 minutes
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment Form */}
                    {!currentOrder && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Mobile Number (Optional)
                          </label>
                          <Input
                            type="tel"
                            placeholder="Enter 10-digit mobile number"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            maxLength={10}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            For payment notifications and order updates
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Discount Code (Optional)
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter discount code"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Apply a discount code if you have one
                          </p>
                        </div>

                        {/* Test Mode Toggle */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Test Mode
                            </label>
                            <p className="text-xs text-gray-500">
                              {useTestMode ? 'Simulate payment success' : 'Use real Razorpay checkout'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUseTestMode(!useTestMode)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              useTestMode ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                useTestMode ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Security Info */}
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Shield className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-400">Secure Payment</span>
                          </div>
                          <p className="text-xs text-green-700 dark:text-green-500">
                            Your payment is secured by Razorpay with 256-bit SSL encryption
                          </p>
                        </div>

                        {/* Payment Button */}
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={handlePayment}
                          disabled={isProcessing}
                          className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-4"
                          leftIcon={<CreditCard className="h-5 w-5" />}
                        >
                          {isProcessing ? 'Processing...' : `Pay ${formatCurrency(project.price)}`}
                        </Button>

                        {/* Payment Methods */}
                        <div className="text-center">
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

                    {/* Trust Indicators */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                          <span>SSL secured checkout</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                          <span>Instant access after payment</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                          <span>30-day money-back guarantee</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Full-width Description Section */}
            {!showCheckout && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 px-6">
                <div className="max-w-4xl">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Product Description
                  </h3>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap text-lg">
                      {project.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Comprehensive Project Details Section */}
            {!showCheckout && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 px-6">
                <div className="max-w-4xl">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                    Project Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Tech Stack */}
                    {project.projectDetails?.techStack && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                          <Code className="h-5 w-5 mr-2 text-blue-600" />
                          Technology Stack
                        </h4>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {project.projectDetails.techStack}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    {project.projectDetails?.timeline && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-green-600" />
                          Timeline
                        </h4>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {project.projectDetails.timeline}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Prerequisites */}
                    {project.projectDetails?.prerequisites && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                          <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                          Prerequisites
                        </h4>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {project.projectDetails.prerequisites}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Project Source Code */}
                    {project.projectZipFile && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                          <Download className="h-5 w-5 mr-2 text-green-600" />
                          Project Source Code
                        </h4>
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-3 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 rounded-lg">
                                <Download className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  Complete Project Files
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {project.projectZipFile.originalName} • {(project.projectZipFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                                  {project.projectZipFile.description || 'Source code and project assets'}
                                </p>
                              </div>
                            </div>
                            {isPurchased ? (
                              <button
                                onClick={async () => {
                                  try {
                                    await projectService.downloadProjectZip(project._id);
                                  } catch (error) {
                                    console.error('Download failed:', error);
                                    setDownloadError('Download failed. Please try again.');
                                  }
                                }}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                              >
                                <Download className="h-4 w-4" />
                                <span>Download</span>
                              </button>
                            ) : (
                              <div className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg font-medium flex items-center space-x-2">
                                <Lock className="h-4 w-4" />
                                <span>Purchase Required</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Documentation Files */}
                    {project.documentationFiles && project.documentationFiles.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-orange-600" />
                          Documentation
                        </h4>
                        <div className="space-y-2">
                          {project.documentationFiles.map((doc, index) => (
                            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-2 rounded-lg ${
                                    doc.fileType === 'readme' ? 'bg-blue-100 text-blue-600' :
                                    doc.fileType === 'technical' ? 'bg-green-100 text-green-600' :
                                    'bg-purple-100 text-purple-600'
                                  }`}>
                                    <FileText className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                      {doc.originalName}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                      {doc.fileType} • {(doc.size / 1024).toFixed(1)} KB
                                    </p>
                                    {doc.description && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {doc.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={async () => {
                                    try {
                                      await projectService.downloadDocumentationFile(doc.filename, doc.originalName);
                                    } catch (error: any) {
                                      console.error('Documentation download failed:', error);
                                      setDownloadError(`Failed to download ${doc.originalName}: ${error.message || 'Download failed'}`);
                                    }
                                  }}
                                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Download Error Display */}
                    {downloadError && (
                      <div className="mt-4">
                        <InlineError
                          message={downloadError}
                          variant="error"
                          dismissible
                          onDismiss={() => setDownloadError('')}
                        />
                      </div>
                    )}
                  </div>

                  {/* Installation and Usage Instructions */}
                  {(project.projectDetails?.installationInstructions || project.projectDetails?.usageInstructions) && (
                    <div className="mt-8 space-y-8">
                      {/* Installation Instructions */}
                      {project.projectDetails?.installationInstructions && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <Settings className="h-5 w-5 mr-2 text-blue-600" />
                            Installation Instructions
                          </h4>
                          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="prose prose-gray dark:prose-invert max-w-none">
                              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                                {project.projectDetails.installationInstructions}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Usage Instructions */}
                      {project.projectDetails?.usageInstructions && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <Play className="h-5 w-5 mr-2 text-green-600" />
                            Usage Instructions
                          </h4>
                          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="prose prose-gray dark:prose-invert max-w-none">
                              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                                {project.projectDetails.usageInstructions}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  return createPortal(modalContent, document.body);
};

export default EnhancedProjectModal;
