import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Download, ExternalLink, AlertCircle, Loader, Receipt, Calendar, CreditCard, Package, Star, Shield, ArrowRight, Copy, Check } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import paymentService from '../services/paymentService';
import projectService from '../services/projectService';

/**
 * PaymentSuccess Component - Black Suit Theme
 *
 * An elegant, professional payment receipt page with a sophisticated black theme.
 * Features:
 * - Gradient backgrounds and subtle borders
 * - Copy-to-clipboard functionality for order details
 * - Responsive grid layouts
 * - Professional typography and spacing
 * - Interactive hover effects and animations
 * - Status indicators with appropriate colors
 * - Clean, modern card-based design
 */
const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [projectData, setProjectData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [downloadError, setDownloadError] = useState('');

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) {
      setError('No order ID found in URL');
      setIsVerifying(false);
      return;
    }

    verifyPayment();
  }, [orderId]);

  const verifyPayment = async () => {
    try {
      setIsVerifying(true);
      setError('');

      // Verify payment with backend
      const verificationResponse = await paymentService.verifyPayment(orderId!);

      if (!verificationResponse.success) {
        throw new Error(verificationResponse.message || 'Payment verification failed');
      }

      // Get order details
      const orderResponse = await paymentService.getOrderStatus(orderId!);

      if (!orderResponse.success) {
        throw new Error('Failed to fetch order details');
      }

      setPaymentData(orderResponse.data);

      // Get project details if payment is successful
      if (paymentService.isPaymentSuccessful(orderResponse.data.status)) {
        try {
          const projectResponse = await projectService.getProject(orderResponse.data.project._id);
          if (projectResponse.success) {
            setProjectData(projectResponse.data);
          }
        } catch (projectError) {
          console.error('Error fetching project details:', projectError);
          // Don't fail the whole flow if project fetch fails
        }
      }

    } catch (error: any) {
      console.error('Payment verification error:', error);
      setError(error.response?.data?.message || error.message || 'Payment verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDirectDownload = async () => {
    if (!projectData) return;

    try {
      setIsDownloading(true);

      // Check if project has ZIP file for direct download
      if (projectData.projectZipFile && projectData.projectZipFile.filename) {
        await projectService.downloadProjectZip(projectData._id);
        setDownloadSuccess('Project downloaded successfully!');
      } else {
        // Fallback to GitHub access if no ZIP file
        const accessResponse = await projectService.getProjectAccess(projectData._id);
        if (accessResponse.success && accessResponse.data.githubRepo) {
          window.open(accessResponse.data.githubRepo, '_blank');
        } else {
          throw new Error('No download method available for this project');
        }
      }
    } catch (error: any) {
      console.error('Error downloading project:', error);
      setDownloadError(error.message || 'Error downloading project. Please contact support.');
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 page-with-navbar">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Verifying Payment</h2>
            <p className="text-gray-600 leading-relaxed">
              Please wait while we confirm your payment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 page-with-navbar">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-200">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard/buyer')}
                className="w-full bg-black text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-white text-gray-900 font-medium py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPaymentSuccessful = paymentData && paymentService.isPaymentSuccessful(paymentData.status);

  return (
    <div className="min-h-screen bg-black page-with-navbar">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Clean Professional Receipt */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-black px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Payment Receipt</h1>
                <p className="text-gray-400 text-sm mt-1">ProjectBuzz Digital Marketplace</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Receipt #</p>
                <p className="text-white font-mono text-lg">{paymentData?.orderId}</p>
              </div>
            </div>
          </div>

          {/* Status Section */}
          {isPaymentSuccessful ? (
            <div className="px-8 py-8 bg-green-50 border-b border-gray-200">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Payment Successful</h2>
                  <p className="text-gray-600">Your transaction has been completed successfully</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-8 py-8 bg-red-50 border-b border-gray-200">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Payment Status</h2>
                  <p className="text-gray-600">
                    Status: {paymentService.getStatusText(paymentData?.status || 'UNKNOWN')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details Section */}
          {paymentData && (
            <div className="px-8 py-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Transaction Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Order ID</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-gray-900">{paymentData.orderId}</span>
                    <button
                      onClick={() => copyToClipboard(paymentData.orderId, 'orderId')}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copy Order ID"
                    >
                      {copiedField === 'orderId' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="text-xl font-bold text-gray-900">
                    {paymentService.formatCurrency(paymentData.amount, paymentData.currency)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isPaymentSuccessful
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {paymentService.getStatusText(paymentData.status)}
                  </span>
                </div>

                {paymentData.paymentTime && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Payment Time</span>
                    <span className="text-gray-900 font-medium">
                      {new Date(paymentData.paymentTime).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Project Access Section */}
          {isPaymentSuccessful && projectData && (
            <div className="px-8 py-8 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Purchase</h3>

              <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{projectData.title}</h4>
                    <p className="text-gray-600 mb-4 leading-relaxed">{projectData.description}</p>
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {projectData.category}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Access Granted
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleDirectDownload}
                  disabled={isDownloading}
                  className="bg-black text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isDownloading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>
                        {projectData?.projectZipFile ? 'Download Project Files' : 'Access GitHub Repository'}
                      </span>
                    </>
                  )}
                </button>

                {projectData.demoUrl && (
                  <button
                    onClick={() => window.open(projectData.demoUrl, '_blank')}
                    className="bg-white text-gray-900 font-medium py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Live Demo</span>
                  </button>
                )}
              </div>

              {/* Download Status Messages */}
              {downloadSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-800 text-sm">{downloadSuccess}</span>
                </div>
              )}

              {downloadError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-800 text-sm">{downloadError}</span>
                </div>
              )}

              {/* Download Instructions */}
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">📋 What's Included:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Complete source code and project files</li>
                  <li>• Documentation and setup instructions</li>
                  <li>• All assets and dependencies</li>
                  <li>• Ready-to-use project structure</li>
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Link to="/dashboard/buyer" className="block">
                <button className="w-full bg-black text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors">
                  Go to Dashboard
                </button>
              </Link>
              <Link to="/" className="block">
                <button className="w-full bg-white text-gray-900 font-medium py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                  Browse More Projects
                </button>
              </Link>
            </div>

            {/* Support Section */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="text-center">
                <h4 className="text-gray-900 font-medium mb-2">Need Help?</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Contact our support team for any questions about your purchase.
                </p>
                <a
                  href="mailto:support@projectbuzz.com"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  support@projectbuzz.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Thank you for choosing ProjectBuzz. Your receipt has been sent to your email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
