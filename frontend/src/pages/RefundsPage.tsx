import React from 'react';
import { RotateCcw, Clock, AlertCircle, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { Card } from '../components/ui/card-shadcn';
import { Button } from '../components/ui/button-shadcn';

const RefundsPage: React.FC = () => {
  const lastUpdated = new Date().toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-black page-with-navbar">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <RotateCcw className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Cancellation & Refunds Policy</h1>
          <p className="text-xl text-gray-400">
            Clear guidelines for refunds and cancellations on ProjectBuzz
          </p>
          <p className="text-gray-500 mt-2">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-8">
          {/* Overview */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">1. Policy Overview</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <p>
                ProjectBuzz is committed to customer satisfaction. This policy outlines the conditions under which 
                refunds and cancellations are processed for digital products purchased on our platform.
              </p>
              <p>
                Due to the digital nature of our products, all sales are generally final. However, we provide 
                refunds in specific circumstances outlined below.
              </p>
            </div>
          </Card>

          {/* Refund Eligibility */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">2. Refund Eligibility</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <h3 className="text-lg font-medium text-white">2.1 Valid Refund Reasons</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Non-functional Code:</strong> Project files don't work as described</li>
                <li><strong>Missing Files:</strong> Essential project files are missing or corrupted</li>
                <li><strong>Misrepresentation:</strong> Project significantly differs from description</li>
                <li><strong>Technical Issues:</strong> Platform error during download or access</li>
                <li><strong>Duplicate Purchase:</strong> Accidental multiple purchases of same project</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">2.2 Refund Timeframe</h3>
              <div className="bg-gray-800 rounded-lg p-4 mt-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-white mr-2" />
                  <span className="font-semibold text-white">7 Days from Purchase</span>
                </div>
                <p className="text-gray-300">
                  Refund requests must be submitted within 7 days of the original purchase date. 
                  Requests submitted after this period will not be eligible for refunds.
                </p>
              </div>
            </div>
          </Card>

          {/* Non-Refundable Situations */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <XCircle className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">3. Non-Refundable Situations</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <p>Refunds will NOT be provided in the following situations:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Change of Mind:</strong> Simply not wanting the project anymore</li>
                <li><strong>Compatibility Issues:</strong> Project doesn't work with your specific setup</li>
                <li><strong>Skill Level:</strong> Project is too complex for your skill level</li>
                <li><strong>Customization Needs:</strong> Project requires modifications for your use case</li>
                <li><strong>Downloaded Content:</strong> After successfully downloading and accessing files</li>
                <li><strong>Late Requests:</strong> Refund requests made after 7 days</li>
                <li><strong>Violation of Terms:</strong> Buyer violated platform terms of service</li>
              </ul>
            </div>
          </Card>

          {/* Refund Process */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">4. Refund Request Process</h2>
            <div className="text-gray-300 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-2">Step 1</div>
                  <h4 className="font-semibold text-white mb-2">Contact Support</h4>
                  <p className="text-sm">Email infoprojectbuzz@gmail.com with your refund request</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-2">Step 2</div>
                  <h4 className="font-semibold text-white mb-2">Provide Details</h4>
                  <p className="text-sm">Include order ID, reason for refund, and supporting evidence</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-2">Step 3</div>
                  <h4 className="font-semibold text-white mb-2">Review & Process</h4>
                  <p className="text-sm">We'll review and process within 3-5 business days</p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-white">4.1 Required Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Order/Transaction ID</li>
                <li>Project name and seller information</li>
                <li>Detailed reason for refund request</li>
                <li>Screenshots or evidence (if applicable)</li>
                <li>Your registered email address</li>
              </ul>
            </div>
          </Card>

          {/* Processing Times */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">5. Processing Timeframes</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Review Process</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      <span>Initial review: 1-2 business days</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      <span>Decision notification: 3-5 business days</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      <span>Complex cases: Up to 10 business days</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Refund Processing</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      <span>Approved refunds: 5-7 business days</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      <span>Bank processing: 3-5 additional days</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      <span>Total time: 8-12 business days</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Seller Payout Cancellations */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">6. Seller Payout Cancellations</h2>
            <div className="text-gray-300 space-y-3">
              <h3 className="text-lg font-medium text-white">6.1 Cancellation Conditions</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Payouts can be cancelled before processing begins</li>
                <li>Once processing starts, cancellation may not be possible</li>
                <li>Emergency cancellations may incur processing fees</li>
                <li>Cancelled amounts return to seller's ProjectBuzz balance</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">6.2 Cancellation Process</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Contact support immediately with payout ID</li>
                <li>Provide valid reason for cancellation</li>
                <li>Cancellation processed within 24 hours if possible</li>
                <li>Confirmation sent via email</li>
              </ul>
            </div>
          </Card>

          {/* Dispute Resolution */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">7. Dispute Resolution</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <h3 className="text-lg font-medium text-white">7.1 Mediation Process</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>ProjectBuzz acts as mediator between buyers and sellers</li>
                <li>Both parties provide evidence and statements</li>
                <li>Fair resolution based on platform policies</li>
                <li>Decision is final and binding</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">7.2 Escalation</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Unresolved disputes escalated to senior management</li>
                <li>Additional review and investigation</li>
                <li>Final decision within 15 business days</li>
                <li>Legal action as last resort</li>
              </ul>
            </div>
          </Card>

          {/* Partial Refunds */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">8. Partial Refunds</h2>
            <div className="text-gray-300 space-y-3">
              <p>
                In certain cases, partial refunds may be offered:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Incomplete Projects:</strong> Some files missing but core functionality works</li>
                <li><strong>Minor Issues:</strong> Small bugs or documentation problems</li>
                <li><strong>Goodwill Gestures:</strong> Customer satisfaction initiatives</li>
                <li><strong>Settlement Agreements:</strong> Mutually agreed resolutions</li>
              </ul>
              <p className="mt-4">
                Partial refund amounts are determined case-by-case based on the extent of issues and impact on usability.
              </p>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">9. Contact for Refunds</h2>
            <div className="text-gray-300 space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Refund Support</h3>
                <ul className="space-y-2">
                  <li><strong>Email:</strong> infoprojectbuzz@gmail.com</li>
                  <li><strong>Subject:</strong> "Refund Request - [Order ID]"</li>
                  <li><strong>Response Time:</strong> Within 24 hours</li>
                </ul>
              </div>
              
              <div className="text-center">
                <Button 
                  className="bg-white text-black hover:bg-gray-200 font-medium"
                  onClick={() => window.location.href = '/contact'}
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </Card>

          {/* Policy Changes */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">10. Policy Updates</h2>
            <div className="text-gray-300 space-y-3">
              <p>
                This refund policy may be updated from time to time. Changes will be effective immediately upon posting. 
                Users will be notified of significant changes via email or platform notifications.
              </p>
              <p>
                Continued use of ProjectBuzz after policy changes constitutes acceptance of the updated terms.
              </p>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-800">
          <p className="text-gray-500">
            For any questions about this refund policy, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefundsPage;
