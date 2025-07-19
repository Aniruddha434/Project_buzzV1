import React from 'react';
import { IndianRupee, CreditCard, Clock, TrendingUp, Shield, Users, Zap, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/card-shadcn';
import { Button } from '../components/ui/button-shadcn';

const PricingPage: React.FC = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-black page-with-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Pricing & Fees</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Transparent pricing with no hidden fees. Start selling your projects today!
          </p>
        </div>

        {/* Platform Commission */}
        <div className="mb-12">
          <Card className="p-8 bg-gray-900 border-gray-800">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-black" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">15% Platform Commission</h2>
              <p className="text-gray-400 text-lg">
                We only earn when you earn. Simple, transparent pricing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">You Sell for ₹1,000</div>
                <div className="text-gray-400 mb-2">Platform Fee: ₹150</div>
                <div className="text-xl font-semibold text-green-400">You Keep: ₹850</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">You Sell for ₹5,000</div>
                <div className="text-gray-400 mb-2">Platform Fee: ₹750</div>
                <div className="text-xl font-semibold text-green-400">You Keep: ₹4,250</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">You Sell for ₹10,000</div>
                <div className="text-gray-400 mb-2">Platform Fee: ₹1,500</div>
                <div className="text-xl font-semibold text-green-400">You Keep: ₹8,500</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Seller Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <IndianRupee className="h-6 w-6 text-white mr-3" />
              <h3 className="text-xl font-semibold text-white">Minimum Withdrawal</h3>
            </div>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-white">{formatCurrency(250)}</div>
              <p className="text-gray-400">
                Minimum amount required in your account before you can request a withdrawal.
              </p>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  No maximum withdrawal limit
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Multiple withdrawal methods
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Secure bank transfers
                </li>
              </ul>
            </div>
          </Card>

          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-white mr-3" />
              <h3 className="text-xl font-semibold text-white">Payout Processing</h3>
            </div>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-white">3-4 Working Days</div>
              <p className="text-gray-400">
                Time required to process your withdrawal request and transfer funds to your account.
              </p>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Automated processing system
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Email notifications for status updates
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Weekend processing available
                </li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Payment Methods */}
        <div className="mb-12">
          <Card className="p-8 bg-gray-900 border-gray-800">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
                <CreditCard className="h-8 w-8 text-black" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Methods</h2>
              <p className="text-gray-400">
                Secure payments powered by Razorpay - India's leading payment gateway
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-gray-800 rounded-lg p-4 mb-3">
                  <CreditCard className="h-8 w-8 text-white mx-auto" />
                </div>
                <h4 className="font-semibold text-white">Credit Cards</h4>
                <p className="text-gray-400 text-sm">Visa, Mastercard, RuPay</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-800 rounded-lg p-4 mb-3">
                  <CreditCard className="h-8 w-8 text-white mx-auto" />
                </div>
                <h4 className="font-semibold text-white">Debit Cards</h4>
                <p className="text-gray-400 text-sm">All major Indian banks</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-800 rounded-lg p-4 mb-3">
                  <Shield className="h-8 w-8 text-white mx-auto" />
                </div>
                <h4 className="font-semibold text-white">Net Banking</h4>
                <p className="text-gray-400 text-sm">50+ banks supported</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-800 rounded-lg p-4 mb-3">
                  <Zap className="h-8 w-8 text-white mx-auto" />
                </div>
                <h4 className="font-semibold text-white">UPI</h4>
                <p className="text-gray-400 text-sm">PhonePe, GPay, Paytm</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Currency Information */}
        <div className="mb-12">
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center mb-4">
              <IndianRupee className="h-6 w-6 text-white mr-3" />
              <h3 className="text-xl font-semibold text-white">Currency</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Indian Rupees (₹)</h4>
                <p className="text-gray-400">
                  All transactions on ProjectBuzz are processed in Indian Rupees (INR). 
                  This ensures compliance with Indian regulations and provides the best 
                  experience for our users.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Tax Compliance</h4>
                <p className="text-gray-400">
                  Sellers are responsible for their own tax obligations. ProjectBuzz 
                  provides transaction records to help with tax filing. Consult a tax 
                  professional for specific advice.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* For Buyers */}
        <div className="mb-12">
          <Card className="p-8 bg-gray-900 border-gray-800">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
                <Users className="h-8 w-8 text-black" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">For Buyers</h2>
              <p className="text-gray-400">
                Simple, transparent pricing with no hidden fees
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h4 className="font-semibold text-white mb-2">No Additional Fees</h4>
                <p className="text-gray-400">
                  Pay only the listed price. No processing fees, no hidden charges.
                </p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-white mb-2">Instant Access</h4>
                <p className="text-gray-400">
                  Get immediate access to your purchased projects after payment.
                </p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-white mb-2">Secure Payments</h4>
                <p className="text-gray-400">
                  All payments are secured by Razorpay's enterprise-grade security.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="p-8 bg-gray-900 border-gray-800">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Selling?</h3>
            <p className="text-gray-400 mb-6">
              Join thousands of developers earning money by selling their projects on ProjectBuzz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-white text-black hover:bg-gray-200 font-medium"
                onClick={() => window.location.href = '/seller-registration'}
              >
                Become a Seller
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-600 text-white hover:bg-gray-800"
                onClick={() => window.location.href = '/contact'}
              >
                Have Questions?
              </Button>
            </div>
          </Card>
        </div>

        {/* Last Updated */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Last updated: {new Date().toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
