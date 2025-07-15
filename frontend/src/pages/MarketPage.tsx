import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { projectService } from '../services/projectService.js';
import ProjectCard from '../components/ProjectCard';
import EnhancedProjectModal from '../components/EnhancedProjectModal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import SEOHead from '../components/SEO/SEOHead';
import { useLocation } from 'react-router-dom';

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

const MarketPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // SEO configuration based on category and search
  const getSEOConfig = () => {
    const urlParams = new URLSearchParams(location.search);
    const category = urlParams.get('category') || selectedCategory;
    const search = urlParams.get('search') || searchTerm;

    let title = 'Browse Projects - Digital Marketplace | ProjectBuzz';
    let description = 'Browse thousands of high-quality programming projects on ProjectBuzz. Find web development, mobile apps, AI/ML projects, and more. Buy ready-made solutions from expert developers.';
    let keywords = ['browse projects', 'project catalog', 'programming solutions', 'buy projects', 'developer marketplace'];

    if (category && category !== 'all') {
      switch (category) {
        case 'web':
          title = 'Web Development Projects - Buy Ready-Made Solutions | ProjectBuzz';
          description = 'Discover premium web development projects on ProjectBuzz. React, Vue, Angular, Node.js, and full-stack solutions. Buy ready-made web applications from expert developers.';
          keywords = ['web development projects', 'React projects', 'Vue projects', 'Angular projects', 'Node.js', 'full-stack'];
          break;
        case 'mobile':
          title = 'Mobile App Projects - iOS & Android Solutions | ProjectBuzz';
          description = 'Browse mobile app projects for iOS and Android. React Native, Flutter, Swift, and Kotlin projects. Buy complete mobile applications and source code.';
          keywords = ['mobile app projects', 'iOS projects', 'Android projects', 'React Native', 'Flutter', 'mobile development'];
          break;
        case 'ai-ml':
          title = 'AI & Machine Learning Projects - Advanced Solutions | ProjectBuzz';
          description = 'Explore cutting-edge AI and machine learning projects. Python, TensorFlow, PyTorch, and deep learning solutions. Buy advanced AI projects from expert developers.';
          keywords = ['AI projects', 'machine learning projects', 'Python AI', 'TensorFlow', 'PyTorch', 'deep learning'];
          break;
      }
    }

    if (search) {
      title = `${search} Projects - Search Results | ProjectBuzz`;
      description = `Find ${search} projects on ProjectBuzz. Browse high-quality programming solutions and ready-made projects related to ${search}.`;
      keywords = [...keywords, search, `${search} projects`, `buy ${search} projects`];
    }

    return { title, description, keywords };
  };

  const seoConfig = getSEOConfig();

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

  const handlePaymentError = (error: any) => {
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
    <>
      {/* SEO Head Component */}
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical={`https://projectbuzz.tech/market${location.search}`}
        breadcrumbs={[
          { name: 'Home', url: 'https://projectbuzz.tech' },
          { name: 'Market', url: 'https://projectbuzz.tech/market' }
        ]}
      />

      <div className="min-h-screen bg-black page-with-navbar-extra">
        <div className="projects-container py-8">
          {/* Header - SEO Optimized */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              {selectedCategory === 'all' ? 'Digital Project Marketplace' :
               selectedCategory === 'web' ? 'Web Development Projects' :
               selectedCategory === 'mobile' ? 'Mobile App Projects' :
               selectedCategory === 'ai-ml' ? 'AI & Machine Learning Projects' :
               'Digital Projects'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {selectedCategory === 'all' ?
                'Discover amazing programming projects from talented developers worldwide. Buy ready-made solutions and source code.' :
                `Browse high-quality ${selectedCategory} projects from expert developers. Find the perfect solution for your needs.`
              }
            </p>
          </header>
        </div>

        {/* Search and Filters - Mobile Responsive */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 h-12 sm:h-auto text-base"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="sm:w-48 md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-3 sm:py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base h-12 sm:h-auto"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle - Hidden on mobile, grid is default */}
            <div className="hidden sm:flex bg-gray-800 rounded-md p-1">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-400">
            {loading ? 'Loading...' : `${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''} found`}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="projects-grid-unified">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="project-card-skeleton"></div>
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
            <p className="text-gray-400">
              Try adjusting your search terms or filters
            </p>
          </Card>
        ) : (
          <div className={`${
            viewMode === 'grid'
              ? 'projects-grid-unified'
              : 'grid grid-cols-1 gap-4'
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
    </>
  );
};

export default MarketPage;
