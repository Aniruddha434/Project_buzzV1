import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { projectService } from '../services/projectService.js';
import ProjectCard from '../components/ProjectCard';
import EnhancedProjectModal from '../components/EnhancedProjectModal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

interface Project {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags?: string[];
  githubRepo?: string;
  demoUrl?: string;
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
  buyers?: Array<{
    user: string;
    purchasedAt: string;
  }>;
}

const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'web', label: 'Web Development' },
    { value: 'mobile', label: 'Mobile Apps' },
    { value: 'desktop', label: 'Desktop Apps' },
    { value: 'ai-ml', label: 'AI/ML' },
    { value: 'blockchain', label: 'Blockchain' },
    { value: 'game', label: 'Games' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getApprovedProjects();
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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handlePaymentSuccess = (orderId: string) => {
    console.log('Payment successful:', orderId);
    setModalOpen(false);
    setSelectedProject(null);
    // Refresh projects to update purchase status
    window.location.reload();
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error}`);
  };

  const isPurchased = (project: Project) => {
    if (!user) return false;
    return project.buyers?.some(buyer => {
      const buyerUserId = typeof buyer.user === 'string' ? buyer.user : (buyer.user as any)?._id || buyer.user;
      return buyerUserId === user._id;
    }) || false;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Browse Projects
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover amazing digital projects from talented developers
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                leftIcon={<Grid className="h-4 w-4" />}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                leftIcon={<List className="h-4 w-4" />}
              >
                List
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Loading...' : `${filteredProjects.length} projects found`}
          </p>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-48 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms or filters
            </p>
          </Card>
        ) : (
          <div className={`grid gap-4 auto-rows-fr ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                isPurchased={isPurchased(project)}
                user={user}
                className="cursor-pointer project-card-container"
                showBuyButton={true}
                showShareIcon={true}
                onPurchase={() => {
                  console.log('Purchase initiated for project:', project.title);
                }}
                onClick={() => handleProjectClick(project)}
              />
            ))}
          </div>
        )}

        {/* Enhanced Project Modal with Integrated Checkout */}
        {selectedProject && (
          <EnhancedProjectModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSelectedProject(null);
            }}
            project={selectedProject}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            isPurchased={isPurchased(selectedProject)}
            user={user}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
