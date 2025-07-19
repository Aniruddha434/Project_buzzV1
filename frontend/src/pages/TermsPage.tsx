import React from 'react';
import { FileText, Shield, Users, CreditCard, AlertTriangle, Scale } from 'lucide-react';
import { Card } from '../components/ui/card-shadcn';

const TermsPage: React.FC = () => {
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
            <FileText className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Terms and Conditions</h1>
          <p className="text-xl text-gray-400">
            Please read these terms carefully before using ProjectBuzz
          </p>
          <p className="text-gray-500 mt-2">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-8">
          {/* Acceptance of Terms */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <p>
                By accessing and using ProjectBuzz ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p>
                If you do not agree to abide by the above, please do not use this service. These terms apply to all users of the platform, including buyers, sellers, and visitors.
              </p>
            </div>
          </Card>

          {/* User Registration and Accounts */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">2. User Registration and Account Responsibilities</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <h3 className="text-lg font-medium text-white">2.1 Account Creation</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You must provide accurate, current, and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must be at least 18 years old to create an account</li>
                <li>One person may not maintain more than one account</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">2.2 Account Security</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You are responsible for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
              </ul>
            </div>
          </Card>

          {/* Buyer Obligations */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">3. Buyer Obligations</h2>
            <div className="text-gray-300 space-y-3">
              <h3 className="text-lg font-medium text-white">3.1 Purchase Terms</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All purchases are final unless otherwise specified in our refund policy</li>
                <li>You receive a license to use the purchased project as specified by the seller</li>
                <li>You may not redistribute, resell, or claim ownership of purchased projects</li>
                <li>Payment must be made in full before accessing project files</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">3.2 Usage Rights</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use purchased projects for personal or commercial purposes as specified</li>
                <li>Respect intellectual property rights of project creators</li>
                <li>Do not reverse engineer or attempt to extract source code beyond what's provided</li>
              </ul>
            </div>
          </Card>

          {/* Seller Obligations */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">4. Seller Obligations</h2>
            <div className="text-gray-300 space-y-3">
              <h3 className="text-lg font-medium text-white">4.1 Project Listing Guidelines</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All listed projects must be original work or properly licensed</li>
                <li>Provide accurate descriptions, screenshots, and documentation</li>
                <li>Include clear installation and usage instructions</li>
                <li>Specify the license terms for buyers</li>
                <li>Projects must be functional and as described</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">4.2 Prohibited Content</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Malicious code, viruses, or harmful software</li>
                <li>Copyrighted material without proper authorization</li>
                <li>Adult content or illegal material</li>
                <li>Projects that violate third-party terms of service</li>
              </ul>
            </div>
          </Card>

          {/* Payment Processing Terms */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">5. Payment Processing Terms</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <h3 className="text-lg font-medium text-white">5.1 Platform Commission</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>ProjectBuzz charges a 15% commission on all successful sales</li>
                <li>Commission is automatically deducted from seller earnings</li>
                <li>Commission rates may change with 30 days notice</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">5.2 Withdrawals</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Minimum withdrawal amount is ₹250</li>
                <li>Withdrawals are processed within 3-4 working days</li>
                <li>Sellers are responsible for applicable taxes on earnings</li>
                <li>We may hold funds for security or compliance reasons</li>
              </ul>
            </div>
          </Card>

          {/* Intellectual Property Rights */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">6. Intellectual Property Rights</h2>
            <div className="text-gray-300 space-y-3">
              <h3 className="text-lg font-medium text-white">6.1 Seller Rights</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Sellers retain ownership of their original projects</li>
                <li>By listing projects, sellers grant ProjectBuzz a license to display and distribute</li>
                <li>Sellers warrant they have the right to sell their projects</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">6.2 Platform Rights</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>ProjectBuzz owns the platform, branding, and associated intellectual property</li>
                <li>We may use project information for marketing and promotional purposes</li>
                <li>We reserve the right to remove content that violates these terms</li>
              </ul>
            </div>
          </Card>

          {/* Dispute Resolution */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <Scale className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">7. Dispute Resolution</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <h3 className="text-lg font-medium text-white">7.1 Resolution Process</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Contact our support team first for any disputes</li>
                <li>We will mediate between buyers and sellers in good faith</li>
                <li>Decisions made by ProjectBuzz are final</li>
                <li>Legal disputes will be governed by Indian law</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">7.2 Refund Disputes</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Refund requests must be made within 7 days of purchase</li>
                <li>Valid reasons include non-functional code or misrepresentation</li>
                <li>Refunds are processed according to our refund policy</li>
              </ul>
            </div>
          </Card>

          {/* Platform Usage Rules */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">8. Platform Usage Rules</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <h3 className="text-lg font-medium text-white">8.1 Prohibited Activities</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Attempting to circumvent platform fees</li>
                <li>Creating fake accounts or reviews</li>
                <li>Harassing other users or staff</li>
                <li>Attempting to hack or compromise platform security</li>
                <li>Spamming or sending unsolicited communications</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">8.2 Consequences</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violation may result in account suspension or termination</li>
                <li>We may withhold payments for policy violations</li>
                <li>Legal action may be taken for serious violations</li>
              </ul>
            </div>
          </Card>

          {/* Limitation of Liability */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <div className="text-gray-300 space-y-3">
              <p>
                ProjectBuzz provides the platform "as is" without warranties of any kind. We are not liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Quality, functionality, or performance of projects listed by sellers</li>
                <li>Disputes between buyers and sellers</li>
                <li>Loss of data or business interruption</li>
                <li>Indirect, incidental, or consequential damages</li>
              </ul>
            </div>
          </Card>

          {/* Changes to Terms */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">10. Changes to Terms</h2>
            <div className="text-gray-300 space-y-3">
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
                Continued use of the platform constitutes acceptance of modified terms.
              </p>
              <p>
                Users will be notified of significant changes via email or platform notifications.
              </p>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">11. Contact Information</h2>
            <div className="text-gray-300 space-y-3">
              <p>
                For questions about these terms and conditions, please contact us:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Email: infoprojectbuzz@gmail.com</li>
                <li>Contact Form: <a href="/contact" className="text-white hover:text-gray-300 underline">/contact</a></li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-800">
          <p className="text-gray-500">
            By using ProjectBuzz, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
