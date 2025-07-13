import React, { useState, useEffect } from 'react';
import {
  Search,
  Home,
  Package,
  Users,
  Settings,
  Star,
  TrendingUp,
  Eye,
  Plus,
  Filter,
  Grid,
  List,
  ChevronRight,
  Bell,
  User,
  ShoppingCart,
  ExternalLink,
  Heart,
  Share2,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { projectService } from '../services/projectService.js';
import paymentService from '../services/paymentService.js';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import PaymentModal from '../components/PaymentModal';

interface Project {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags?: string[];
  images?: Array<{
    url: string;
    filename: string;
    originalName: string;
    isPrimary?: boolean;
  }>;
  image?: {
    url: string;
    filename: string;
    originalName: string;
  };
  seller: {
    displayName: string;
    photoURL?: string;
  };
  stats: {
    views: number;
    sales: number;
    downloads: number;
  };
  status: string;
  createdAt: string;
}

const ModernDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [buyingProject, setBuyingProject] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState('');

  const sidebarItems = [
    { icon: <Home className="h-5 w-5" />, label: 'Home', active: true },
    { icon: <Package className="h-5 w-5" />, label: 'Projects', count: 24 },
    { icon: <Star className="h-5 w-5" />, label: 'Featured', count: 8 },
    { icon: <TrendingUp className="h-5 w-5" />, label: 'Trending', count: 12 },
    { icon: <Users className="h-5 w-5" />, label: 'Creators' },
    { icon: <Settings className="h-5 w-5" />, label: 'Settings' },
  ];

  const categories = [
    'All', 'Web Development', 'Mobile Apps', 'AI/ML', 'Blockchain', 'Games'
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getProjects();
        // Handle the nested response structure from backend
        const projectsData = response.data?.projects || response.projects || [];
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getProjectImage = (project: Project) => {
    if (project.images && project.images.length > 0) {
      const primaryImage = project.images.find(img => img.isPrimary);
      return primaryImage?.url || project.images[0]?.url;
    }
    return project.image?.url;
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  const handleBuyProject = async (project: Project) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBuyingProject(project._id);
    try {
      const response = await paymentService.createOrder(project._id);

      if (response.success && response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        alert('Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.error('Error creating payment order:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setBuyingProject(null);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' ||
                           project.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">ProjectBuzz</h1>
          <p className="text-sm text-gray-400">Digital Marketplace</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                item.active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.count && (
                <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded-full">
                  {item.count}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.role || 'Member'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 pt-16">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-white">Dashboard</h2>
              <div className="flex items-center space-x-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedCategory === category.toLowerCase()
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedCategory(category.toLowerCase())}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Global search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {/* Featured Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Featured</h3>
              <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
              {loading ? (
                // Loading skeletons
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse h-[420px]">
                    <div className="h-32 bg-gray-700 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))
              ) : (
                filteredProjects.slice(0, 8).map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    isPurchased={isPurchased(project)}
                    user={user}
                    className="cursor-pointer h-full"
                    showBuyButton={true}
                    showShareIcon={true}
                    onPurchase={(project) => handleBuyProject(project._id)}
                    onClick={handleProjectClick}
                  />
                ))
              )}
            </div>
          </div>


        </main>
      </div>

      {/* Project Detail Modal */}
      {isProjectModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">{selectedProject.title}</h2>
              <button
                onClick={() => {
                  setIsProjectModalOpen(false);
                  setCustomerPhone('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Images */}
                <div>
                  <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden mb-4">
                    {getProjectImage(selectedProject) ? (
                      <img
                        src={getProjectImage(selectedProject)}
                        alt={selectedProject.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Additional Images */}
                  {selectedProject.images && selectedProject.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedProject.images.slice(1, 5).map((image, index) => (
                        <div key={index} className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                          <img
                            src={image.url}
                            alt={`${selectedProject.title} ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Project Details */}
                <div>
                  <div className="mb-4">
                    <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                      {selectedProject.category}
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                    {selectedProject.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{selectedProject.stats.views}</div>
                      <div className="text-xs text-gray-400">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{selectedProject.stats.sales}</div>
                      <div className="text-xs text-gray-400">Sales</div>
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-700 rounded-lg">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{selectedProject.seller?.displayName || 'Unknown Seller'}</div>
                      <div className="text-gray-400 text-sm">Project Creator</div>
                    </div>
                  </div>

                  {/* Price and Buy Button */}
                  <div className="border-t border-gray-700 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-3xl font-bold text-blue-400">₹{selectedProject.price}</div>
                        <div className="text-gray-400 text-sm">One-time purchase</div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors">
                          <Heart className="h-5 w-5" />
                        </button>
                        <button className="p-2 bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors">
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile Number Input */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        maxLength={10}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Required for payment notifications
                      </p>
                    </div>

                    <PaymentModal
                      project={selectedProject}
                      phoneNumber={customerPhone}
                      onPaymentSuccess={() => {
                        console.log('Payment successful');
                        handleBuyProject(selectedProject);
                        setIsProjectModalOpen(false);
                        setCustomerPhone('');
                      }}
                      onPaymentError={(error) => {
                        console.error('Payment error:', error);
                      }}
                      trigger={
                        <button
                          disabled={buyingProject === selectedProject._id}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 text-lg font-medium"
                        >
                          {buyingProject === selectedProject._id ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                              <span>Processing Payment...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-5 w-5" />
                              <span>Buy Now</span>
                            </>
                          )}
                        </button>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernDashboard;
