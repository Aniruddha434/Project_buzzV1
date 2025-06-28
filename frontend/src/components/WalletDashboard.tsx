import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import LoadingSpinner from './ui/LoadingSpinner';
import walletService from '../services/walletService.js';

interface WalletData {
  balance: number;
  balanceInPaise: number;
  totalEarned: number;
  totalWithdrawn: number;
  availableBalance: number;
  status: string;
  lastTransactionAt: string | null;
}

interface Transaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  amountInRupees: number;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  relatedProject?: {
    title: string;
  };
}

interface PayoutRequest {
  _id: string;
  payoutId: string;
  amount: number;
  amountInRupees: number;
  status: string;
  requestedAt: string;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName?: string;
  };
  adminReview?: {
    rejectionReason?: string;
    comments?: string;
  };
}

const WalletDashboard: React.FC = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'payouts'>('overview');

  // Payout request form
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    bankName: ''
  });
  const [payoutLoading, setPayoutLoading] = useState(false);

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
    fetchPayoutRequests();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await walletService.getBalance();
      if (response.success) {
        setWalletData(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching wallet data:', error);
      setError('Failed to fetch wallet data');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await walletService.getTransactions({ limit: 10 });
      if (response.success) {
        setTransactions(response.data.transactions);
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchPayoutRequests = async () => {
    try {
      const response = await walletService.getPayoutRequests({ limit: 5 });
      if (response.success) {
        setPayoutRequests(response.data.payouts);
      }
    } catch (error: any) {
      console.error('Error fetching payout requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletData) return;

    // Validate form
    const validation = walletService.validatePayoutAmount(
      parseFloat(payoutForm.amount),
      walletData.availableBalance
    );

    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    const bankValidation = walletService.validateBankDetails(payoutForm);
    if (!bankValidation.isValid) {
      setError(bankValidation.errors.join(', '));
      return;
    }

    try {
      setPayoutLoading(true);
      setError(null);

      const response = await walletService.requestPayout({
        amount: parseFloat(payoutForm.amount),
        accountNumber: payoutForm.accountNumber,
        ifscCode: payoutForm.ifscCode.toUpperCase(),
        accountHolderName: payoutForm.accountHolderName,
        bankName: payoutForm.bankName
      });

      if (response.success) {
        setShowPayoutForm(false);
        setPayoutForm({
          amount: '',
          accountNumber: '',
          ifscCode: '',
          accountHolderName: '',
          bankName: ''
        });

        // Refresh data
        await fetchWalletData();
        await fetchPayoutRequests();

        alert('Payout request submitted successfully!');
      }
    } catch (error: any) {
      console.error('Error requesting payout:', error);
      setError(error.response?.data?.message || 'Failed to request payout');
    } finally {
      setPayoutLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return walletService.formatCurrency(amount);
  };

  const getStatusColor = (status: string) => {
    return walletService.getPayoutStatusColor(status);
  };

  const getStatusText = (status: string) => {
    return walletService.getPayoutStatusText(status);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Unable to load wallet data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Commission Information */}
      <Card className="p-4 bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-foreground">Commission Structure</h4>
            <p className="text-xs text-muted-foreground">You receive 85% of each sale, platform keeps 15%</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">85%</div>
            <div className="text-xs text-muted-foreground">Your share</div>
          </div>
        </div>
      </Card>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Wallet Balance</h3>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {showBalance ? formatCurrency(walletData.balance) : '••••••'}
          </div>
          <div className="text-sm text-gray-600">
            Available: {showBalance ? formatCurrency(walletData.availableBalance) : '••••••'}
          </div>
        </Card>

        {/* Total Earned */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Total Earned</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(walletData.totalEarned)}
          </div>
          <div className="text-sm text-gray-600">Lifetime earnings</div>
        </Card>

        {/* Total Withdrawn */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Download className="h-8 w-8 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Total Withdrawn</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(walletData.totalWithdrawn)}
          </div>
          <div className="text-sm text-gray-600">Lifetime withdrawals</div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={() => setShowPayoutForm(true)}
          leftIcon={<Plus className="h-4 w-4" />}
          disabled={walletData.availableBalance < 250}
        >
          Request Payout
        </Button>
        {walletData.availableBalance < 250 && (
          <p className="text-sm text-gray-500 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            Minimum payout amount is ₹250
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'transactions', label: 'Transactions' },
            { id: 'payouts', label: 'Payout Requests' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'transactions' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${
                      transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <TrendingUp className={`h-4 w-4 ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`} />
                      ) : (
                        <Download className={`h-4 w-4 ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amountInRupees)}
                    </p>
                    <Badge variant={walletService.getTransactionTypeColor(transaction.type) as any}>
                      {walletService.getTransactionCategoryText(transaction.category)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'payouts' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Requests</h3>
          {payoutRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No payout requests yet</p>
          ) : (
            <div className="space-y-4">
              {payoutRequests.map((payout) => (
                <div key={payout._id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        Payout Request - {formatCurrency(payout.amountInRupees)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(payout.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(payout.status) as any}>
                      {getStatusText(payout.status)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Account: ****{payout.bankDetails.accountNumber.slice(-4)}</p>
                    <p>IFSC: {payout.bankDetails.ifscCode}</p>
                    {payout.adminReview?.rejectionReason && (
                      <p className="text-red-600 mt-2">
                        Reason: {payout.adminReview.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Payout Request Modal */}
      {showPayoutForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Payout</h3>
            <form onSubmit={handlePayoutRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="250"
                  max={walletData.availableBalance}
                  step="0.01"
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: {formatCurrency(walletData.availableBalance)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={payoutForm.accountNumber}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={payoutForm.ifscCode}
                  onChange={(e) => setPayoutForm({ ...payoutForm, ifscCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={payoutForm.accountHolderName}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountHolderName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name (Optional)
                </label>
                <input
                  type="text"
                  value={payoutForm.bankName}
                  onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={payoutLoading}
                  className="flex-1"
                >
                  {payoutLoading ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPayoutForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletDashboard;
