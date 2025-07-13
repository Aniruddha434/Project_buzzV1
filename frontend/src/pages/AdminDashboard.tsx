import React, { useState, useEffect, useMemo } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Package, TrendingUp, DollarSign, Eye, Download,
  CheckCircle, XCircle, Clock, AlertTriangle, Settings,
  BarChart3, PieChart, Activity, Shield, Database,
  Edit3, Trash2, Search, Filter, RefreshCw, Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { adminService } from '../services/adminService.js';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AdminProjectModal from '../components/AdminProjectModal';
import AdminPayoutManagement from '../components/AdminPayoutManagement';
import AdminThemeWrapper from '../components/AdminThemeWrapper';

// Interface for Project data
interface Project {
  _id: string;
  title: string;
  description: string;
  price: number;
  file?: {
    url: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
  };
  githubRepo?: string;
  category: string;
  tags: string[];
  seller: {
    _id: string;
    displayName: string;
    email: string;
    photoURL?: string;
  };
  buyers: Array<{
    user: string;
    purchasedAt: string;
    downloadCount: number;
  }>;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
  stats: {
    views: number;
    downloads: number;
    sales: number;
    revenue: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Interface for User data for Admin display
interface AdminUser {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'buyer' | 'seller' | 'admin';
  emailVerified: boolean;
  stats: {
    totalSpent: number;
    totalEarned: number;
    projectsPurchased: number;
    projectsSold: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Interface for Platform Stats
interface PlatformStats {
  totalUsers: number;
  totalProjects: number;
  totalSales: number;
  totalRevenue: number;
  pendingProjects: number;
  approvedProjects: number;
  rejectedProjects: number;
  activeUsers: number;
  newUsersThisMonth: number;
  salesThisMonth: number;
  revenueThisMonth: number;
}

const AdminDashboard: FC = () => {
  const { user: adminUser, role: adminRole } = useAuth();

  // State management
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'projects' | 'payouts' | 'analytics'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchData = async () => {
    if (!adminUser || adminRole !== 'admin') return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [usersResponse, projectsResponse, statsResponse] = await Promise.all([
        adminService.getAllUsers({ limit: 1000 }),
        adminService.getAllProjects({ limit: 1000 }),
        adminService.getPlatformStats()
      ]);

      setAllUsers(usersResponse.data?.users || []);
      setAllProjects(projectsResponse.data?.projects || []);

      // Use backend-calculated stats if available, otherwise calculate client-side
      if (statsResponse.data) {
        const backendStats = statsResponse.data;
        const stats: PlatformStats = {
          totalUsers: backendStats.users?.totalUsers || 0,
          totalProjects: backendStats.projects?.totalProjects || 0,
          totalSales: backendStats.projects?.totalSales || 0,
          totalRevenue: backendStats.projects?.totalRevenue || 0,
          pendingProjects: backendStats.projects?.pendingProjects || 0,
          approvedProjects: backendStats.projects?.approvedProjects || 0,
          rejectedProjects: backendStats.projects?.rejectedProjects || 0,
          activeUsers: backendStats.users?.totalBuyers + backendStats.users?.totalSellers || 0,
          newUsersThisMonth: backendStats.users?.newUsersThisMonth || 0,
          salesThisMonth: 0, // TODO: Add to backend
          revenueThisMonth: 0 // TODO: Add to backend
        };
        setPlatformStats(stats);
      } else {
        // Fallback to client-side calculation
        const users = usersResponse.data?.users || [];
        const projects = projectsResponse.data?.projects || [];

        const stats: PlatformStats = {
          totalUsers: users.length,
          totalProjects: projects.length,
          totalSales: projects.reduce((sum, p) => sum + (p.buyers?.length || 0), 0),
          totalRevenue: projects.reduce((sum, p) => sum + (p.buyers?.length || 0) * p.price, 0),
          pendingProjects: projects.filter(p => p.status === 'pending').length,
          approvedProjects: projects.filter(p => p.status === 'approved').length,
          rejectedProjects: projects.filter(p => p.status === 'rejected').length,
          activeUsers: users.filter(u => u.stats?.projectsPurchased > 0 || u.stats?.projectsSold > 0).length,
          newUsersThisMonth: users.filter(u => {
            const createdDate = new Date(u.createdAt);
            const now = new Date();
            return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
          }).length,
          salesThisMonth: 0,
          revenueThisMonth: 0
        };
        setPlatformStats(stats);
      }

    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminUser && adminRole === 'admin') {
      fetchData();
    } else {
      setLoading(false);
      if (!adminUser) setError('Please log in to access the admin dashboard.');
      else setError('You do not have administrative access.');
    }
  }, [adminUser, adminRole]);

  // Admin action handlers
  const handleProjectStatusChange = async (projectId: string, newStatus: Project['status']) => {
    try {
      setError(null);
      await adminService.updateProjectStatus(projectId, newStatus);
      setAllProjects(prev => prev.map(p =>
        p._id === projectId ? { ...p, status: newStatus } : p
      ));
      setSuccess(`Project status updated to ${newStatus}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(`Failed to update project status: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      await adminService.deleteProject(projectId);
      setAllProjects(prev => prev.filter(p => p._id !== projectId));
      setSuccess('Project deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(`Failed to delete project: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: AdminUser['role']) => {
    try {
      setError(null);
      await adminService.updateUserRole(userId, newRole);
      setAllUsers(prev => prev.map(u =>
        u._id === userId ? { ...u, role: newRole } : u
      ));
      setSuccess(`User role updated to ${newRole}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(`Failed to update user role: ${err.response?.data?.message || err.message}`);
    }
  };

  // Filter functions
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const displayName = user.displayName || '';
      const email = user.email || '';
      const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [allUsers, searchTerm, filterRole]);

  const filteredProjects = useMemo(() => {
    return allProjects.filter(project => {
      const title = project.title || '';
      const description = project.description || '';
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [allProjects, searchTerm, filterStatus]);

  // Tab navigation
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
    { id: 'projects', label: 'Projects', icon: <Package className="h-4 w-4" /> },
    { id: 'payouts', label: 'Payouts', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <PieChart className="h-4 w-4" /> },
  ] as const;

  if (loading) {
    return (
      <AdminThemeWrapper>
        <div className="min-h-screen bg-black flex items-center justify-center pt-20">
          <LoadingSpinner size="xl" variant="static" text="Loading admin dashboard..." />
        </div>
      </AdminThemeWrapper>
    );
  }

  if (!adminUser || adminRole !== 'admin') {
    return (
      <AdminThemeWrapper>
        <div className="min-h-screen bg-black flex items-center justify-center pt-20">
          <Card variant="default" className="p-8 text-center max-w-md border border-gray-700 bg-gray-900" animate={false} hover={false}>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-400 mb-6">
              {error || 'You do not have permission to view this page.'}
            </p>
            <Link to="/">
              <Button variant="static-primary">Go to Homepage</Button>
            </Link>
          </Card>
        </div>
      </AdminThemeWrapper>
    );
  }

  return (
    <AdminThemeWrapper>
      <div className="min-h-screen bg-black dashboard-navbar-fix">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-lg text-gray-400">
                Manage platform data, users, and projects
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-3">
              <Button
                onClick={fetchData}
                variant="static-outline"
                size="sm"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
              <Button
                variant="static-primary"
                size="sm"
                leftIcon={<Settings className="h-4 w-4" />}
              >
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6">
            <Card variant="default" className="border-l-4 border-red-500 bg-red-900/20" animate={false} hover={false}>
              <div className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <p className="text-red-400">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {success && (
          <div className="mb-6">
            <Card variant="default" className="border-l-4 border-green-500 bg-green-900/20" animate={false} hover={false}>
              <div className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <p className="text-green-400">{success}</p>
                  <button
                    onClick={() => setSuccess(null)}
                    className="ml-auto text-green-500 hover:text-green-700"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Stats Overview */}
        {platformStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: 'Total Users',
                value: platformStats.totalUsers.toLocaleString(),
                icon: <Users className="h-6 w-6" />,
                color: 'from-blue-500 to-cyan-600',
                change: `+${platformStats.newUsersThisMonth} this month`
              },
              {
                title: 'Total Projects',
                value: platformStats.totalProjects.toLocaleString(),
                icon: <Package className="h-6 w-6" />,
                color: 'from-purple-500 to-pink-600',
                change: `${platformStats.pendingProjects} pending`
              },
              {
                title: 'Total Revenue',
                value: `₹${platformStats.totalRevenue.toLocaleString()}`,
                icon: <DollarSign className="h-6 w-6" />,
                color: 'from-green-500 to-emerald-600',
                change: `${platformStats.totalSales} sales`
              },
              {
                title: 'Active Users',
                value: platformStats.activeUsers.toLocaleString(),
                icon: <Activity className="h-6 w-6" />,
                color: 'from-orange-500 to-red-600',
                change: 'Buyers & Sellers'
              }
            ].map((stat, index) => (
              <div key={stat.title}>
                <Card variant="default" className="border border-gray-700 bg-gray-900" animate={false} hover={false}>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-white mt-2">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {stat.change}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-500 text-white">
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card variant="default" className="border border-gray-700 bg-gray-900" animate={false} hover={false}>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    variant="static-outline"
                    leftIcon={<Package className="h-4 w-4" />}
                    onClick={() => setActiveTab('projects')}
                  >
                    Manage Projects ({platformStats?.pendingProjects || 0} pending)
                  </Button>
                  <Button
                    variant="static-outline"
                    leftIcon={<Users className="h-4 w-4" />}
                      onClick={() => setActiveTab('users')}
                    >
                      Manage Users ({allUsers.length} total)
                    </Button>
                    <Button
                      variant="static-outline"
                      leftIcon={<BarChart3 className="h-4 w-4" />}
                      onClick={() => setActiveTab('analytics')}
                    >
                      View Analytics
                    </Button>
                    <Button
                      variant="static-primary"
                      leftIcon={<Shield className="h-4 w-4" />}
                      onClick={() => window.location.href = '/admin-management'}
                    >
                      Admin Management
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card variant="default" className="border border-gray-700 bg-gray-900" animate={false} hover={false}>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {allProjects.slice(0, 5).map((project) => (
                      <div key={project._id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {project.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              by {project.seller?.displayName || project.seller?.email || 'Unknown Seller'} • {new Date(project.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={project.status === 'approved' ? 'success' : project.status === 'pending' ? 'warning' : 'error'}
                          size="sm"
                        >
                          {project.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <Card variant="default" className="border border-gray-700 bg-gray-900" animate={false} hover={false}>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    User Management ({filteredUsers.length})
                  </h3>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftIcon={<Search className="h-4 w-4" />}
                        className="w-64"
                      />
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white"
                      >
                        <option value="all">All Roles</option>
                        <option value="buyer">Buyers</option>
                        <option value="seller">Sellers</option>
                        <option value="admin">Admins</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Stats
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {filteredUsers.map((user) => (
                          <tr key={user._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=random`}
                                    alt={user.displayName || user.email || 'User'}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-white">
                                    {user.displayName || user.email || 'Unknown User'}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {user.email || 'No email'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                variant={user.role === 'admin' ? 'error' : user.role === 'seller' ? 'warning' : 'success'}
                                size="sm"
                              >
                                {user.role}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              <div>
                                <div>Purchased: {user.stats?.projectsPurchased || 0}</div>
                                <div>Sold: {user.stats?.projectsSold || 0}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              {user.role !== 'admin' && (
                                <select
                                  value={user.role}
                                  onChange={(e) => handleUserRoleChange(user._id, e.target.value as AdminUser['role'])}
                                  className="px-2 py-1 border border-gray-600 rounded text-xs focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white"
                                >
                                  <option value="buyer">Buyer</option>
                                  <option value="seller">Seller</option>
                                </select>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            <Card variant="default" className="border border-gray-700 bg-gray-900" animate={false} hover={false}>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    Project Management ({filteredProjects.length})
                  </h3>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                      <Input
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftIcon={<Search className="h-4 w-4" />}
                        className="w-64"
                      />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-800 text-white"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                      <Card key={project._id} variant="default" animate={false} hover={false}>
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <Badge
                              variant={
                                project.status === 'approved' ? 'success' :
                                project.status === 'pending' ? 'warning' :
                                project.status === 'rejected' ? 'error' : 'default'
                              }
                              size="sm"
                            >
                              {project.status}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => {
                                  setSelectedProject(project);
                                  setShowProjectModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                                    handleDeleteProject(project._id);
                                  }
                                }}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Delete project"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                            {project.title}
                          </h4>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {project.description}
                          </p>

                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xl font-bold text-green-600">
                              ₹{project.price}
                            </span>
                            <span className="text-sm text-gray-500 capitalize">
                              {project.category}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <span>by {project.seller?.displayName || project.seller?.email || 'Unknown Seller'}</span>
                            <span>{project.buyers?.length || 0} sales</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {project.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleProjectStatusChange(project._id, 'approved')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="error"
                                  onClick={() => handleProjectStatusChange(project._id, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {project.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="warning"
                                onClick={() => handleProjectStatusChange(project._id, 'suspended')}
                              >
                                Suspend
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && (
          <div>
            <AdminPayoutManagement />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <Card variant="default" className="border border-gray-700 bg-gray-900" animate={false} hover={false}>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6">
                  Platform Analytics
                </h3>
                <div className="text-center py-12">
                  <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Analytics Coming Soon
                  </h3>
                  <p className="text-gray-400">
                    Advanced analytics and reporting features will be available here.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Admin Project Modal */}
      {showProjectModal && selectedProject && (
        <AdminProjectModal
          isOpen={showProjectModal}
          onClose={() => {
            setShowProjectModal(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
          onStatusChange={handleProjectStatusChange}
          onDelete={handleDeleteProject}
        />
      )}
      </div>
    </AdminThemeWrapper>
  );
};

export default AdminDashboard;