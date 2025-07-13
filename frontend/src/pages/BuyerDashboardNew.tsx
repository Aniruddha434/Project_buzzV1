import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { userService } from '../services/userService.js';
import paymentService from '../services/paymentService.js';
import { projectService } from '../services/projectService.js';
import { Link, useLocation } from 'react-router-dom';
import { NegotiationDashboard } from '../components/NegotiationDashboard';

interface Project {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  seller: {
    displayName: string;
    photoURL?: string;
  };
  stats: {
    views: number;
    sales: number;
  };
  createdAt: string;
  // New enhanced project information fields
  completionStatus?: number;
  documentationFiles?: Array<{
    url: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    uploadedAt: string;
    fileType: 'readme' | 'technical' | 'specification';
    description?: string;
  }>;
  projectDetails?: {
    timeline?: string;
    techStack?: string;
    complexityLevel?: 'beginner' | 'intermediate' | 'advanced';
    installationInstructions?: string;
    usageInstructions?: string;
    prerequisites?: string;
  };
}

interface Payment {
  _id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  project: {
    _id: string;
    title: string;
    price: number;
    category: string;
  };
  paymentTime?: string;
  createdAt: string;
}

interface UserProfile {
  _id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  stats: {
    projectsPurchased: number;
    totalSpent: number;
  };
  preferences: {
    // Simplified preferences structure - reserved for future essential preferences only
  };
}

