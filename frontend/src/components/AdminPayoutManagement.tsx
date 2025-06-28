import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Download,
  User,
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  DollarSign,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Banknote
} from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import LoadingSpinner from './ui/LoadingSpinner';
import walletService from '../services/walletService.js';

interface PayoutRequest {
  _id: string;
  payoutId: string;
  user: {
    _id: string;
    email: string;
    displayName: string;
  };
  amount: number;
  amountInRupees: number;
  netAmount: number;
  netAmountInRupees: number;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
  processedAt?: string;
  completedAt?: string;
  failedAt?: string;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName?: string;
  };
  adminReview?: {
    reviewedBy: {
      _id: string;
      email: string;
      displayName: string;
    };
    reviewedAt: string;
    action: string;
    comments?: string;
    rejectionReason?: string;
  };
  razorpayDetails?: {
    payoutId?: string;
    utr?: string;
    fees?: number;
    tax?: number;
    failureReason?: string;
  };
}

interface FilterOptions {
  status: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
  userSearch: string;
}

interface SortOptions {
  field: 'requestedAt' | 'amount' | 'status' | 'user';
  direction: 'asc' | 'desc';
}

interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

const AdminPayoutManagement: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'approve' | 'reject' | 'complete'>('view');
  const [actionLoading, setActionLoading] = useState(false);

  // Filters and sorting
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    userSearch: ''
  });

  const [sort, setSort] = useState<SortOptions>({
    field: 'requestedAt',
    direction: 'desc'
  });

  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    limit: 20,
    total: 0
  });

  // Review form
  const [reviewForm, setReviewForm] = useState({
    action: '',
    reason: '',
    comments: '',
    utr: ''
  });

  useEffect(() => {
    fetchPayouts();
  }, [filters, sort, pagination.page, pagination.limit]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams: any = {
        limit: pagination.limit,
        skip: (pagination.page - 1) * pagination.limit
      };

      if (filters.status !== 'all') {
        queryParams.status = filters.status;
      }

      if (filters.dateFrom) {
        queryParams.startDate = filters.dateFrom;
      }

      if (filters.dateTo) {
        queryParams.endDate = filters.dateTo;
      }

      const response = await walletService.getAllPayouts(queryParams);

      if (response.success) {
        let filteredPayouts = response.data.payouts;

        // Apply client-side filters
        if (filters.userSearch) {
          const searchTerm = filters.userSearch.toLowerCase();
          filteredPayouts = filteredPayouts.filter((payout: PayoutRequest) =>
            payout.user.displayName.toLowerCase().includes(searchTerm) ||
            payout.user.email.toLowerCase().includes(searchTerm)
          );
        }

        if (filters.minAmount) {
          const minAmount = parseFloat(filters.minAmount);
          filteredPayouts = filteredPayouts.filter((payout: PayoutRequest) =>
            payout.amountInRupees >= minAmount
          );
        }

        if (filters.maxAmount) {
          const maxAmount = parseFloat(filters.maxAmount);
          filteredPayouts = filteredPayouts.filter((payout: PayoutRequest) =>
            payout.amountInRupees <= maxAmount
          );
        }

        // Apply sorting
        filteredPayouts.sort((a: PayoutRequest, b: PayoutRequest) => {
          let aValue: any, bValue: any;

          switch (sort.field) {
            case 'requestedAt':
              aValue = new Date(a.requestedAt).getTime();
              bValue = new Date(b.requestedAt).getTime();
              break;
            case 'amount':
              aValue = a.amountInRupees;
              bValue = b.amountInRupees;
              break;
            case 'status':
              aValue = a.status;
              bValue = b.status;
              break;
            case 'user':
              aValue = a.user.displayName.toLowerCase();
              bValue = b.user.displayName.toLowerCase();
              break;
            default:
              aValue = a.requestedAt;
              bValue = b.requestedAt;
          }

          if (sort.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        setPayouts(filteredPayouts);
        setPagination(prev => ({
          ...prev,
          total: response.data.total
        }));
      }
    } catch (error: any) {
      console.error('Error fetching payouts:', error);
      setError('Failed to fetch payout history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayout = (payout: PayoutRequest, type: 'view' | 'approve' | 'reject' | 'complete' = 'view') => {
    setSelectedPayout(payout);
    setModalType(type);
    setShowModal(true);
    setReviewForm({
      action: type === 'approve' ? 'approve' : type === 'reject' ? 'reject' : '',
      reason: '',
      comments: '',
      utr: ''
    });
    setError(null);
    setSuccess(null);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleSortChange = (field: SortOptions['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      userSearch: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleApprovePayout = async () => {
    if (!selectedPayout) return;

    try {
      setActionLoading(true);
      setError(null);

      const response = await walletService.approvePayout(
        selectedPayout.payoutId,
        reviewForm.comments
      );

      if (response.success) {
        setSuccess('Payout approved and wallet debited successfully!');
        setShowModal(false);
        setSelectedPayout(null);
        await fetchPayouts();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error: any) {
      console.error('Error approving payout:', error);
      setError(error.response?.data?.message || 'Failed to approve payout');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayout = async () => {
    if (!selectedPayout || !reviewForm.reason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const response = await walletService.rejectPayout(
        selectedPayout.payoutId,
        reviewForm.reason,
        reviewForm.comments
      );

      if (response.success) {
        setSuccess('Payout rejected successfully!');
        setShowModal(false);
        setSelectedPayout(null);
        await fetchPayouts();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error: any) {
      console.error('Error rejecting payout:', error);
      setError(error.response?.data?.message || 'Failed to reject payout');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompletePayout = async () => {
    if (!selectedPayout) return;

    try {
      setActionLoading(true);
      setError(null);

      const response = await walletService.completePayout(
        selectedPayout.payoutId,
        reviewForm.utr,
        reviewForm.comments
      );

      if (response.success) {
        setSuccess('Payout marked as completed successfully!');
        setShowModal(false);
        setSelectedPayout(null);
        await fetchPayouts();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error: any) {
      console.error('Error completing payout:', error);
      setError(error.response?.data?.message || 'Failed to complete payout');
    } finally {
      setActionLoading(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Download className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const canApprove = (payout: PayoutRequest) => payout.status === 'pending';
  const canReject = (payout: PayoutRequest) => payout.status === 'pending';
  const canComplete = (payout: PayoutRequest) => payout.status === 'processing';

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Payout History & Management</h2>
          <p className="text-muted-foreground">Comprehensive payout management and history tracking</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {pagination.total} total payout{pagination.total !== 1 ? 's' : ''}
          </div>
          <Button onClick={fetchPayouts} variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Error & Success Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-600 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Filters Section */}
      <Card className="p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </h3>
          <Button onClick={clearFilters} variant="outline" size="sm">
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>

          {/* Min Amount */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Min Amount (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              placeholder="0"
            />
          </div>

          {/* Max Amount */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Max Amount (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              placeholder="No limit"
            />
          </div>

          {/* User Search */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Search User</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={filters.userSearch}
                onChange={(e) => handleFilterChange('userSearch', e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                placeholder="Name or email"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            Showing {startIndex}-{endIndex} of {pagination.total} payouts
          </span>
          <select
            value={pagination.limit}
            onChange={(e) => handleLimitChange(parseInt(e.target.value))}
            className="px-3 py-1 bg-background border border-border rounded-md text-sm text-foreground"
          >
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        {/* Pagination */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            variant="outline"
            size="sm"
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {totalPages}
          </span>

          <Button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= totalPages}
            variant="outline"
            size="sm"
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Payouts Table */}
      {payouts.length === 0 ? (
        <Card className="p-8 text-center border border-border">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No payouts found</h3>
          <p className="text-muted-foreground">No payout requests match your current filters.</p>
        </Card>
      ) : (
        <Card className="border border-border">
          {/* Table Header */}
          <div className="p-4 border-b border-border">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
              <div className="col-span-2">
                <button
                  onClick={() => handleSortChange('requestedAt')}
                  className="flex items-center space-x-1 hover:text-foreground"
                >
                  <span>Date</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </div>
              <div className="col-span-2">
                <button
                  onClick={() => handleSortChange('user')}
                  className="flex items-center space-x-1 hover:text-foreground"
                >
                  <span>User</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </div>
              <div className="col-span-2">
                <button
                  onClick={() => handleSortChange('amount')}
                  className="flex items-center space-x-1 hover:text-foreground"
                >
                  <span>Amount</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </div>
              <div className="col-span-2">Bank Details</div>
              <div className="col-span-2">
                <button
                  onClick={() => handleSortChange('status')}
                  className="flex items-center space-x-1 hover:text-foreground"
                >
                  <span>Status</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </div>
              <div className="col-span-2">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {payouts.map((payout) => (
              <div key={payout._id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Date */}
                  <div className="col-span-2">
                    <div className="text-sm text-foreground">
                      {new Date(payout.requestedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(payout.requestedAt).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      ID: {payout.payoutId.slice(-8)}
                    </div>
                  </div>

                  {/* User */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {payout.user?.displayName || 'Unknown User'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {payout.user?.email || 'Unknown Email'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="col-span-2">
                    <div className="text-sm font-semibold text-foreground">
                      {formatCurrency(payout.amountInRupees)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Net: {formatCurrency(payout.netAmountInRupees)}
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-foreground">
                          ****{payout.bankDetails?.accountNumber?.slice(-4) || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {payout.bankDetails?.ifscCode || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {payout.bankDetails?.accountHolderName || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(payout.status) as any} className="flex items-center space-x-1">
                        {getStatusIcon(payout.status)}
                        <span>{getStatusText(payout.status)}</span>
                      </Badge>
                    </div>
                    {payout.adminReview && payout.adminReview.reviewedBy && (
                      <div className="text-xs text-muted-foreground mt-1">
                        By: {payout.adminReview.reviewedBy.displayName || 'Unknown Admin'}
                      </div>
                    )}
                    {payout.razorpayDetails?.utr && (
                      <div className="text-xs text-muted-foreground mt-1">
                        UTR: {payout.razorpayDetails.utr}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleViewPayout(payout, 'view')}
                        size="sm"
                        variant="outline"
                        leftIcon={<Eye className="h-3 w-3" />}
                      >
                        View
                      </Button>

                      {canApprove(payout) && (
                        <Button
                          onClick={() => handleViewPayout(payout, 'approve')}
                          size="sm"
                          variant="success"
                          leftIcon={<CheckCircle className="h-3 w-3" />}
                        >
                          Approve
                        </Button>
                      )}

                      {canReject(payout) && (
                        <Button
                          onClick={() => handleViewPayout(payout, 'reject')}
                          size="sm"
                          variant="error"
                          leftIcon={<XCircle className="h-3 w-3" />}
                        >
                          Reject
                        </Button>
                      )}

                      {canComplete(payout) && (
                        <Button
                          onClick={() => handleViewPayout(payout, 'complete')}
                          size="sm"
                          variant="primary"
                          leftIcon={<Banknote className="h-3 w-3" />}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Enhanced Modal */}
      {showModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground flex items-center">
                {modalType === 'view' && <Eye className="h-5 w-5 mr-2" />}
                {modalType === 'approve' && <CheckCircle className="h-5 w-5 mr-2 text-green-600" />}
                {modalType === 'reject' && <XCircle className="h-5 w-5 mr-2 text-red-600" />}
                {modalType === 'complete' && <Banknote className="h-5 w-5 mr-2 text-blue-600" />}
                {modalType === 'view' && 'Payout Details'}
                {modalType === 'approve' && 'Approve Payout'}
                {modalType === 'reject' && 'Reject Payout'}
                {modalType === 'complete' && 'Complete Payout'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Comprehensive Payout Details */}
            <div className="space-y-6 mb-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4 border border-border">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-medium text-foreground">Request Details</h4>
                      <p className="text-sm text-muted-foreground">ID: {selectedPayout.payoutId}</p>
                      <p className="text-xs text-muted-foreground">
                        Requested: {new Date(selectedPayout.requestedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border border-border">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div>
                      <h4 className="font-medium text-foreground">Amount</h4>
                      <p className="text-lg font-semibold text-foreground">
                        {formatCurrency(selectedPayout.amountInRupees)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Net: {formatCurrency(selectedPayout.netAmountInRupees)}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border border-border">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(selectedPayout.status)}
                    <div>
                      <h4 className="font-medium text-foreground">Status</h4>
                      <Badge variant={getStatusColor(selectedPayout.status) as any}>
                        {getStatusText(selectedPayout.status)}
                      </Badge>
                      {selectedPayout.adminReview && selectedPayout.adminReview.reviewedBy && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reviewed by: {selectedPayout.adminReview.reviewedBy.displayName || 'Unknown Admin'}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* User Information */}
              <Card className="p-4 border border-border">
                <h4 className="font-medium text-foreground mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Seller Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                    <p className="text-sm text-foreground">
                      {selectedPayout.user?.displayName || 'Unknown User'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                    <p className="text-sm text-foreground">
                      {selectedPayout.user?.email || 'Unknown Email'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Bank Details */}
              <Card className="p-4 border border-border">
                <h4 className="font-medium text-foreground mb-3 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Bank Account Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Account Number</label>
                    <p className="text-sm text-foreground font-mono">
                      {selectedPayout.bankDetails?.accountNumber || 'Not Available'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">IFSC Code</label>
                    <p className="text-sm text-foreground font-mono">
                      {selectedPayout.bankDetails?.ifscCode || 'Not Available'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Account Holder Name</label>
                    <p className="text-sm text-foreground">
                      {selectedPayout.bankDetails?.accountHolderName || 'Not Available'}
                    </p>
                  </div>
                  {selectedPayout.bankDetails?.bankName && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Bank Name</label>
                      <p className="text-sm text-foreground">{selectedPayout.bankDetails.bankName}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Timeline */}
              {(selectedPayout.approvedAt || selectedPayout.processedAt || selectedPayout.completedAt || selectedPayout.failedAt) && (
                <Card className="p-4 border border-border">
                  <h4 className="font-medium text-foreground mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Timeline
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-foreground">
                        Requested: {new Date(selectedPayout.requestedAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedPayout.approvedAt && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-foreground">
                          Approved: {new Date(selectedPayout.approvedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedPayout.processedAt && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-foreground">
                          Processing: {new Date(selectedPayout.processedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedPayout.completedAt && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="text-sm text-foreground">
                          Completed: {new Date(selectedPayout.completedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedPayout.failedAt && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-foreground">
                          Failed: {new Date(selectedPayout.failedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* UTR Information */}
              {selectedPayout.razorpayDetails?.utr && (
                <Card className="p-4 border border-border">
                  <h4 className="font-medium text-foreground mb-3">Transaction Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">UTR Number</label>
                      <p className="text-sm text-foreground font-mono">{selectedPayout.razorpayDetails.utr}</p>
                    </div>
                    {selectedPayout.razorpayDetails.fees && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Processing Fees</label>
                        <p className="text-sm text-foreground">₹{(selectedPayout.razorpayDetails.fees / 100).toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Admin Review */}
              {selectedPayout.adminReview && (
                <Card className="p-4 border border-border">
                  <h4 className="font-medium text-foreground mb-3">Admin Review</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Reviewed By</label>
                        <p className="text-sm text-foreground">
                          {selectedPayout.adminReview.reviewedBy?.displayName || 'Unknown Admin'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Review Date</label>
                        <p className="text-sm text-foreground">
                          {new Date(selectedPayout.adminReview.reviewedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {selectedPayout.adminReview.rejectionReason && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Rejection Reason</label>
                        <p className="text-sm text-red-600">{selectedPayout.adminReview.rejectionReason}</p>
                      </div>
                    )}
                    {selectedPayout.adminReview.comments && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Comments</label>
                        <p className="text-sm text-foreground">{selectedPayout.adminReview.comments}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Action Forms */}
            {modalType !== 'view' && (
              <Card className="p-4 border border-border mb-6">
                <h4 className="font-medium text-foreground mb-4">
                  {modalType === 'approve' && 'Approve Payout'}
                  {modalType === 'reject' && 'Reject Payout'}
                  {modalType === 'complete' && 'Complete Payout'}
                </h4>

                {modalType === 'reject' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Rejection Reason *
                      </label>
                      <select
                        value={reviewForm.reason}
                        onChange={(e) => setReviewForm({ ...reviewForm, reason: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        required
                      >
                        <option value="">Select a reason</option>
                        <option value="insufficient_documentation">Insufficient Documentation</option>
                        <option value="invalid_bank_details">Invalid Bank Details</option>
                        <option value="suspicious_activity">Suspicious Activity</option>
                        <option value="policy_violation">Policy Violation</option>
                        <option value="technical_issues">Technical Issues</option>
                        <option value="compliance_check_failed">Compliance Check Failed</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

                {modalType === 'complete' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        UTR Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={reviewForm.utr}
                        onChange={(e) => setReviewForm({ ...reviewForm, utr: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        placeholder="Enter UTR number from bank transfer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Unique Transaction Reference number from the bank transfer
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={reviewForm.comments}
                    onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="Add any additional comments..."
                  />
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              {modalType === 'approve' && (
                <Button
                  onClick={handleApprovePayout}
                  disabled={actionLoading}
                  leftIcon={<CheckCircle className="h-4 w-4" />}
                  variant="success"
                  className="flex-1"
                >
                  {actionLoading ? 'Approving & Debiting Wallet...' : 'Approve Payout'}
                </Button>
              )}

              {modalType === 'reject' && (
                <Button
                  onClick={handleRejectPayout}
                  disabled={actionLoading || !reviewForm.reason}
                  leftIcon={<XCircle className="h-4 w-4" />}
                  variant="error"
                  className="flex-1"
                >
                  {actionLoading ? 'Rejecting...' : 'Reject Payout'}
                </Button>
              )}

              {modalType === 'complete' && (
                <Button
                  onClick={handleCompletePayout}
                  disabled={actionLoading}
                  leftIcon={<Banknote className="h-4 w-4" />}
                  variant="primary"
                  className="flex-1"
                >
                  {actionLoading ? 'Completing...' : 'Mark as Completed'}
                </Button>
              )}

              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="flex-1"
              >
                {modalType === 'view' ? 'Close' : 'Cancel'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Pagination */}
      {payouts.length > 0 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex}-{endIndex} of {pagination.total} payouts
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground px-3">
              Page {pagination.page} of {totalPages}
            </span>

            <Button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              variant="outline"
              size="sm"
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayoutManagement;
