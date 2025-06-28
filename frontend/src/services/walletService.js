import api from '../api.js';

const walletService = {
  // Get wallet data (balance, transactions, payouts)
  async getWallet() {
    try {
      const response = await api.get('/wallet/balance');
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      throw error;
    }
  },

  // Get wallet balance
  async getBalance() {
    try {
      const response = await api.get('/wallet/balance');
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  },

  // Get wallet transactions
  async getTransactions(options = {}) {
    try {
      const {
        limit = 20,
        skip = 0,
        type = null,
        category = null,
        startDate = null,
        endDate = null
      } = options;

      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('skip', skip.toString());

      if (type) params.append('type', type);
      if (category) params.append('category', category);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/wallet/transactions?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      throw error;
    }
  },

  // Update bank details
  async updateBankDetails(bankDetails) {
    try {
      const response = await api.put('/wallet/bank-details', bankDetails);
      return response.data;
    } catch (error) {
      console.error('Error updating bank details:', error);
      throw error;
    }
  },

  // Get wallet statistics
  async getStats() {
    try {
      const response = await api.get('/wallet/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet stats:', error);
      throw error;
    }
  },

  // Request payout
  async requestPayout(payoutData) {
    try {
      const response = await api.post('/payouts/request', payoutData);
      return response.data;
    } catch (error) {
      console.error('Error requesting payout:', error);
      throw error;
    }
  },

  // Get payout requests
  async getPayoutRequests(options = {}) {
    try {
      const {
        limit = 20,
        skip = 0,
        status = null,
        startDate = null,
        endDate = null
      } = options;

      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('skip', skip.toString());

      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/payouts/requests?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payout requests:', error);
      throw error;
    }
  },

  // Get payout statistics
  async getPayoutStats() {
    try {
      const response = await api.get('/payouts/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching payout stats:', error);
      throw error;
    }
  },

  // Admin: Get pending payouts
  async getPendingPayouts() {
    try {
      const response = await api.get('/payouts/admin/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending payouts:', error);
      throw error;
    }
  },

  // Admin: Approve payout
  async approvePayout(payoutId, comments = '') {
    try {
      const response = await api.put(`/payouts/admin/${payoutId}/approve`, {
        comments
      });
      return response.data;
    } catch (error) {
      console.error('Error approving payout:', error);
      throw error;
    }
  },

  // Admin: Reject payout
  async rejectPayout(payoutId, reason, comments = '') {
    try {
      const response = await api.put(`/payouts/admin/${payoutId}/reject`, {
        reason,
        comments
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting payout:', error);
      throw error;
    }
  },

  // Admin: Complete payout
  async completePayout(payoutId, utr = '', comments = '') {
    try {
      const response = await api.put(`/payouts/admin/${payoutId}/complete`, {
        utr,
        comments
      });
      return response.data;
    } catch (error) {
      console.error('Error completing payout:', error);
      throw error;
    }
  },

  // Admin: Get all payouts with filters
  async getAllPayouts(options = {}) {
    try {
      const {
        status = null,
        limit = 50,
        skip = 0,
        startDate = null,
        endDate = null
      } = options;

      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('skip', skip.toString());

      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/payouts/admin/all?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all payouts:', error);
      throw error;
    }
  },

  // Format currency for display
  formatCurrency(amount, currency = 'INR') {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });
    return formatter.format(amount);
  },

  // Get transaction type display text
  getTransactionTypeText(type) {
    const typeMap = {
      'credit': 'Credit',
      'debit': 'Debit',
      'platform_commission': 'Platform Commission'
    };
    return typeMap[type] || type;
  },

  // Get transaction category display text
  getTransactionCategoryText(category) {
    const categoryMap = {
      'sale': 'Sale Commission',
      'payout': 'Payout Withdrawal',
      'refund': 'Refund',
      'adjustment': 'Adjustment',
      'bonus': 'Bonus',
      'penalty': 'Penalty'
    };
    return categoryMap[category] || category;
  },

  // Get payout status display text
  getPayoutStatusText(status) {
    const statusMap = {
      'pending': 'Pending Review',
      'approved': 'Approved',
      'processing': 'Processing',
      'completed': 'Completed',
      'failed': 'Failed',
      'cancelled': 'Cancelled',
      'rejected': 'Rejected'
    };
    return statusMap[status] || status;
  },

  // Get payout status color
  getPayoutStatusColor(status) {
    const colorMap = {
      'pending': 'warning',
      'approved': 'info',
      'processing': 'info',
      'completed': 'success',
      'failed': 'error',
      'cancelled': 'secondary',
      'rejected': 'error'
    };
    return colorMap[status] || 'secondary';
  },

  // Get transaction type color
  getTransactionTypeColor(type) {
    const colorMap = {
      'credit': 'success',
      'debit': 'error',
      'platform_commission': 'info'
    };
    return colorMap[type] || 'secondary';
  },

  // Validate bank details
  validateBankDetails(bankDetails) {
    const errors = [];

    if (!bankDetails.accountNumber || bankDetails.accountNumber.trim().length < 9) {
      errors.push('Account number must be at least 9 digits');
    }

    if (!bankDetails.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode)) {
      errors.push('Invalid IFSC code format');
    }

    if (!bankDetails.accountHolderName || bankDetails.accountHolderName.trim().length < 2) {
      errors.push('Account holder name is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate payout amount
  validatePayoutAmount(amount, availableBalance) {
    const errors = [];

    if (!amount || amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (amount < 250) {
      errors.push('Minimum payout amount is ₹250');
    }

    if (amount > availableBalance) {
      errors.push(`Insufficient balance. Available: ₹${availableBalance}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default walletService;
