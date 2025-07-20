import React, { useState, useEffect, useMemo } from 'react';
import type { FC } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { projectService } from '../services/projectService.js';
import { Calendar, Tag, User, Code, Clock, BookOpen, FileText, Download, Settings, Play, Target, Zap, Eye, Share2, ShoppingCart, LogIn, CheckCircle } from 'lucide-react';
import UniversalBuyButton from '../components/UniversalBuyButton';
import ShareModal from '../components/ShareModal';
import { getImageUrl } from '../utils/imageUtils.js';

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
  githubRepo?: string;
  demoUrl?: string;
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
  buyers: Array<{
    user: string;
    purchasedAt: string;
    orderId?: string;
  }>;
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
  createdAt: string;
  updatedAt: string;
}

const ProjectDetailsPage: FC = () => {
  const { id } = useParams<{ id: string }>(); // Typed route parameter
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

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
          setProject(response.data);
        } else {
          setError('Project not found. It might have been removed or the ID is incorrect.');
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

  // Check if user has purchased the project (for documentation access)
  const isPurchased = useMemo(() => {
    if (!user || !project) return false;
    return project.buyers?.some(buyer => {
      const buyerUserId = typeof buyer.user === 'string' ? buyer.user : (buyer.user as any)?._id || buyer.user;
      const userIdToCompare = String(user._id);
      console.log('🔍 Purchase check:', {
        buyerUserId,
        userIdToCompare,
        match: buyerUserId === userIdToCompare
      });
      return buyerUserId === userIdToCompare;
    }) || false;
  }, [user, project]);

  // Check if user is the seller
  const isSeller = useMemo(() => {
    if (!user || !project) return false;
    const sellerIdToCompare = String(project.seller?._id || '');
    const userIdToCompare = String(user._id);
    return sellerIdToCompare === userIdToCompare;
  }, [user, project]);

  // Authorization check, derived from project and user state
  const isAuthorized = useMemo(() => {
    return isSeller || isPurchased;
  }, [isSeller, isPurchased]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-xl text-center border border-gray-200 dark:border-gray-800">
          <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">Error</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <Link to="/" className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Back to Homepage</Link>
        </div>
      </div>
    );
  }

  if (!project) {
    // This case should ideally be handled by the error state from fetchProject
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-xl text-center border border-gray-200 dark:border-gray-800">
                <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3">Project Not Found</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">The project you are looking for does not exist.</p>
                <Link to="/" className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Back to Homepage</Link>
            </div>
        </div>
    );
  }

  // Only show project details if project status is 'approved' OR if user is authorized (seller/buyer)
  if (project.status !== 'approved' && !isAuthorized) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 pt-24">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-xl text-center border border-gray-200 dark:border-gray-800">
                <h1 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-3">Project Not Available</h1>
                <p className="text-gray-700 dark:text-gray-300 mb-6">This project is currently not approved for public viewing.</p>
                <Link to="/projects" className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Browse Other Projects</Link>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-4 px-4 sm:px-6 lg:px-8 pt-16">
      <div className="max-w-5xl mx-auto bg-black shadow-2xl rounded-lg overflow-hidden border border-gray-800">
        {/* Project Images */}
        {(project.images && project.images.length > 0) || project.image ? (
          <div className="relative h-48 bg-gray-900">
            <img
              src={getImageUrl((project.images && project.images.length > 0) ? project.images[0].url : project.image?.url || '')}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            {project.images && project.images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                +{project.images.length - 1} more
              </div>
            )}
          </div>
        ) : null}

        <div className="p-4 sm:p-6">
          <div className="mb-3">
            <Link to="/projects" className="text-sm text-gray-400 hover:text-white transition-colors">&larr; Back to Projects</Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{project.title}</h1>
              <p className="text-lg font-semibold text-white mb-3">₹{project.price.toFixed(2)}</p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mb-3">
                {/* Universal Buy Button */}
                <UniversalBuyButton
                  project={project}
                  user={user}
                  isPurchased={isPurchased}
                  preferModal={false}
                />

                {/* Share Button */}
                <button
                  onClick={() => {
                    console.log('Share button clicked for project:', project._id);
                    setShowShareModal(true);
                  }}
                  className="inline-flex items-center px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded text-sm transition-colors border border-gray-700"
                  title="Share this project"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-300 text-sm leading-relaxed">{project.description}</p>
          </div>

          {/* Project Information */}
          <div className="mb-4 space-y-4">
            {/* Project Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Basic Info Card */}
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  Project Info
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Seller:</span>
                    <span className="text-white">{project.seller?.displayName || project.seller?.email || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span className="text-white capitalize">{project.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`capitalize ${project.status === 'approved' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Updated:</span>
                    <span className="text-white">{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Stats Card - Hidden for buyers who purchased */}
              {!isPurchased && (
                <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Statistics
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Views:</span>
                      <span className="text-white">{project.stats?.views || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sales:</span>
                      <span className="text-white">{project.stats?.sales || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Downloads:</span>
                      <span className="text-white">{project.stats?.downloads || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Complexity & Progress Card */}
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                  <Target className="h-3.5 w-3.5 mr-1.5" />
                  Progress
                </h3>
                <div className="space-y-2">
                  {project.projectDetails?.complexityLevel && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400 text-xs">Complexity:</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          project.projectDetails.complexityLevel === 'beginner' ? 'bg-gray-800 text-green-400 border border-gray-700' :
                          project.projectDetails.complexityLevel === 'intermediate' ? 'bg-gray-800 text-yellow-400 border border-gray-700' :
                          'bg-gray-800 text-red-400 border border-gray-700'
                        }`}>
                          {project.projectDetails.complexityLevel}
                        </span>
                      </div>
                    </div>
                  )}
                  {project.completionStatus !== undefined && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400 text-xs">Completion:</span>
                        <span className="text-white text-xs">{project.completionStatus}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-white h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${project.completionStatus}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Technologies */}
            {project.tags && project.tags.length > 0 && (
              <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                  <Tag className="h-3.5 w-3.5 mr-1.5" />
                  Technologies Used
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Project Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Tech Stack */}
              {project.projectDetails?.techStack && (
                <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                    <Code className="h-3.5 w-3.5 mr-1.5" />
                    Technology Stack
                  </h3>
                  <div className="p-2.5 bg-gray-800 rounded border border-gray-700">
                    <p className="text-gray-300 text-xs whitespace-pre-wrap">{project.projectDetails.techStack}</p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              {project.projectDetails?.timeline && (
                <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    Development Timeline
                  </h3>
                  <div className="p-2.5 bg-gray-800 rounded border border-gray-700">
                    <p className="text-gray-300 text-xs whitespace-pre-wrap">{project.projectDetails.timeline}</p>
                  </div>
                </div>
              )}

              {/* Prerequisites */}
              {project.projectDetails?.prerequisites && (
                <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                    <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                    Prerequisites
                  </h3>
                  <div className="p-2.5 bg-gray-800 rounded border border-gray-700">
                    <p className="text-gray-300 text-xs whitespace-pre-wrap">{project.projectDetails.prerequisites}</p>
                  </div>
                </div>
              )}

              {/* Documentation Files */}
              {project.documentationFiles && project.documentationFiles.length > 0 && (
                <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    Documentation Files
                  </h3>
                  <div className="space-y-2">
                    {project.documentationFiles.map((doc, index) => (
                      <div key={index} className="p-3 bg-gray-800 rounded border border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="p-1 rounded bg-gray-700 border border-gray-600">
                              <FileText className="h-3 w-3 text-gray-300" />
                            </div>
                            <div>
                              <p className="text-white text-xs">{doc.originalName}</p>
                              <p className="text-gray-400 text-xs capitalize">
                                {doc.fileType} • {(doc.size / 1024).toFixed(1)} KB
                              </p>
                              {doc.description && (
                                <p className="text-gray-300 text-xs mt-1">{doc.description}</p>
                              )}
                            </div>
                          </div>
                          {isPurchased ? (
                            <button
                              onClick={async () => {
                                try {
                                  await projectService.downloadDocumentationFile(doc.filename, doc.originalName);
                                } catch (error: any) {
                                  console.error('Documentation download failed:', error);
                                  alert(`Failed to download ${doc.originalName}: ${error.message || 'Download failed'}`);
                                }
                              }}
                              className="p-1 text-gray-300 hover:text-white transition-colors"
                            >
                              <Download className="h-3 w-3" />
                            </button>
                          ) : (
                            <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded border border-gray-600">
                              Purchase Required
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Installation and Usage Instructions */}
            {(project.projectDetails?.installationInstructions || project.projectDetails?.usageInstructions) && (
              <div className="space-y-4">
                {/* Installation Instructions */}
                {project.projectDetails?.installationInstructions && (
                  <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                    <h3 className="text-sm font-medium text-white mb-3 flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Installation Instructions
                    </h3>
                    <div className="p-3 bg-gray-800 rounded border border-gray-700">
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono overflow-x-auto">
                        {project.projectDetails.installationInstructions}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Usage Instructions */}
                {project.projectDetails?.usageInstructions && (
                  <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                    <h3 className="text-sm font-medium text-white mb-3 flex items-center">
                      <Play className="h-4 w-4 mr-2" />
                      Usage Instructions
                    </h3>
                    <div className="p-3 bg-gray-800 rounded border border-gray-700">
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono overflow-x-auto">
                        {project.projectDetails.usageInstructions}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {isAuthorized ? (
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h2 className="text-sm font-medium text-white mb-3">Access Your Resources</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  onClick={async () => {
                    try {
                      const accessResponse = await projectService.getProjectAccess(project._id);
                      if (accessResponse.success && accessResponse.data.downloadUrl) {
                        window.open(accessResponse.data.downloadUrl, '_blank');
                      } else {
                        alert('Download link not available');
                      }
                    } catch (error) {
                      console.error('Error getting download link:', error);
                      alert('Failed to get download link');
                    }
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-gray-100 text-black text-sm font-medium rounded transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                  Download Project Files
                </button>
                {project.githubRepo && (
                  <a
                    href={project.githubRepo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded border border-gray-700 transition-colors"
                  >
                     <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.602-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.074 1.532 1.028 1.532 1.028.892 1.53 2.341 1.087 2.91.831.091-.645.349-1.086.635-1.337-2.22-.251-4.555-1.112-4.555-4.943 0-1.091.39-1.984 1.029-2.685-.103-.252-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.024A9.542 9.542 0 0110 4.817c.85.004 1.705.114 2.504.336 1.909-1.293 2.748-1.024 2.748-1.024.546 1.377.203 2.395.1 2.647.64.701 1.027 1.594 1.027 2.685 0 3.841-2.337 4.687-4.565 4.935.358.307.678.918.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .268.18.578.688.482A10.001 10.001 0 0020 10c0-5.523-4.477-10-10-10z" clipRule="evenodd"></path></svg>
                    View GitHub Repo
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded border border-gray-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                    View Demo
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-gray-900 border-l-4 border-gray-700 rounded">
              <h3 className="text-sm font-medium text-white">Private Resources</h3>
              <p className="text-gray-300 text-sm mt-1">
                To access project files and the GitHub repository (if available), you need to purchase this project.
              </p>
              <div className="mt-3">
                <UniversalBuyButton
                  project={project}
                  user={user}
                  isPurchased={isPurchased}
                  preferModal={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {project && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          projectId={project._id}
          projectTitle={project.title}
        />
      )}
    </div>
  );
};

export default ProjectDetailsPage;