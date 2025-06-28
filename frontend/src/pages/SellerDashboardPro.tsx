import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Upload, Edit3, Trash2, Eye, Download, DollarSign,
  TrendingUp, Package, Clock, CheckCircle, XCircle, X,
  Github, ExternalLink, Tag, Calendar, BarChart3, Image as ImageIcon,
  Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, History, MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { projectService } from '../services/projectService.js';
import { userService } from '../services/userService.js';
import walletService from '../services/walletService.js';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MultiImageUpload from '../components/MultiImageUpload';
import WalletDashboard from '../components/WalletDashboard';
import { NegotiationDashboard } from '../components/NegotiationDashboard';
import api from '../api';

// Interface for Project data
interface Project {
  _id: string;
  title: string;
  description: string;
  price: number;
  image?: {
    url: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
  };
  images?: Array<{
    _id: string;
    url: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    isPrimary: boolean;
    order: number;
    uploadedAt: string;
  }>;
  githubRepo: string; // Now required
  demoUrl?: string;
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

const SellerDashboardPro: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Tab management
  const [activeTab, setActiveTab] = useState<'projects' | 'wallet' | 'negotiations'>('projects');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Wallet states
  const [walletData, setWalletData] = useState<any>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  // Negotiations states
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [negotiationsLoading, setNegotiationsLoading] = useState(false);
  const [pendingNegotiationsCount, setPendingNegotiationsCount] = useState(0);