const BuyerDashboardNew: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [purchases, setPurchases] = useState<Project[]>([]);
  const [accuratePurchaseCount, setAccuratePurchaseCount] = useState<number>(0);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'purchases' | 'payments' | 'negotiations' | 'settings'>('overview');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeUsername, setShowChangeUsername] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [usernameForm, setUsernameForm] = useState({
    newDisplayName: ''
  });

  const fetchUserProfile = async () => {
    try {
      const response = await userService.getProfile();
      console.log('👤 User profile response:', response);
      // The response structure is { success: true, data: user }
      setUserProfile(response.data);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError('Failed to fetch user profile.');
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await userService.getPurchases();
      console.log('Purchases API response:', response);

      // Handle the new API response structure with metadata
      if (response.success && response.data) {
        if (response.data.purchases) {
          // New structure with purchases array and metadata
          setPurchases(response.data.purchases || []);

          // Store the accurate count from Payment collection
          const accurateCount = response.data.count || 0;
          setAccuratePurchaseCount(accurateCount);

          console.log('📊 Purchase metadata:', response.data.metadata);
          console.log('📊 Accurate purchase count from Payment collection:', accurateCount);
        } else if (Array.isArray(response.data)) {
          // Fallback for direct array response (legacy)
          setPurchases(response.data);
          setAccuratePurchaseCount(response.data.length);
        } else {
          console.warn('Unexpected purchases response structure:', response);
          setPurchases([]);
          setAccuratePurchaseCount(0);
        }
      } else {
        console.warn('Invalid purchases response:', response);
        setPurchases([]);
        setAccuratePurchaseCount(0);
      }
    } catch (err: any) {
      console.error('Error fetching purchases:', err);
      setPurchases([]); // Ensure purchases is always an array
      setAccuratePurchaseCount(0);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await paymentService.getPaymentHistory({ limit: 20 });
      console.log('Payment history API response:', response);

      // Handle the correct data structure
      if (response.success && response.data && response.data.payments) {
        setPaymentHistory(response.data.payments || []);
      } else if (Array.isArray(response.data)) {
        // Fallback for direct array response
        setPaymentHistory(response.data);
      } else {
        console.warn('Unexpected payment history response structure:', response);
        setPaymentHistory([]);
      }
    } catch (err: any) {
      console.error('Error fetching payment history:', err);
      setPaymentHistory([]); // Ensure paymentHistory is always an array
    }
  };

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        try {
          await Promise.all([
            fetchUserProfile(),
            fetchPurchases(),
            fetchPaymentHistory()
          ]);
        } catch (err) {
          console.error('Error fetching dashboard data:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  // Handle URL parameters and pathname for direct navigation to tabs
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');

    // Check if we're on the /dashboard/purchases route
    if (location.pathname === '/dashboard/purchases') {
      setActiveTab('purchases');
    } else if (tabParam === 'settings') {
      setActiveTab('settings');
    } else if (tabParam === 'purchases') {
      setActiveTab('purchases');
    } else if (tabParam === 'payments') {
      setActiveTab('payments');
    } else if (tabParam === 'negotiations') {
      setActiveTab('negotiations');
    }
  }, [location.search, location.pathname]);

  const handleDownload = async (projectId: string) => {
    try {
      setError(null);
      await projectService.downloadProjectZip(projectId);
      setSuccess('Download started successfully!');
    } catch (err: any) {
      console.error('Error downloading project:', err);
      let errorMessage = err.response?.data?.message || err.message || 'Failed to download project';

      // Provide more helpful error messages
      if (errorMessage.includes('ZIP file not available') || errorMessage.includes('does not have a downloadable ZIP file')) {
        errorMessage = 'This project does not have a downloadable ZIP file. Please contact the seller for access to the source code or check if GitHub access is available.';
      }

      setError(errorMessage);
    }
  };

  const handleFixStats = async () => {
    try {
      setSettingsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await userService.fixStats();
      console.log('📊 Stats fix response:', response);

      if (response.success) {
        setSuccess('Purchase statistics have been updated successfully!');
        // Refresh user profile and purchases to get updated data
        await Promise.all([
          fetchUserProfile(),
          fetchPurchases()
        ]);
      } else {
        setError('Failed to fix statistics');
      }
    } catch (err: any) {
      console.error('Error fixing stats:', err);
      setError(`Failed to fix statistics: ${err.message}`);
    } finally {
      setSettingsLoading(false);
    }
  };



  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side validation
    if (!passwordForm.currentPassword.trim()) {
      setError('Current password is required');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    try {
      setSettingsLoading(true);

      const response = await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.success) {
        setSuccess('Password changed successfully!');
        setShowChangePassword(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(response.message || 'Failed to change password');
      }
    } catch (err: any) {
      console.error('Error changing password:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to change password';
      setError(errorMessage);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side validation
    const newDisplayName = usernameForm.newDisplayName.trim();

    if (!newDisplayName) {
      setError('Display name cannot be empty');
      return;
    }

    if (newDisplayName.length < 1 || newDisplayName.length > 50) {
      setError('Display name must be between 1 and 50 characters');
      return;
    }

    if (newDisplayName === userProfile?.displayName) {
      setError('New display name must be different from current name');
      return;
    }

    // Basic validation for inappropriate characters
    if (!/^[a-zA-Z0-9\s._-]+$/.test(newDisplayName)) {
      setError('Display name can only contain letters, numbers, spaces, dots, underscores, and hyphens');
      return;
    }

    try {
      setSettingsLoading(true);

      const response = await userService.updateProfile({
        displayName: newDisplayName
      });

      if (response.success) {
        // Update local state
        setUserProfile(prev => prev ? { ...prev, displayName: newDisplayName } : null);
        setSuccess('Display name updated successfully!');
        setShowChangeUsername(false);
        setUsernameForm({ newDisplayName: '' });

        // Refresh user profile to get latest data
        await fetchUserProfile();
      } else {
        setError(response.message || 'Failed to update display name');
      }
    } catch (err: any) {
      console.error('Error updating display name:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update display name';
      setError(errorMessage);
    } finally {
      setSettingsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black dashboard-navbar-fix">
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">My Account</h1>
          <p className="mt-2 text-lg text-muted-foreground">Manage your purchases, payments, and account settings.</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md shadow-sm" role="alert">
            <strong className="font-semibold">Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md shadow-sm" role="alert">
            <strong className="font-semibold">Success:</strong> {success}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-border">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'purchases', label: 'My Purchases', icon: '🛍️' },
              { id: 'payments', label: 'Payment History', icon: '💳' },
              { id: 'negotiations', label: 'Negotiations', icon: '💬' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Account Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                    <p className="text-3xl font-bold text-primary">
                      {(() => {
                        // Debug logging
                        console.log('📊 User profile stats:', userProfile?.stats);
                        console.log('📊 Purchases array length:', purchases?.length);
                        console.log('📊 Accurate purchase count:', accuratePurchaseCount);

                        // Use accurate count from Payment collection as the authoritative source
                        const statsCount = userProfile?.stats?.projectsPurchased || 0;
                        const purchasesCount = Array.isArray(purchases) ? purchases.length : 0;

                        console.log('📊 Stats count:', statsCount, 'Purchases count:', purchasesCount, 'Accurate count:', accuratePurchaseCount);

                        // Always use accurate count from Payment collection
                        // This ensures we show the correct count immediately upon dashboard load
                        return accuratePurchaseCount;
                      })()}
                    </p>
                  </div>
                  <div className="text-4xl">🛍️</div>
                </div>
              </div>

              {/* Debug Section - Show when there's a discrepancy */}
              {(() => {
                const statsCount = userProfile?.stats?.projectsPurchased || 0;
                const purchasesCount = Array.isArray(purchases) ? purchases.length : 0;

                // Check if user stats are out of sync with the accurate count
                const hasDiscrepancy = statsCount !== accuratePurchaseCount;

                if (hasDiscrepancy && accuratePurchaseCount > 0) {
                  return (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-yellow-400 mb-2">
                            ⚠️ Purchase Count Discrepancy Detected
                          </h4>
                          <p className="text-sm text-yellow-300 mb-2">
                            Your user statistics appear to be out of sync with the actual payment records:
                          </p>
                          <ul className="text-sm text-yellow-300 space-y-1">
                            <li>• User Stats Count: <strong>{statsCount}</strong></li>
                            <li>• Actual Paid Purchases: <strong>{accuratePurchaseCount}</strong></li>
                            <li>• Projects Found: <strong>{purchasesCount}</strong></li>
                            <li>• Difference: <strong>{Math.abs(statsCount - accuratePurchaseCount)}</strong></li>
                          </ul>
                        </div>
                        <button
                          onClick={handleFixStats}
                          disabled={settingsLoading}
                          className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {settingsLoading ? 'Fixing...' : 'Fix Statistics'}
                        </button>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  to="/market"
                  className="flex items-center p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors duration-200"
                >
                  <span className="text-2xl mr-3">🔍</span>
                  <div>
                    <p className="font-medium text-foreground">Browse Market</p>
                    <p className="text-sm text-muted-foreground">Discover new projects</p>
                  </div>
                </Link>

                <button
                  onClick={() => setActiveTab('purchases')}
                  className="flex items-center p-4 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors duration-200"
                >
                  <span className="text-2xl mr-3">📦</span>
                  <div>
                    <p className="font-medium text-foreground">My Purchases</p>
                    <p className="text-sm text-muted-foreground">Access purchased projects</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('payments')}
                  className="flex items-center p-4 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors duration-200"
                >
                  <span className="text-2xl mr-3">💳</span>
                  <div>
                    <p className="font-medium text-foreground">Payment History</p>
                    <p className="text-sm text-muted-foreground">View transactions</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className="flex items-center p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-200"
                >
                  <span className="text-2xl mr-3">⚙️</span>
                  <div>
                    <p className="font-medium text-foreground">Account Settings</p>
                    <p className="text-sm text-muted-foreground">Manage preferences</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Purchases Preview */}
            {Array.isArray(purchases) && purchases.length > 0 && (
              <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground">Recent Purchases</h3>
                  <button
                    onClick={() => setActiveTab('purchases')}
                    className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.isArray(purchases) && purchases.slice(0, 3).map((project) => (
                    <div key={project._id} className="border border-border rounded-lg p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200 bg-background">
                      <h4 className="font-medium text-foreground mb-2">{project.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-400">{formatCurrency(project.price)}</span>
                        <button
                          onClick={() => handleDownload(project._id)}
                          className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition duration-150"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-6">My Purchased Projects</h3>
              {!Array.isArray(purchases) || purchases.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🛍️</div>
                  <h4 className="text-xl font-medium text-foreground mb-2">No purchases yet</h4>
                  <p className="text-muted-foreground mb-6">Start exploring our amazing projects!</p>
                  <Link
                    to="/projects"
                    className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition duration-150"
                  >
                    Browse Projects
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.isArray(purchases) && purchases.map((project) => (
                    <div key={project._id} className="border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-200 bg-background">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground capitalize">{project.category}</span>
                          {project.projectDetails?.complexityLevel && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                              project.projectDetails.complexityLevel === 'beginner' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              project.projectDetails.complexityLevel === 'intermediate' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {project.projectDetails.complexityLevel}
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          Purchased
                        </span>
                      </div>

                      <h4 className="text-lg font-semibold text-foreground mb-2">{project.title}</h4>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{project.description}</p>

                      {/* Enhanced Project Information */}
                      {project.projectDetails?.techStack && (
                        <div className="mb-3 p-2 bg-blue-500/10 rounded-md border border-blue-500/20">
                          <p className="text-xs font-medium text-blue-400 mb-1">Tech Stack</p>
                          <p className="text-xs text-blue-300">{project.projectDetails.techStack}</p>
                        </div>
                      )}

                      {/* Completion Status */}
                      {project.completionStatus !== undefined && project.completionStatus < 100 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Completion Status</span>
                            <span>{project.completionStatus}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.completionStatus}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Documentation Files */}
                      {project.documentationFiles && project.documentationFiles.length > 0 && (
                        <div className="mb-3 p-2 bg-purple-500/10 rounded-md border border-purple-500/20">
                          <p className="text-xs font-medium text-purple-400 mb-1">
                            📚 Documentation ({project.documentationFiles.length} files)
                          </p>
                          <div className="space-y-1">
                            {project.documentationFiles.slice(0, 2).map((doc, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-xs text-purple-300">{doc.originalName}</span>
                                <button
                                  onClick={async () => {
                                    try {
                                      await projectService.downloadDocumentationFile(doc.filename, doc.originalName);
                                    } catch (error: any) {
                                      console.error('Documentation download failed:', error);
                                      setError(`Failed to download ${doc.originalName}: ${error.message}`);
                                    }
                                  }}
                                  className="text-xs text-purple-400 hover:text-purple-300 underline cursor-pointer transition-colors duration-200"
                                >
                                  Download
                                </button>
                              </div>
                            ))}
                            {project.documentationFiles.length > 2 && (
                              <p className="text-xs text-purple-400">+{project.documentationFiles.length - 2} more files</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center mb-4">
                        {project.seller?.photoURL && (
                          <img src={project.seller.photoURL} alt={project.seller.displayName || 'Seller'} className="w-6 h-6 rounded-full mr-2" />
                        )}
                        <span className="text-sm text-muted-foreground">by {project.seller?.displayName || 'Unknown Seller'}</span>
                      </div>

                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {project.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-green-400">{formatCurrency(project.price)}</span>
                        <div className="flex space-x-2">
                          <Link
                            to={`/project/${project._id}`}
                            className="px-3 py-2 bg-muted text-foreground text-sm rounded-md hover:bg-muted/80 transition duration-150"
                          >
                            View Details
                          </Link>
                          {(project as any).projectZipFile ? (
                            <button
                              onClick={() => handleDownload(project._id)}
                              className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition duration-150 flex items-center space-x-1"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>Download ZIP</span>
                            </button>
                          ) : (
                            <div className="px-4 py-2 bg-muted/50 text-muted-foreground text-sm rounded-md flex items-center space-x-1">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              <span>GitHub Access</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-6">Payment History</h3>
              {!Array.isArray(paymentHistory) || paymentHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💳</div>
                  <h4 className="text-xl font-medium text-foreground mb-2">No payment history</h4>
                  <p className="text-muted-foreground">Your payment transactions will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Project
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {Array.isArray(paymentHistory) && paymentHistory.map((payment) => (
                        <tr key={payment._id} className="hover:bg-muted/30 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                            {payment.orderId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-foreground">{payment.project.title}</div>
                              <div className="text-sm text-muted-foreground capitalize">{payment.project.category}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                              payment.status === 'PAID'
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : payment.status === 'PENDING' || payment.status === 'ACTIVE'
                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {formatDate(payment.paymentTime || payment.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Negotiations Tab */}
        {activeTab === 'negotiations' && (
          <div className="space-y-6">
            <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground flex items-center">
                    <span className="text-2xl mr-3">💬</span>
                    My Negotiations
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    View and manage your price negotiations with sellers
                  </p>
                </div>
              </div>
              <NegotiationDashboard userRole="buyer" />
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-6">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Display Name</label>
                  <input
                    type="text"
                    value={userProfile?.displayName || ''}
                    className="w-full px-4 py-2 border border-border rounded-md bg-muted/50 text-foreground"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={userProfile?.email || ''}
                    className="w-full px-4 py-2 border border-border rounded-md bg-muted/50 text-foreground"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                  <input
                    type="text"
                    value={userProfile?.role || ''}
                    className="w-full px-4 py-2 border border-border rounded-md bg-muted/50 text-foreground capitalize"
                    disabled
                  />
                </div>
              </div>
            </div>



            {/* Account Security */}
            <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-6">Account Security</h3>
              <div className="space-y-4">
                {/* Change Password */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Password</h4>
                    <p className="text-sm text-muted-foreground">Update your account password</p>
                  </div>
                  <button
                    onClick={() => {
                      setError(null);
                      setSuccess(null);
                      setShowChangePassword(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 border border-primary rounded-md hover:bg-primary/10 transition duration-150"
                  >
                    Change Password
                  </button>
                </div>

                {/* Change Username */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Display Name</h4>
                    <p className="text-sm text-muted-foreground">Current: {userProfile?.displayName || 'Not set'}</p>
                  </div>
                  <button
                    onClick={() => {
                      setError(null);
                      setSuccess(null);
                      setUsernameForm({ newDisplayName: userProfile?.displayName || '' });
                      setShowChangeUsername(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 border border-primary rounded-md hover:bg-primary/10 transition duration-150"
                  >
                    Change Username
                  </button>
                </div>

                {/* Account Status */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Account Status</h4>
                    <p className="text-sm text-muted-foreground">Your account is active and verified</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                    Active
                  </span>
                </div>
              </div>

              {/* Change Password Modal */}
              {showChangePassword && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4 border border-border shadow-xl">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Change Password</h3>

                    {/* Display errors in modal */}
                    {error && (
                      <div className="mb-4 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                          required
                          placeholder="Enter your current password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                          required
                          minLength={6}
                          placeholder="Enter new password (min 6 characters)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                          required
                          minLength={6}
                          placeholder="Confirm your new password"
                        />
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowChangePassword(false);
                            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setError(null);
                          }}
                          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted transition duration-150"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={settingsLoading}
                          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {settingsLoading ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Change Username Modal */}
              {showChangeUsername && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4 border border-border shadow-xl">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Change Display Name</h3>

                    {/* Display errors in modal */}
                    {error && (
                      <div className="mb-4 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleChangeUsername} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">New Display Name</label>
                        <input
                          type="text"
                          value={usernameForm.newDisplayName}
                          onChange={(e) => setUsernameForm(prev => ({ ...prev, newDisplayName: e.target.value }))}
                          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                          required
                          maxLength={50}
                          placeholder="Enter your new display name"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Current: {userProfile?.displayName || 'Not set'}
                        </p>
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowChangeUsername(false);
                            setUsernameForm({ newDisplayName: '' });
                            setError(null);
                          }}
                          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted transition duration-150"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={settingsLoading}
                          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {settingsLoading ? 'Updating...' : 'Update Name'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboardNew;
