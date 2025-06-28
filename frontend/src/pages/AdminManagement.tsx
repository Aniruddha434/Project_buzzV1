import React, { useState, useEffect } from 'react';
import {
  UserPlus, Users, Shield, Settings, Eye, Edit,
  Trash2, AlertCircle, CheckCircle, Clock, Search
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import AdminCreationModal from '../components/AdminCreationModal';
import api from '../api.js';

interface Admin {
  _id: string;
  email: string;
  displayName: string;
  role: string;
  adminInfo: {
    adminLevel: string;
    permissions: string[];
    department?: string;
    isActive: boolean;
    createdAt: string;
    lastLogin?: string;
    loginCount: number;
    notes?: string;
  };
  createdAt: string;
  isActive: boolean;
}

const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    filterAdmins();
  }, [admins, searchTerm, filterLevel]);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin-management/admins');

      if (response.data.success) {
        setAdmins(response.data.admins);
      } else {
        setError(response.data.message || 'Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAdmins = () => {
    let filtered = admins;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(admin =>
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.adminInfo?.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by admin level
    if (filterLevel !== 'all') {
      filtered = filtered.filter(admin => admin.adminInfo?.adminLevel === filterLevel);
    }

    setFilteredAdmins(filtered);
  };

  const handleCreateSuccess = () => {
    fetchAdmins();
  };

  const getStatusBadge = (admin: Admin) => {
    if (!admin.isActive || !admin.adminInfo?.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/20 text-red-300 border border-red-700">
          <AlertCircle className="h-3 w-3 mr-1" />
          Inactive
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/20 text-green-300 border border-green-700">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </span>
    );
  };

  const getLevelBadge = (level: string) => {
    const isSuper = level === 'super_admin';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isSuper
          ? 'bg-purple-900/20 text-purple-300 border border-purple-700'
          : 'bg-blue-900/20 text-blue-300 border border-blue-700'
      }`}>
        <Shield className="h-3 w-3 mr-1" />
        {isSuper ? 'Super Admin' : 'Admin'}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Management</h1>
              <p className="text-gray-400">Manage admin accounts and permissions</p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Create Admin
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search Admins
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                  placeholder="Search by email, name, or department..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Level
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-3 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-400">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {filteredAdmins.length} of {admins.length} admins
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Admin List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Level & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredAdmins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {admin.displayName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {admin.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getLevelBadge(admin.adminInfo?.adminLevel || 'admin')}
                        {getStatusBadge(admin)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {admin.adminInfo?.department || 'General'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {admin.adminInfo?.permissions?.length || 0} permissions
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {admin.adminInfo?.lastLogin ? (
                        <div>
                          <div>{formatDate(admin.adminInfo.lastLogin)}</div>
                          <div className="text-xs text-gray-500">
                            {admin.adminInfo.loginCount} logins
                          </div>
                        </div>
                      ) : (
                        <span className="flex items-center text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          Never
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(admin.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-400 hover:text-blue-300">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-yellow-400 hover:text-yellow-300">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-400 hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAdmins.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No admin accounts found</p>
              {searchTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  Try adjusting your search criteria
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin Creation Modal */}
      <AdminCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default AdminManagement;
