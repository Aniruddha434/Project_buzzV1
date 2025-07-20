import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { projectService } from '../services/projectService.js';
import { Calendar, Tag, User, Code, Clock, Eye, ShoppingCart, LogIn, ArrowLeft, Share2 } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils.js';
import EnhancedProjectModal from '../components/EnhancedProjectModal';

interface ProjectImage {
  url: string;
  filename: string;
  originalName: string;
  isPrimary?: boolean;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags?: string[];
  images?: ProjectImage[];
  image?: ProjectImage;
  seller?: {
    _id: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
  };
  stats?: {
    views: number;
    sales: number;
    downloads: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  completionStatus?: number;
  projectDetails?: {
    timeline?: string;
    techStack?: string;
    complexityLevel?: 'beginner' | 'intermediate' | 'advanced';
    installationInstructions?: string;
    usageInstructions?: string;
    prerequisites?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const ProjectSharePage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Using centralized getImageUrl from utils

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError('Project ID is missing.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await projectService.getProject(id);
        if (response.success && response.data) {
          // Only show approved projects for public sharing
          if (response.data.status === 'approved') {
            setProject(response.data);
          } else {
            setError('This project is not available for public viewing.');
          }
        } else {
          setError('Project not found or not available for sharing.');
        }
      } catch (err: any) {
        console.error('Error fetching project details:', err);
        setError('Failed to fetch project details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Check if user just registered and should auto-open purchase modal
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const autoOpenPurchase = urlParams.get('purchase');

    if (user && autoOpenPurchase === 'true' && project) {
      setShowPurchaseModal(true);
      // Clean up URL
      navigate(`/project/share/${id}`, { replace: true });
    }
  }, [user, project, location.search, id, navigate]);

  const handlePurchaseClick = () => {
    if (!user) {
      // Redirect to login with return URL that includes purchase parameter
      navigate(`/login?redirect=/project/share/${id}?purchase=true`);
    } else {
      // Open purchase modal directly on this page
      setShowPurchaseModal(true);
    }
  };

  const handlePaymentSuccess = (orderId: string) => {
    console.log('Payment successful:', orderId);
    setShowPurchaseModal(false);
    // Redirect to success page
    navigate('/payment/success');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // Handle payment error - keep modal open for retry
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-16"></div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <div className="h-16"></div>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-white mb-3">Project Not Available</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to ProjectBuzz
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black">
        <div className="h-16"></div>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-white mb-3">Project Not Found</h1>
            <p className="text-gray-400 mb-6">The project you are looking for does not exist or is not available for sharing.</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to ProjectBuzz
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header spacing to prevent navbar overlap */}
      <div className="h-16"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to ProjectBuzz
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Images - Left Column */}
          <div className="lg:col-span-2">
            {(project.images && project.images.length > 0) || project.image ? (
              <div className="relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                <img
                  src={getImageUrl((project.images && project.images.length > 0) ? project.images[0].url : project.image?.url || '')}
                  alt={project.title}
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                />
                {project.images && project.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    +{project.images.length - 1} more
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg border border-gray-800 h-64 sm:h-80 lg:h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Code className="h-12 w-12 mx-auto mb-2" />
                  <p>No preview available</p>
                </div>
              </div>
            )}

            {/* Project Description - Below Image */}
            <div className="mt-4">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-3">{project.title}</h1>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-sm leading-relaxed">{project.description}</p>
              </div>
            </div>
          </div>

          {/* Purchase Panel - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sticky top-24">
              {/* Price */}
              <div className="mb-4">
                <div className="text-lg font-bold text-white mb-1">₹{project.price}</div>
                <div className="text-xs text-gray-400">One-time purchase</div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={handlePurchaseClick}
                className="inline-flex items-center px-3 py-1.5 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded border border-gray-600 hover:border-gray-500 transition-colors mb-3 w-full justify-center"
              >
                {user ? (
                  <>
                    <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                    Buy Now
                  </>
                ) : (
                  <>
                    <LogIn className="h-3.5 w-3.5 mr-1.5" />
                    Sign in to Buy
                  </>
                )}
              </button>

              {/* Project Info */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-800">
                  <span className="text-gray-400">Category</span>
                  <span className="text-white capitalize">{project.category}</span>
                </div>

                {project.seller && (
                  <div className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-400">Seller</span>
                    <span className="text-white">{project.seller.displayName || project.seller.email || 'Unknown'}</span>
                  </div>
                )}

                {project.stats && (
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Sales</span>
                      <span className="text-white">{project.stats.sales || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Views</span>
                      <span className="text-white">{project.stats.views || 0}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Last Updated</span>
                  <span className="text-white">{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Share Button */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Project
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Project Details */}
        <div className="mt-12 space-y-8">
          {/* Technologies */}
          {project.tags && project.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full border border-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Project Details Grid */}
          {(project.projectDetails?.techStack || project.projectDetails?.timeline) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tech Stack */}
              {project.projectDetails?.techStack && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    Technology Stack
                  </h3>
                  <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                    {project.projectDetails.techStack}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {project.projectDetails?.timeline && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Development Timeline
                  </h3>
                  <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                    {project.projectDetails.timeline}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Complexity Level */}
          {project.projectDetails?.complexityLevel && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Project Complexity</h3>
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.projectDetails.complexityLevel === 'beginner' ? 'bg-green-900 text-green-300 border border-green-800' :
                  project.projectDetails.complexityLevel === 'intermediate' ? 'bg-yellow-900 text-yellow-300 border border-yellow-800' :
                  'bg-red-900 text-red-300 border border-red-800'
                }`}>
                  {project.projectDetails.complexityLevel.charAt(0).toUpperCase() + project.projectDetails.complexityLevel.slice(1)}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Enhanced Project Modal for Purchase */}
      {showPurchaseModal && project && (
        <EnhancedProjectModal
          project={project}
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
    </div>
  );
};

export default ProjectSharePage;