  // Image carousel state
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'web',
    tags: '',
    githubRepo: '',
    demoUrl: '',
    // Enhanced project information fields
    completionStatus: 100,
    timeline: '',
    techStack: '',
    complexityLevel: 'intermediate',
    installationInstructions: '',
    usageInstructions: '',
    prerequisites: ''
  });
  const [documentationFiles, setDocumentationFiles] = useState<File[]>([]);
  const [projectZipFile, setProjectZipFile] = useState<File | null>(null);
  const [projectImages, setProjectImages] = useState<Array<{
    file: File;
    preview: string;
    id: string;
  }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const categories = [
    { value: 'web', label: 'Web Development', icon: '🌐' },
    { value: 'mobile', label: 'Mobile App', icon: '📱' },
    { value: 'desktop', label: 'Desktop App', icon: '💻' },
    { value: 'ai-ml', label: 'AI/ML', icon: '🤖' },
    { value: 'blockchain', label: 'Blockchain', icon: '⛓️' },
    { value: 'game', label: 'Game Dev', icon: '🎮' },
    { value: 'other', label: 'Other', icon: '📦' }
  ];

  // Calculate enhanced stats
  const stats = React.useMemo(() => {
    const base = projects.reduce((acc, project) => {
      acc.totalProjects++;
      if (project.status === 'approved') acc.approvedProjects++;
      if (project.status === 'pending') acc.pendingProjects++;
      if (project.status === 'rejected') acc.rejectedProjects++;
      acc.totalSales += project.buyers?.length || 0;
      acc.totalRevenue += (project.buyers?.length || 0) * project.price;
      acc.totalViews += project.stats?.views || 0;
      acc.totalDownloads += project.stats?.downloads || 0;
      return acc;
    }, {
      totalProjects: 0,
      approvedProjects: 0,
      pendingProjects: 0,
      rejectedProjects: 0,
      totalSales: 0,
      totalRevenue: 0,
      totalViews: 0,
      totalDownloads: 0
    });

    return {
      ...base,
      avgPrice: base.totalProjects > 0 ? projects.reduce((sum, p) => sum + p.price, 0) / base.totalProjects : 0,
      conversionRate: base.totalViews > 0 ? (base.totalSales / base.totalViews) * 100 : 0
    };
  }, [projects]);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [projectsRes, statsRes] = await Promise.all([
        projectService.getMyProjects(),
        userService.getStats()
      ]);

      setProjects(projectsRes.data || []);
      setUserStats(statsRes.data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletData = async () => {
    if (!user) return;

    try {
      setWalletLoading(true);
      const walletRes = await walletService.getWallet();
      setWalletData(walletRes.data);
    } catch (err: any) {
      console.error('Error fetching wallet data:', err);
      // Don't set error for wallet data, just log it
    } finally {
      setWalletLoading(false);
    }
  };

  const fetchNegotiationsData = async () => {
    if (!user) return;

    try {
      setNegotiationsLoading(true);
      const response = await api.get('/negotiations/my');

      if (response.data.success) {
        const data = response.data;
        // Filter to show only negotiations where current user is the seller
        const sellerNegotiations = data.negotiations.filter((neg: any) =>
          neg.seller._id === user._id || neg.seller === user._id
        );
        setNegotiations(sellerNegotiations);

        // Count pending negotiations for badge
        const pendingCount = sellerNegotiations.filter((neg: any) =>
          neg.status === 'active' && neg.currentOffer
        ).length;
        setPendingNegotiationsCount(pendingCount);
      }
    } catch (err: any) {
      console.error('Error fetching negotiations data:', err);
      // Don't set error for negotiations data, just log it
    } finally {
      setNegotiationsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'wallet') {
      fetchWalletData();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user && activeTab === 'negotiations') {
      fetchNegotiationsData();
    }
  }, [user, activeTab]);

  // Fetch negotiations count for badge on initial load
  useEffect(() => {
    if (user) {
      fetchNegotiationsData();
    }
  }, [user]);

  // Auto-cycle images on hover
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (hoveredProject) {
      const project = projects.find(p => p._id === hoveredProject);
      const images = getProjectImages(project!);

      if (images.length > 1) {
        interval = setInterval(() => {
          cycleImages(hoveredProject, images);
        }, 1000); // Change image every 1 second
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hoveredProject, projects]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      category: 'web',
      tags: '',
      githubRepo: '',
      demoUrl: '',
      // Enhanced project information fields
      completionStatus: 100,
      timeline: '',
      techStack: '',
      complexityLevel: 'intermediate',
      installationInstructions: '',
      usageInstructions: '',
      prerequisites: ''
    });
    // Clean up image previews
    projectImages.forEach(img => URL.revokeObjectURL(img.preview));
    setProjectImages([]);
    setDocumentationFiles([]);
    setProjectZipFile(null);
    setAcceptedTerms(false);
  };

  // Image carousel functions
  const handleProjectHover = (projectId: string) => {
    setHoveredProject(projectId);
    if (!currentImageIndex[projectId]) {
      setCurrentImageIndex(prev => ({ ...prev, [projectId]: 0 }));
    }
  };

  const handleProjectLeave = () => {
    setHoveredProject(null);
  };

  const cycleImages = (projectId: string, images: any[]) => {
    if (images.length <= 1) return;

    setCurrentImageIndex(prev => ({
      ...prev,
      [projectId]: ((prev[projectId] || 0) + 1) % images.length
    }));
  };

  // Project detail functions
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const getProjectImages = (project: Project) => {
    if (project.images && project.images.length > 0) {
      return project.images;
    } else if (project.image?.url) {
      return [{ url: project.image.url, isPrimary: true }];
    }
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.price || !formData.githubRepo) {
      setError('Please fill in all required fields including GitHub repository URL.');
      return;
    }

    if (!projectZipFile) {
      setError('Please upload a ZIP file containing your project source code.');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the Terms and Conditions to submit your project.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const projectData = {
        ...formData,
        price: parseFloat(formData.price),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        images: projectImages.map(img => img.file),
        // Enhanced project information fields
        completionStatus: formData.completionStatus,
        documentationFiles,
        projectZipFile,
        zipDescription: 'Complete project source code and assets',
        projectDetails: {
          timeline: formData.timeline,
          techStack: formData.techStack,
          complexityLevel: formData.complexityLevel,
          installationInstructions: formData.installationInstructions,
          usageInstructions: formData.usageInstructions,
          prerequisites: formData.prerequisites
        }
      };

      await projectService.createProject(projectData);
      setSuccess('Project created successfully! It is now pending approval.');
      setShowAddModal(false);
      resetForm();
      await fetchData();
    } catch (err: any) {
      console.error('Project creation error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error message:', err.message);

      // Handle validation errors with detailed field information
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.map((error: any) =>
          `${error.path}: ${error.msg}`
        ).join(', ');
        setError(`Validation failed: ${validationErrors}`);
      } else if (err.response?.data?.message) {
        setError(`Server error: ${err.response.data.message}`);
      } else if (err.message) {
        setError(`Network error: ${err.message}`);
      } else {
        setError('Failed to create project. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      price: project.price.toString(),
      category: project.category,
      tags: project.tags.join(', '),
      githubRepo: project.githubRepo,
      demoUrl: project.demoUrl || '',
      // Enhanced project information fields
      completionStatus: (project as any).completionStatus || 100,
      timeline: (project as any).projectDetails?.timeline || '',
      techStack: (project as any).projectDetails?.techStack || '',
      complexityLevel: (project as any).projectDetails?.complexityLevel || 'intermediate',
      installationInstructions: (project as any).projectDetails?.installationInstructions || '',
      usageInstructions: (project as any).projectDetails?.usageInstructions || '',
      prerequisites: (project as any).projectDetails?.prerequisites || ''
    });
    // Clear images for editing (user can add new ones)
    setProjectImages([]);
    setDocumentationFiles([]);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Update project details
      const updateData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        githubRepo: formData.githubRepo,
        demoUrl: formData.demoUrl
      };

      await projectService.updateProject(editingProject._id, updateData);

      // Add new images if any were selected
      if (projectImages.length > 0) {
        const imageFiles = projectImages.map(img => img.file);
        await projectService.addProjectImages(editingProject._id, imageFiles);
        setSuccess(`Project updated successfully! ${projectImages.length} new image(s) added.`);
      } else {
        setSuccess('Project updated successfully!');
      }

      setShowEditModal(false);
      setEditingProject(null);
      resetForm();
      await fetchData();
    } catch (err: any) {
      console.error('Project update error:', err);

      // Handle validation errors with detailed field information
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.map((error: any) =>
          `${error.path}: ${error.msg}`
        ).join(', ');
        setError(`Validation failed: ${validationErrors}`);
      } else {
        setError(err.response?.data?.message || 'Failed to update project');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await projectService.deleteProject(project._id);
      setSuccess('Project deleted successfully.');
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="xl" variant="gradient" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Seller Dashboard
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Manage your digital products and track your success
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              {activeTab === 'projects' && (
                <Button
                  onClick={() => setShowAddModal(true)}
                  variant="gradient"
                  size="lg"
                  leftIcon={<Plus className="h-5 w-5" />}
                  glow
                >
                  Create New Project
                </Button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'projects'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Package className="h-4 w-4 inline mr-2" />
                Projects
              </button>
              <button
                onClick={() => setActiveTab('negotiations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === 'negotiations'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <MessageCircle className="h-4 w-4 inline mr-2" />
                Negotiations
                {pendingNegotiationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingNegotiationsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'wallet'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Wallet className="h-4 w-4 inline mr-2" />
                Wallet & Payouts
              </button>
            </nav>
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6"
            >
              <Card variant="default" className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
                <div className="p-4">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-500 mr-3" />
                    <p className="text-red-700 dark:text-red-400">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6"
            >
              <Card variant="default" className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                <div className="p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <p className="text-green-700 dark:text-green-400">{success}</p>
                    <button
                      onClick={() => setSuccess(null)}
                      className="ml-auto text-green-500 hover:text-green-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content */}
        {activeTab === 'projects' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Revenue',
              value: `₹${stats.totalRevenue.toLocaleString()}`,
              icon: <DollarSign className="h-6 w-6" />,
              color: 'from-green-500 to-emerald-600',
              change: stats.totalSales > 0 ? `${stats.totalSales} sales` : null
            },
            {
              title: 'Total Sales',
              value: stats.totalSales.toString(),
              icon: <TrendingUp className="h-6 w-6" />,
              color: 'from-blue-500 to-cyan-600',
              change: stats.totalProjects > 0 ? `${stats.totalProjects} projects` : null
            },
            {
              title: 'Active Projects',
              value: stats.approvedProjects.toString(),
              icon: <Package className="h-6 w-6" />,
              color: 'from-purple-500 to-pink-600',
              change: stats.pendingProjects > 0 ? `${stats.pendingProjects} pending` : null
            },
            {
              title: 'Total Views',
              value: stats.totalViews.toLocaleString(),
              icon: <Eye className="h-6 w-6" />,
              color: 'from-orange-500 to-red-600',
              change: stats.totalDownloads > 0 ? `${stats.totalDownloads} downloads` : null
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="glass">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {stat.value}
                      </p>
                      {stat.change && (
                        <div className="flex items-center mt-2">
                          <Badge variant="info" size="sm">
                            {stat.change}
                          </Badge>
                          <span className="text-xs text-gray-500 ml-2">current period</span>
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-lg`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card variant="gradient" className="lg:col-span-2">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Performance Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Avg. Price', value: `₹${stats.avgPrice.toFixed(0)}` },
                  { label: 'Conversion', value: `${stats.conversionRate.toFixed(1)}%` },
                  { label: 'Downloads', value: stats.totalDownloads.toString() },
                  { label: 'Pending', value: stats.pendingProjects.toString() }
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {item.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card variant="glass">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Project Status
              </h3>
              <div className="space-y-3">
                {[
                  { status: 'Approved', count: stats.approvedProjects, color: 'bg-green-500' },
                  { status: 'Pending', count: stats.pendingProjects, color: 'bg-yellow-500' },
                  { status: 'Rejected', count: stats.rejectedProjects, color: 'bg-red-500' }
                ].map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${item.color} mr-3`} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.status}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Projects List */}
        <Card variant="glass" className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Your Projects ({projects.length})
              </h3>
              <div className="flex items-center space-x-2">
                <Badge variant="info" size="sm">
                  {stats.approvedProjects} Live
                </Badge>
                <Badge variant="warning" size="sm">
                  {stats.pendingProjects} Pending
                </Badge>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner variant="dots" text="Loading projects..." />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No projects yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first project to start selling digital products
                </p>
                <Button
                  onClick={() => setShowAddModal(true)}
                  variant="primary"
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Create Your First Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => {
                  const images = getProjectImages(project);
                  const currentImg = images.length > 0 ? images[currentImageIndex[project._id] || 0] : null;

                  return (
                    <motion.div
                      key={project._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        variant="default"
                        hover
                        className="h-full cursor-pointer group"
                        onMouseEnter={() => handleProjectHover(project._id)}
                        onMouseLeave={handleProjectLeave}
                        onClick={() => handleProjectClick(project)}
                      >
                        <div className="relative">
                          {/* Project Image(s) with Carousel */}
                          {images.length > 0 ? (
                            <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded-t-xl overflow-hidden relative">
                              <img
                                src={currentImg?.url}
                                alt={project.title}
                                className="w-full h-full object-cover transition-all duration-500"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                                <Package className="h-12 w-12 text-gray-400" />
                              </div>

                              {/* Image indicators */}
                              {images.length > 1 && (
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                  {images.map((_, idx) => (
                                    <div
                                      key={idx}
                                      className={`w-2 h-2 rounded-full transition-all ${
                                        idx === (currentImageIndex[project._id] || 0)
                                          ? 'bg-white'
                                          : 'bg-white bg-opacity-50'
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}

                              {/* Image count badge */}
                              {images.length > 1 && (
                                <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                  <ImageIcon className="h-3 w-3 mr-1" />
                                  {images.length}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-40 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-t-xl flex items-center justify-center">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}

                        {/* Project Content - Simplified */}
                        <div className="p-4">
                          {/* Header with actions */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={getStatusColor(project.status) as any}
                                size="sm"
                                className="flex items-center"
                              >
                                {getStatusIcon(project.status)}
                                <span className="ml-1 capitalize">{project.status}</span>
                              </Badge>
                            </div>

                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(project);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit project"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(project);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete project"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Title and Price */}
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                            {project.title}
                          </h4>

                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xl font-bold text-green-600">
                              ₹{project.price}
                            </span>
                            <span className="text-sm text-gray-500 capitalize">
                              {categories.find(c => c.value === project.category)?.icon} {project.category}
                            </span>
                          </div>

                          {/* Brief description */}
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                            {project.description}
                          </p>

                          {/* Quick stats */}
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                            <span>{project.stats?.views || 0} views</span>
                            <span>{project.buyers?.length || 0} sales</span>
                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                          </div>

                          {/* Click to view indicator */}
                          <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                              Click to view full details →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
          </>
        )}

        {/* Negotiations Tab */}
        {activeTab === 'negotiations' && (
          <div className="space-y-6">
            {negotiationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="Loading negotiations..." />
              </div>
            ) : negotiations.length === 0 ? (
              <Card variant="glass" className="p-12 text-center">
                <MessageCircle className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Negotiations Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  When buyers start negotiating prices for your projects, they'll appear here.
                  You'll be able to accept or reject offers and communicate with potential buyers.
                </p>
              </Card>
            ) : (
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Your Negotiations ({negotiations.length})
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Manage incoming offers and price negotiations from buyers
                    </p>
                  </div>
                  {pendingNegotiationsCount > 0 && (
                    <Badge variant="warning" size="sm">
                      {pendingNegotiationsCount} Pending Offers
                    </Badge>
                  )}
                </div>

                <NegotiationDashboard onNegotiationUpdate={fetchNegotiationsData} userRole="seller" />
              </Card>
            )}
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <WalletDashboard
            walletData={walletData}
            loading={walletLoading}
            onRefresh={fetchWalletData}
            onSuccess={(message) => setSuccess(message)}
            onError={(message) => setError(message)}
          />
        )}

        {/* Add Project Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
            setError(null);
          }}
          title="Create New Project"
          size="lg"
          variant="glass"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Project Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter project title"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your project in detail"
              required
              // @ts-ignore
              as="textarea"
              rows={4}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Price (INR)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                leftIcon={<DollarSign className="h-4 w-4" />}
              />

              <Input
                label="GitHub Repository (Required)"
                value={formData.githubRepo}
                onChange={(e) => setFormData(prev => ({ ...prev, githubRepo: e.target.value }))}
                placeholder="https://github.com/user/repo"
                required
                leftIcon={<Github className="h-4 w-4" />}
              />
            </div>

            <Input
              label="Demo URL (Optional)"
              value={formData.demoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
              placeholder="https://your-demo-site.com"
              leftIcon={<ExternalLink className="h-4 w-4" />}
            />

            <Input
              label="Tags (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="react, javascript, api, frontend"
              leftIcon={<Tag className="h-4 w-4" />}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Images/Screenshots (Optional - Up to 5 images, 5MB each)
              </label>
              <MultiImageUpload
                images={projectImages}
                onImagesChange={setProjectImages}
                maxImages={5}
                maxSizePerImage={5}
                disabled={isSubmitting}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPEG, PNG, GIF, WebP. Maximum 5 images, 5MB each. First image will be used as the primary image.
              </p>
            </div>

            {/* Enhanced Project Information Section */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Enhanced Project Information</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Fill out these additional details to make your project more attractive to buyers!</p>

              {/* Completion Status */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Completion Status: <span className="font-semibold text-blue-600">{formData.completionStatus}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.completionStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, completionStatus: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Documentation Files */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Documentation Files (PDF, Word, Markdown - Max 10 files, 10MB each)
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 10) {
                      setError('Maximum 10 documentation files allowed.');
                      return;
                    }
                    setDocumentationFiles(files);
                  }}
                  multiple
                  accept=".pdf,.doc,.docx,.md,.txt"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {documentationFiles.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Selected files: {documentationFiles.map(f => f.name).join(', ')}
                  </p>
                )}
              </div>

              {/* Project ZIP File */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📦 Project Source Code (ZIP File - Max 100MB) <span className="text-red-500">*</span>
                </label>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-3">
                  <p className="text-blue-700 dark:text-blue-400 text-sm">
                    <strong>Important:</strong> Upload a ZIP file containing your complete project source code and assets.
                    This will be the main deliverable that buyers receive after purchase.
                  </p>
                </div>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 100 * 1024 * 1024) { // 100MB
                        setError('ZIP file too large. Maximum size is 100MB.');
                        return;
                      }
                      if (!file.name.toLowerCase().endsWith('.zip')) {
                        setError('Please select a ZIP file.');
                        return;
                      }
                      setProjectZipFile(file);
                      setError(null);
                    }
                  }}
                  accept=".zip"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {projectZipFile && (
                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✅</span>
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-400">
                          {projectZipFile.name}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-500">
                          Size: {(projectZipFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Upload a ZIP file containing your complete project source code, assets, and any additional files buyers will need.
                </p>
              </div>

              {/* Project Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Input
                  label="Development Timeline"
                  value={formData.timeline}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                  placeholder="e.g., 2 weeks, 1 month"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Complexity Level
                  </label>
                  <select
                    value={formData.complexityLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, complexityLevel: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <Input
                label="Technologies Used / Tech Stack"
                value={formData.techStack}
                onChange={(e) => setFormData(prev => ({ ...prev, techStack: e.target.value }))}
                placeholder="e.g., React, Node.js, MongoDB, Express, TypeScript"
                // @ts-ignore
                as="textarea"
                rows={3}
              />

              <Input
                label="Prerequisites / Dependencies"
                value={formData.prerequisites}
                onChange={(e) => setFormData(prev => ({ ...prev, prerequisites: e.target.value }))}
                placeholder="e.g., Node.js 16+, npm, Git"
                // @ts-ignore
                as="textarea"
                rows={2}
              />

              <Input
                label="Installation Instructions"
                value={formData.installationInstructions}
                onChange={(e) => setFormData(prev => ({ ...prev, installationInstructions: e.target.value }))}
                placeholder="Step-by-step installation guide..."
                // @ts-ignore
                as="textarea"
                rows={4}
              />

              <Input
                label="Usage Instructions"
                value={formData.usageInstructions}
                onChange={(e) => setFormData(prev => ({ ...prev, usageInstructions: e.target.value }))}
                placeholder="How to use the project after installation..."
                // @ts-ignore
                as="textarea"
                rows={4}
              />
            </div>

            {/* Terms and Conditions Acceptance */}
            <div className="border-t pt-6 mt-6">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-700 dark:text-gray-300">
                  I agree to the{' '}
                  <a
                    href="/terms-and-conditions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium transition-colors"
                  >
                    Terms and Conditions
                  </a>
                  {' '}for project submission and platform usage.
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-7">
                By checking this box, you confirm that you have read and agree to our terms regarding project submission, content ownership, and platform policies.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                  setError(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                isLoading={isSubmitting}
                disabled={!formData.title || !formData.description || !formData.price || !formData.githubRepo || !projectZipFile || !acceptedTerms}
                glow
              >
                Create Project
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Project Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingProject(null);
            resetForm();
            setError(null);
          }}
          title={`Edit: ${editingProject?.title}`}
          size="lg"
          variant="glass"
        >
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Project Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter project title"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your project in detail"
              required
              // @ts-ignore
              as="textarea"
              rows={4}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Price (INR)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                leftIcon={<DollarSign className="h-4 w-4" />}
              />

              <Input
                label="GitHub Repository (Required)"
                value={formData.githubRepo}
                onChange={(e) => setFormData(prev => ({ ...prev, githubRepo: e.target.value }))}
                placeholder="https://github.com/user/repo"
                required
                leftIcon={<Github className="h-4 w-4" />}
              />
            </div>

            <Input
              label="Demo URL (Optional)"
              value={formData.demoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
              placeholder="https://your-demo-site.com"
              leftIcon={<ExternalLink className="h-4 w-4" />}
            />

            <Input
              label="Tags (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="react, javascript, api, frontend"
              leftIcon={<Tag className="h-4 w-4" />}
            />

            {/* Image Management Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add New Images (Optional - Up to 5 images total, 5MB each)
              </label>
              <MultiImageUpload
                images={projectImages}
                onImagesChange={setProjectImages}
                maxImages={5}
                maxSizePerImage={5}
                disabled={isSubmitting}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add new images to your project. Existing images will remain unchanged.
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-700 dark:text-blue-400 text-sm">
                <strong>Note:</strong> To manage existing images (delete, reorder, set primary), please use the project management interface after updating.
              </p>
            </div>

            {/* Enhanced Project Information Section */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Enhanced Project Information</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Update these additional details to make your project more attractive to buyers!</p>

              {/* Completion Status */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Completion Status: <span className="font-semibold text-blue-600">{formData.completionStatus}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.completionStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, completionStatus: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Project Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Input
                  label="Development Timeline"
                  value={formData.timeline}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                  placeholder="e.g., 2 weeks, 1 month"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Complexity Level
                  </label>
                  <select
                    value={formData.complexityLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, complexityLevel: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <Input
                label="Technologies Used / Tech Stack"
                value={formData.techStack}
                onChange={(e) => setFormData(prev => ({ ...prev, techStack: e.target.value }))}
                placeholder="e.g., React, Node.js, MongoDB, Express, TypeScript"
                // @ts-ignore
                as="textarea"
                rows={3}
              />

              <Input
                label="Prerequisites / Dependencies"
                value={formData.prerequisites}
                onChange={(e) => setFormData(prev => ({ ...prev, prerequisites: e.target.value }))}
                placeholder="e.g., Node.js 16+, npm, Git"
                // @ts-ignore
                as="textarea"
                rows={2}
              />

              <Input
                label="Installation Instructions"
                value={formData.installationInstructions}
                onChange={(e) => setFormData(prev => ({ ...prev, installationInstructions: e.target.value }))}
                placeholder="Step-by-step installation guide..."
                // @ts-ignore
                as="textarea"
                rows={4}
              />

              <Input
                label="Usage Instructions"
                value={formData.usageInstructions}
                onChange={(e) => setFormData(prev => ({ ...prev, usageInstructions: e.target.value }))}
                placeholder="How to use the project after installation..."
                // @ts-ignore
                as="textarea"
                rows={4}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProject(null);
                  resetForm();
                  setError(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={!formData.title || !formData.description || !formData.price || !formData.githubRepo}
              >
                Update Project
              </Button>
            </div>
          </form>
        </Modal>

        {/* Project Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProject(null);
          }}
          title={selectedProject?.title || 'Project Details'}
          size="xl"
          variant="glass"
        >
          {selectedProject && (
            <div className="space-y-6">
              {/* Project Images Gallery */}
              {(() => {
                const images = getProjectImages(selectedProject);
                return images.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Project Images ({images.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {images.map((image, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={image.url}
                            alt={`${selectedProject.title} - Image ${idx + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          {image.isPrimary && (
                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Project Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {categories.find(c => c.value === selectedProject.category)?.icon}
                      </span>
                      <span className="text-gray-900 dark:text-white capitalize">
                        {selectedProject.category}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price
                    </label>
                    <span className="text-2xl font-bold text-green-600">
                      ${selectedProject.price}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <Badge
                      variant={getStatusColor(selectedProject.status) as any}
                      className="flex items-center w-fit"
                    >
                      {getStatusIcon(selectedProject.status)}
                      <span className="ml-1 capitalize">{selectedProject.status}</span>
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Statistics
                    </label>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {selectedProject.stats?.views || 0}
                        </div>
                        <div className="text-gray-500 text-xs">Views</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {selectedProject.buyers?.length || 0}
                        </div>
                        <div className="text-gray-500 text-xs">Sales</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {selectedProject.stats?.downloads || 0}
                        </div>
                        <div className="text-gray-500 text-xs">Downloads</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Created
                    </label>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(selectedProject.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Description
                </label>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {selectedProject.description}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {selectedProject.tags && selectedProject.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="default">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  {selectedProject.githubRepo && (
                    <a
                      href={selectedProject.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      <span>View Repository</span>
                    </a>
                  )}
                  {selectedProject.demoUrl && (
                    <a
                      href={selectedProject.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View Demo</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEdit(selectedProject);
                    }}
                    leftIcon={<Edit3 className="h-4 w-4" />}
                  >
                    Edit Project
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default SellerDashboardPro;