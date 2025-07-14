import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Users, DollarSign, AlertTriangle, Scale, Lock, UserCheck, Gavel } from 'lucide-react';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/dashboard/seller"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Terms and Conditions</h1>
          <p className="text-lg text-muted-foreground">
            ProjectBuzz Platform Terms of Service for Sellers
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray dark:prose-invert max-w-none">

          {/* Introduction */}
          <section className="mb-12">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-semibold text-foreground">1. Introduction</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to ProjectBuzz, a digital marketplace for buying and selling software projects, source code, and digital assets.
              By creating an account and submitting projects on our platform, you agree to be bound by these Terms and Conditions.
              Please read them carefully before proceeding.
            </p>
          </section>

          {/* Project Submission Guidelines */}
          <section className="mb-12">
            <div className="flex items-center mb-4">
              <UserCheck className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-semibold text-foreground">2. Project Submission Guidelines</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <h3 className="text-lg font-medium text-foreground">2.1 Quality Requirements</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Projects must be original work or properly licensed</li>
                <li>Source code must be clean, well-documented, and functional</li>
                <li>All dependencies and installation instructions must be clearly provided</li>
                <li>Projects must be tested and free of critical bugs</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">2.2 Content Standards</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Accurate project descriptions and feature listings</li>
                <li>Appropriate categorization and tagging</li>
                <li>High-quality screenshots and demo materials</li>
                <li>Honest representation of project complexity and requirements</li>
              </ul>
            </div>
          </section>

          {/* Content Ownership and Licensing */}
          <section className="mb-12">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-semibold text-foreground">3. Content Ownership and Licensing</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <h3 className="text-lg font-medium text-foreground">3.1 Seller Rights</h3>
              <p>You retain ownership of your original intellectual property. By uploading projects, you grant ProjectBuzz a non-exclusive license to display, distribute, and market your content on the platform.</p>

              <h3 className="text-lg font-medium text-foreground">3.2 Buyer Rights</h3>
              <p>Buyers receive a license to use purchased projects for personal or commercial purposes, unless otherwise specified. Reselling or redistributing the exact source code is prohibited.</p>

              <h3 className="text-lg font-medium text-foreground">3.3 Third-Party Content</h3>
              <p>You are responsible for ensuring all third-party libraries, assets, or code used in your projects are properly licensed and disclosed.</p>
            </div>
          </section>

          {/* Platform Commission and Payment Terms */}
          <section className="mb-12">
            <div className="flex items-center mb-4">
              <DollarSign className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-semibold text-foreground">4. Platform Commission and Payment Terms</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <h3 className="text-lg font-medium text-foreground">4.1 Commission Structure</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>ProjectBuzz charges a 15% commission on all sales</li>
                <li>Sellers receive 85% of the sale price after successful transactions</li>
                <li>Commission rates are subject to change with 30 days notice</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">4.2 Payment Processing</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payments are processed through Razorpay payment gateway</li>
                <li>Seller earnings are credited to platform wallet after successful delivery</li>
                <li>Minimum withdrawal amount: ₹250</li>
                <li>Payout processing time: 3-4 working days</li>
              </ul>
            </div>
          </section>

          {/* Prohibited Content and Behavior */}
          <section className="mb-12">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-semibold text-foreground">5. Prohibited Content and Behavior</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <h3 className="text-lg font-medium text-foreground">5.1 Prohibited Content</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Malicious software, viruses, or security exploits</li>
                <li>Copyrighted material without proper authorization</li>
                <li>Adult content or inappropriate material</li>
                <li>Projects that violate applicable laws or regulations</li>
                <li>Plagiarized or stolen source code</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">5.2 Prohibited Behavior</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Attempting to circumvent platform payment systems</li>
                <li>Providing false or misleading project information</li>
                <li>Harassment or inappropriate communication with buyers</li>
                <li>Creating multiple accounts to manipulate ratings or sales</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property Rights */}
          <section className="mb-12">
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-semibold text-foreground">6. Intellectual Property Rights</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <h3 className="text-lg font-medium text-foreground">6.1 Seller Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ensure you have the right to sell all content in your projects</li>
                <li>Provide proper attribution for open-source components</li>
                <li>Disclose any licensing restrictions or requirements</li>
                <li>Indemnify ProjectBuzz against IP infringement claims</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">6.2 Platform Protection</h3>
              <p>ProjectBuzz reserves the right to remove content that violates intellectual property rights and may suspend accounts for repeated violations.</p>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-12">
            <div className="flex items-center mb-4">
              <Scale className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-semibold text-foreground">7. Dispute Resolution</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <h3 className="text-lg font-medium text-foreground">7.1 Dispute Process</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Initial disputes should be resolved directly between buyer and seller</li>
                <li>Platform mediation available for unresolved issues</li>
                <li>Refund policies apply based on project delivery and quality</li>
                <li>Final decisions rest with ProjectBuzz administration</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">7.2 Refund Policy</h3>
              <p>Refunds may be issued for projects that significantly differ from descriptions, contain malicious code, or fail to function as advertised.</p>
            </div>
          </section>

          {/* Account Termination */}
          <section className="mb-12">
            <div className="flex items-center mb-4">
              <Gavel className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-semibold text-foreground">8. Account Termination</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <h3 className="text-lg font-medium text-foreground">8.1 Termination Grounds</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violation of these Terms and Conditions</li>
                <li>Fraudulent activity or payment disputes</li>
                <li>Repeated submission of low-quality or prohibited content</li>
                <li>Abuse of platform features or other users</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">8.2 Termination Process</h3>
              <p>Account termination may be immediate for severe violations. For other cases, warnings and temporary suspensions may precede permanent termination.</p>
            </div>
          </section>

          {/* Privacy and Data Usage */}
          <section className="mb-12">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-semibold text-foreground">9. Privacy and Data Usage</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>Your privacy is important to us. We collect and use personal information in accordance with our Privacy Policy, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information and project data for platform operation</li>
                <li>Payment information for transaction processing</li>
                <li>Usage analytics to improve platform services</li>
                <li>Communication data for customer support</li>
              </ul>
            </div>
          </section>

          {/* Platform Liability Limitations */}
          <section className="mb-12">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-semibold text-foreground">10. Platform Liability Limitations</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>ProjectBuzz provides the platform "as is" and disclaims warranties regarding:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Continuous, uninterrupted platform availability</li>
                <li>Quality or functionality of user-submitted projects</li>
                <li>Accuracy of project descriptions or seller claims</li>
                <li>Compatibility with specific systems or requirements</li>
              </ul>
              <p className="mt-4">Our liability is limited to the platform commission earned from disputed transactions.</p>
            </div>
          </section>

          {/* User Obligations */}
          <section className="mb-12">
            <div className="flex items-center mb-4">
              <UserCheck className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-semibold text-foreground">11. User Obligations and Responsibilities</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>As a seller on ProjectBuzz, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete project information</li>
                <li>Respond promptly to buyer inquiries and support requests</li>
                <li>Maintain the security of your account credentials</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Update project information when necessary</li>
                <li>Provide reasonable post-sale support for your projects</li>
              </ul>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-semibold text-foreground">12. Changes to Terms</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>ProjectBuzz reserves the right to modify these Terms and Conditions at any time. Changes will be communicated through:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email notifications to registered users</li>
                <li>Platform announcements and notifications</li>
                <li>Updated terms posted on the website</li>
              </ul>
              <p>Continued use of the platform after changes constitutes acceptance of the new terms.</p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-12 p-6 bg-muted/30 rounded-lg border border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about these Terms and Conditions, please contact us:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Email:</strong> infoprojectbuzz@gmail.com</p>
              <p><strong>Phone:</strong> +91 8624829427</p>
              <p><strong>Address:</strong> Amravati, Maharashtra, India</p>
              <p><strong>Platform:</strong> Use the contact form in your dashboard</p>
              <p><strong>Response Time:</strong> 24-48 hours for general inquiries</p>
            </div>
          </section>

          {/* Acceptance */}
          <section className="mb-12 p-6 bg-primary/10 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By checking the "I agree to the Terms and Conditions" checkbox in the project submission form,
              you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              If you do not agree with any part of these terms, please do not submit projects to our platform.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
