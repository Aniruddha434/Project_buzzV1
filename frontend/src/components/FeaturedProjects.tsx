import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import ProjectCard from './ProjectCard';
import EnhancedProjectModal from './EnhancedProjectModal';
import Button from './ui/Button';
import Card from './ui/Card';

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

interface FeaturedProjectsProps {
  title?: string;
  subtitle?: string;
  showViewAllButton?: boolean;
  limit?: number;
}

const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({
  title = "Featured Projects",
  subtitle = "Discover our handpicked selection of exceptional digital projects",
  showViewAllButton = true,
  limit = 4
}) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        // First try to get featured projects, fallback to latest approved projects
        let response = await projectService.getFeaturedProjects();
        let projectsData = response.data?.projects || response.projects || [];
        
        // If no featured projects, get latest approved projects
        if (projectsData.length === 0) {
          response = await projectService.getApprovedProjects();
          projectsData = response.data?.projects || response.projects || [];
          // Sort by creation date to get latest projects
          projectsData = projectsData.sort((a: Project, b: Project) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        
        // Limit the number of projects
        setProjects(projectsData.slice(0, limit));
      } catch (error) {
        console.error('Error fetching featured projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProjects();
  }, [limit]);

  const isPurchased = (project: Project) => {
    if (!user || !project.buyers) return false;
    return project.buyers.some(buyer => buyer.user === user.uid);
  };

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
    console.error('Payment failed:', error);
    // Handle payment error (show notification, etc.)
  };

  if (loading) {
    return (
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <Card key={i} className="p-6 animate-pulse bg-gray-800 border-gray-700">
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="h-20 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
          </div>
          
          <Card className="p-12 text-center bg-gray-800 border-gray-700">
            <h3 className="text-lg font-medium text-white mb-2">
              No featured projects available
            </h3>
            <p className="text-gray-400">
              Check back soon for amazing new projects!
            </p>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="featured-projects-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
          {projects.map((project) => (
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

        {showViewAllButton && (
          <div className="text-center mt-12">
            <Link to="/market">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                View All Projects
              </Button>
            </Link>
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
    </section>
  );
};

export default FeaturedProjects;
