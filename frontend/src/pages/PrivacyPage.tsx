import React from 'react';
import { Shield, Database, Eye, Lock, Globe, UserCheck } from 'lucide-react';
import { Card } from '../components/ui/card-shadcn';

const PrivacyPage: React.FC = () => {
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
            <Shield className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-400">
            Your privacy is important to us. This policy explains how we collect, use, and protect your data.
          </p>
          <p className="text-gray-500 mt-2">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <p>
                ProjectBuzz ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our platform.
              </p>
              <p>
                This policy applies to all users of ProjectBuzz, including buyers, sellers, and visitors to our website.
              </p>
            </div>
          </Card>

          {/* Information We Collect */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">2. Information We Collect</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <h3 className="text-lg font-medium text-white">2.1 Personal Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Account Information:</strong> Email address, name, password (encrypted)</li>
                <li><strong>Profile Information:</strong> Display name, profile picture, bio</li>
                <li><strong>Contact Information:</strong> Email for communications and support</li>
                <li><strong>Payment Information:</strong> Processed securely through Razorpay (we don't store card details)</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">2.2 Project Data</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Project Listings:</strong> Titles, descriptions, images, source code files</li>
                <li><strong>Transaction Data:</strong> Purchase history, sales records, earnings</li>
                <li><strong>Usage Data:</strong> Project views, downloads, ratings</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">2.3 Technical Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Usage Analytics:</strong> Pages visited, time spent, click patterns</li>
                <li><strong>Cookies:</strong> Session management, preferences, analytics</li>
              </ul>
            </div>
          </Card>

          {/* How We Use Your Information */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <Eye className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">3. How We Use Your Information</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <h3 className="text-lg font-medium text-white">3.1 Platform Operations</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Create and manage user accounts</li>
                <li>Process transactions and payments</li>
                <li>Provide customer support</li>
                <li>Facilitate project listings and sales</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">3.2 Communication</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Send transaction confirmations and receipts</li>
                <li>Provide important platform updates</li>
                <li>Respond to support inquiries</li>
                <li>Send marketing communications (with consent)</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">3.3 Platform Improvement</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Analyze usage patterns to improve user experience</li>
                <li>Develop new features and services</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </Card>

          {/* Third-Party Integrations */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <Globe className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">4. Third-Party Integrations</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <h3 className="text-lg font-medium text-white">4.1 MongoDB Atlas</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Secure cloud database for storing user and project data</li>
                <li>Data encrypted in transit and at rest</li>
                <li>Located in secure data centers with compliance certifications</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">4.2 Razorpay Payment Gateway</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Processes all payment transactions securely</li>
                <li>PCI DSS compliant payment processing</li>
                <li>We don't store sensitive payment information</li>
                <li>Transaction data shared for payment processing only</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">4.3 Google OAuth</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Optional login method for user convenience</li>
                <li>We receive only basic profile information (name, email)</li>
                <li>You can revoke access anytime through Google settings</li>
              </ul>
            </div>
          </Card>

          {/* Data Storage and Security */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">5. Data Storage and Security</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <h3 className="text-lg font-medium text-white">5.1 Security Measures</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All data transmitted using SSL/TLS encryption</li>
                <li>Passwords hashed using industry-standard algorithms</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication systems</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">5.2 Data Retention</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account data retained while account is active</li>
                <li>Transaction records kept for legal and tax purposes</li>
                <li>Analytics data anonymized after 24 months</li>
                <li>Deleted data removed from active systems within 30 days</li>
              </ul>
            </div>
          </Card>

          {/* Your Rights and Choices */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <UserCheck className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">6. Your Rights and Choices</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <h3 className="text-lg font-medium text-white">6.1 Data Access and Control</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a standard format</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">6.2 Communication Preferences</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Opt out of marketing emails anytime</li>
                <li>Manage notification preferences in account settings</li>
                <li>Essential service communications cannot be disabled</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">6.3 Account Deletion</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Delete your account anytime from settings</li>
                <li>Some data may be retained for legal compliance</li>
                <li>Transaction records kept for tax and audit purposes</li>
              </ul>
            </div>
          </Card>

          {/* Cookies and Tracking */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">7. Cookies and Tracking</h2>
            <div className="text-gray-300 space-y-3">
              <h3 className="text-lg font-medium text-white">7.1 Types of Cookies</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white">7.2 Cookie Management</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You can control cookies through browser settings</li>
                <li>Disabling cookies may affect platform functionality</li>
                <li>We don't use third-party advertising cookies</li>
              </ul>
            </div>
          </Card>

          {/* International Users */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">8. International Users</h2>
            <div className="text-gray-300 space-y-3">
              <p>
                ProjectBuzz is based in India and operates under Indian data protection laws. 
                If you're accessing our platform from outside India:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your data may be transferred to and processed in India</li>
                <li>We comply with applicable international data protection standards</li>
                <li>EU users have additional rights under GDPR</li>
                <li>Contact us for region-specific privacy questions</li>
              </ul>
            </div>
          </Card>

          {/* Children's Privacy */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">9. Children's Privacy</h2>
            <div className="text-gray-300 space-y-3">
              <p>
                ProjectBuzz is not intended for users under 18 years of age. We do not knowingly collect 
                personal information from children under 18. If you believe we have collected information 
                from a child under 18, please contact us immediately.
              </p>
            </div>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">10. Changes to This Privacy Policy</h2>
            <div className="text-gray-300 space-y-3">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Posting the new Privacy Policy on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Sending email notifications for significant changes</li>
                <li>Displaying prominent notices on the platform</li>
              </ul>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">11. Contact Us</h2>
            <div className="text-gray-300 space-y-3">
              <p>
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Email:</strong> infoprojectbuzz@gmail.com</li>
                <li><strong>Subject Line:</strong> "Privacy Policy Inquiry"</li>
                <li><strong>Contact Form:</strong> <a href="/contact" className="text-white hover:text-gray-300 underline">/contact</a></li>
              </ul>
              <p className="mt-4">
                We will respond to privacy-related inquiries within 30 days.
              </p>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-800">
          <p className="text-gray-500">
            By using ProjectBuzz, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
