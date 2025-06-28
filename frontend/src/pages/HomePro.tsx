import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

import ProjectCard from '../components/ProjectCard';
import EnhancedProjectModal from '../components/EnhancedProjectModal';
import { HeroScrollDemo } from '../components/ui/hero-scroll-demo';
import { WhyChooseProjectBuzzPins, HowItWorksPins, JoinCommunityPins } from '../components/ProjectBuzzPins';
import Footer from '../components/Footer';

interface FeaturedProject {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  image?: {
    url: string;
    filename: string;
    originalName: string;
  };
  githubRepo: string;
  demoUrl?: string;
  seller: {
    displayName: string;
    photoURL?: string;
  };
  stats: {
    views: number;
    sales: number;
  };
  buyers?: Array<{
    user: string;
    purchasedAt: string;
  }>;
}

const HomePro: React.FC = () => {
  const { user } = useAuth();
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<FeaturedProject | null>(null);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const response = await projectService.getFeaturedProjects();
        console.log('Featured projects response:', response.data);
        console.log('Projects with images:', response.data.projects?.map(p => ({
          title: p.title,
          imageUrl: p.image?.url
        })));
        setFeaturedProjects(response.data.projects || []);
      } catch (error) {
        console.error('Error fetching featured projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProjects();
  }, []);

  const handlePaymentSuccess = (orderId: string) => {
    console.log('Payment successful for order:', orderId);
    alert('Payment successful! You now have access to the project.');
    setModalOpen(false);
    setSelectedProject(null);
    // Optionally refresh the projects to update purchase status
    // fetchFeaturedProjects();
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error}`);
  };

  const isPurchased = (project: FeaturedProject) => {
    if (!user) return false;
    return project.buyers?.some(buyer => {
      const buyerUserId = typeof buyer.user === 'string' ? buyer.user : (buyer.user as any)?._id || buyer.user;
      const userIdToCompare = String(user._id);
      console.log('🔍 HomePro Purchase check:', {
        buyerUserId,
        userIdToCompare,
        match: buyerUserId === userIdToCompare
      });
      return buyerUserId === userIdToCompare;
    }) || false;
  };

  const handleProjectClick = (project: FeaturedProject) => {
    setSelectedProject(project);
    setModalOpen(true);
  };







  return (
    <div className="min-h-screen bg-background">
      {/* Hero Scroll Animation Section */}
      <HeroScrollDemo />





      {/* Featured Projects */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Featured Projects
            </h2>
            <p className="text-lg text-muted-foreground">
              Quality projects from verified developers
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-20 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="homepage-projects-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
              {featuredProjects.slice(0, 6).map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  isPurchased={isPurchased(project)}
                  user={user}
                  className="cursor-pointer project-card-container"
                  showBuyButton={true}
                  onClick={handleProjectClick}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/projects">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                View All Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose ProjectBuzz - 3D Pins */}
      <WhyChooseProjectBuzzPins />

      {/* How It Works - 3D Pins */}
      <HowItWorksPins />

      {/* Join Our Community - 3D Pins */}
      <JoinCommunityPins />

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {user ? (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Welcome back, {user.displayName}!
              </h2>
              <p className="text-lg mb-8 text-primary-foreground/80">
                Continue exploring amazing projects or manage your {user.role === 'seller' ? 'listings' : user.role === 'admin' ? 'platform' : 'purchases'}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-lg mb-8 text-primary-foreground/80">
                Join developers building amazing projects with ProjectBuzz
              </p>
            </>
          )}

          {user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/projects">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />} className="bg-background text-foreground hover:bg-background/90">
                  Browse Projects
                </Button>
              </Link>
              {user.role === 'seller' && (
                <Link to="/dashboard/seller">
                  <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Seller Dashboard
                  </Button>
                </Link>
              )}
              {user.role === 'buyer' && (
                <Link to="/dashboard/buyer">
                  <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    My Purchases
                  </Button>
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/dashboard/admin">
                  <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Admin Dashboard
                  </Button>
                </Link>
              )}
            </div>
          )}

          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/login">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />} className="bg-background text-foreground hover:bg-background/90">
                  Get Started
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Browse Projects
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-primary-foreground/70">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Free to join
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Secure payments
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              24/7 support
            </div>
          </div>
        </div>
      </section>

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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePro;