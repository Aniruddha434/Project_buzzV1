import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Download, ExternalLink, AlertCircle, Loader } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import paymentService from '../services/paymentService';
import projectService from '../services/projectService';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [projectData, setProjectData] = useState<any>(null);
  const [error, setError] = useState<string>('');

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

  const handleDownloadAccess = async () => {
    if (!projectData) return;

    try {
      const accessResponse = await projectService.getProjectAccess(projectData._id);
      if (accessResponse.success && accessResponse.data.githubRepo) {
        window.open(accessResponse.data.githubRepo, '_blank');
      }
    } catch (error: any) {
      console.error('Error accessing project:', error);
      alert('Error accessing project. Please contact support.');
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8">
          <Loader
            className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin"
            width="48"
            height="48"
          />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={() => navigate('/dashboard/buyer')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isPaymentSuccessful = paymentData && paymentService.isPaymentSuccessful(paymentData.status);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        {isPaymentSuccessful ? (
          <Card className="text-center p-8 mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-4">
              Thank you for your purchase. You now have access to the project.
            </p>
            <Badge variant="success" size="lg">
              Order #{paymentData.orderId}
            </Badge>
          </Card>
        ) : (
          <Card className="text-center p-8 mb-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Status</h1>
            <p className="text-gray-600 mb-4">
              Your payment status is: {paymentService.getStatusText(paymentData?.status || 'UNKNOWN')}
            </p>
            <Badge variant={paymentService.getStatusColor(paymentData?.status) as any} size="lg">
              Order #{paymentData?.orderId}
            </Badge>
          </Card>
        )}

        {/* Payment Details */}
        {paymentData && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{paymentData.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">
                  {paymentService.formatCurrency(paymentData.amount, paymentData.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant={paymentService.getStatusColor(paymentData.status) as any}>
                  {paymentService.getStatusText(paymentData.status)}
                </Badge>
              </div>
              {paymentData.paymentTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Time:</span>
                  <span className="font-medium">
                    {new Date(paymentData.paymentTime).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Project Access */}
        {isPaymentSuccessful && projectData && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Access</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-2">{projectData.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{projectData.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Category: {projectData.category}
                </span>
                <span className="text-sm font-medium text-green-600">
                  ✓ Access Granted
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={handleDownloadAccess}
                leftIcon={<Download className="h-4 w-4" />}
                className="w-full"
              >
                Access GitHub Repository
              </Button>

              {projectData.demoUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(projectData.demoUrl, '_blank')}
                  leftIcon={<ExternalLink className="h-4 w-4" />}
                  className="w-full"
                >
                  View Live Demo
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/dashboard/buyer" className="flex-1">
            <Button variant="primary" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button variant="outline" className="w-full">
              Browse More Projects
            </Button>
          </Link>
        </div>

        {/* Support Info */}
        <Card className="p-4 mt-6 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@projectbuzz.com" className="font-medium underline">
              support@projectbuzz.com
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
