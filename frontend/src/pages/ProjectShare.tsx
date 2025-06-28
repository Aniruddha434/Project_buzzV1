import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { projectService } from '../services/projectService.js';
import { Calendar, Tag, User, Code, Clock, BookOpen, FileText, Settings, Play, Target, Eye, ShoppingCart, LogIn } from 'lucide-react';
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

  const handlePurchaseClick = () => {
    if (!user) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/project/share/${id}`);
    } else {
      // Redirect to main project page for purchase
      navigate(`/project/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-300">Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
        <div className="bg-gray-900 p-8 rounded-lg shadow-xl text-center border border-gray-700">
          <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-red-400 mb-3">Error</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link to="/" className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
        <div className="bg-gray-900 p-8 rounded-lg shadow-xl text-center border border-gray-700">
          <h1 className="text-2xl font-bold text-gray-300 mb-3">Project Not Found</h1>
          <p className="text-gray-400 mb-6">The project you are looking for does not exist or is not available for sharing.</p>
          <Link to="/" className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-gray-900 shadow-2xl rounded-xl overflow-hidden border border-gray-700">
        {/* Shared Project Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Shared Project</h2>
                <p className="text-blue-100 text-sm">View this amazing project from ProjectBuzz</p>
              </div>
            </div>
            <Link
              to="/"
              className="text-white hover:text-blue-200 text-sm font-medium"
            >
              Visit ProjectBuzz →
            </Link>
          </div>
        </div>

        {/* Project Images */}
        {(project.images && project.images.length > 0) || project.image ? (
          <div className="relative h-64 bg-gray-800">
            <img
              src={getImageUrl((project.images && project.images.length > 0) ? project.images[0].url : project.image?.url || '')}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            {project.images && project.images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                +{project.images.length - 1} more images
              </div>
            )}
          </div>
        ) : null}

        <div className="p-6 sm:p-10">
          <div className="mb-6">
            <Link to="/" className="text-sm text-blue-400 hover:text-blue-300 hover:underline">
              ← Explore More Projects on ProjectBuzz
            </Link>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">{project.title}</h1>
          <p className="text-2xl font-semibold text-blue-400 mb-6">₹{project.price.toFixed(2)}</p>

          <div className="prose prose-invert max-w-none text-gray-300 mb-8">
            <p>{project.description}</p>
          </div>

          {/* Purchase Call-to-Action */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Ready to get this project?</h3>
              <p className="text-gray-300 mb-4">
                {user ?
                  "Click below to purchase and get instant access to all project files." :
                  "Sign up or log in to purchase and get instant access to all project files."
                }
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handlePurchaseClick}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-150 transform hover:scale-105"
                >
                  {user ? (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Purchase Now
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      Login to Purchase
                    </>
                  )}
                </button>
                <Link
                  to="/"
                  className="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition duration-150"
                >
                  Browse More Projects
                </Link>
              </div>
            </div>
          </div>

          {/* Project Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Basic Info Card */}
            <div className="p-6 bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-xl border border-blue-700/50">
              <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Project Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-200">Seller:</span>
                  <span className="font-medium text-blue-100">{project.seller?.displayName || project.seller?.email || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Category:</span>
                  <span className="font-medium text-blue-100 capitalize">{project.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Updated:</span>
                  <span className="font-medium text-blue-100">{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="p-6 bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-xl border border-green-700/50">
              <h3 className="text-lg font-semibold text-green-300 mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Statistics
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-200">Views:</span>
                  <span className="font-medium text-green-100">{project.stats?.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200">Sales:</span>
                  <span className="font-medium text-green-100">{project.stats?.sales || 0}</span>
                </div>
              </div>
            </div>

            {/* Complexity & Progress Card */}
            <div className="p-6 bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-xl border border-purple-700/50">
              <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Progress
              </h3>
              <div className="space-y-4">
                {project.projectDetails?.complexityLevel && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-purple-200 text-sm">Complexity:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.projectDetails.complexityLevel === 'beginner' ? 'bg-green-600/30 text-green-300 border border-green-500/50' :
                        project.projectDetails.complexityLevel === 'intermediate' ? 'bg-yellow-600/30 text-yellow-300 border border-yellow-500/50' :
                        'bg-red-600/30 text-red-300 border border-red-500/50'
                      }`}>
                        {project.projectDetails.complexityLevel}
                      </span>
                    </div>
                  </div>
                )}
                {project.completionStatus !== undefined && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-purple-200 text-sm">Completion:</span>
                      <span className="font-medium text-purple-100">{project.completionStatus}%</span>
                    </div>
                    <div className="w-full bg-purple-800/50 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
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
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 mb-8">
              <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-600/30 text-blue-300 text-sm rounded-full font-medium border border-blue-500/50">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Limited Project Details for Public View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Tech Stack */}
            {project.projectDetails?.techStack && (
              <div className="p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50">
                <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
                  <Code className="h-5 w-5 mr-2" />
                  Technology Stack
                </h3>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-blue-600/30">
                  <p className="text-gray-300 whitespace-pre-wrap">{project.projectDetails.techStack}</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            {project.projectDetails?.timeline && (
              <div className="p-6 bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl border border-green-700/50">
                <h3 className="text-lg font-semibold text-green-300 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Development Timeline
                </h3>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-green-600/30">
                  <p className="text-gray-300 whitespace-pre-wrap">{project.projectDetails.timeline}</p>
                </div>
              </div>
            )}
          </div>

          {/* Final Call-to-Action */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Want to access the full project?</h3>
            <p className="text-gray-300 mb-4">
              Get instant access to source code, documentation, and all project files.
            </p>
            <button
              onClick={handlePurchaseClick}
              className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition duration-150 transform hover:scale-105"
            >
              {user ? (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Purchase for ₹{project.price.toFixed(2)}
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Login to Purchase
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSharePage;
