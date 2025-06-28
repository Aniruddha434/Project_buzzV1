import React, { useState } from 'react';
import {
  X, Github, ExternalLink, Eye, Calendar, Tag, User,
  ShoppingCart, CheckCircle, XCircle, Clock, AlertTriangle,
  Download, DollarSign, Package, FileText
} from 'lucide-react';
import Button from './ui/Button';
import Badge from './ui/Badge';

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
  file?: {
    url: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
  };
  seller?: {
    _id: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
  };
  buyers?: Array<{
    user: string;
    purchasedAt: string;
    downloadCount: number;
  }>;
  stats?: {
    views: number;
    sales: number;
    downloads: number;
    revenue: number;
  };
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
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

interface AdminProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onStatusChange: (projectId: string, newStatus: Project['status']) => void;
  onDelete?: (projectId: string) => void;
}

const AdminProjectModal: React.FC<AdminProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onStatusChange,
  onDelete
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  if (!isOpen) return null;

  // Early return if project data is invalid
  if (!project || !project._id || !project.title) {
    console.warn('AdminProjectModal: Invalid project data received', project);
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <X className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Invalid Project Data</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The project information could not be loaded properly.
              </p>
              <Button onClick={onClose} variant="primary">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get all project images
  const getProjectImages = () => {
    const images = [];

    if (project.images && project.images.length > 0) {
      images.push(...project.images);
    }

    if (project.image?.url && !images.some(img => img.url === project.image?.url)) {
      images.push(project.image);
    }

    return images;
  };

  const projectImages = getProjectImages();

  const handleStatusChange = async (newStatus: Project['status']) => {
    setActionLoading(true);
    try {
      await onStatusChange(project._id, newStatus);
      // Don't close modal immediately, let parent handle success feedback
    } catch (error) {
      console.error('Failed to update project status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'suspended': return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
          {/* Header with admin controls */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Admin Review</span>
                <span>›</span>
                <span className="capitalize">{project.category}</span>
                <span>›</span>
                <span className="text-gray-900 dark:text-white font-medium truncate max-w-xs">
                  {project.title}
                </span>
              </div>
              <Badge
                variant={getStatusColor(project.status) as any}
                className="flex items-center space-x-1"
              >
                {getStatusIcon(project.status)}
                <span className="capitalize">{project.status}</span>
              </Badge>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">

              {/* Left Column - Images (30%) */}
              <div className="lg:col-span-1">
                {projectImages.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                      <img
                        src={projectImages[selectedImageIndex]?.url}
                        alt={`${project.title} - Image ${selectedImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Thumbnail Navigation */}
                    {projectImages.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {projectImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImageIndex === index
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={image.url}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">No images available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Middle Column - Project Details (40%) */}
              <div className="lg:col-span-1 space-y-6">
                {/* Title and Category */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="default" className="capitalize bg-orange-100 text-orange-800">
                      {project.category}
                    </Badge>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Digital Product
                    </Badge>
                    {project.projectDetails?.complexityLevel && (
                      <Badge variant="default" className={`capitalize ${
                        project.projectDetails.complexityLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                        project.projectDetails.complexityLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {project.projectDetails.complexityLevel}
                      </Badge>
                    )}
                    {project.completionStatus !== undefined && project.completionStatus < 100 && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        {project.completionStatus}% Complete
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                    {project.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                        {project.seller?.displayName || project.seller?.email || 'Unknown Seller'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Project Information */}
                {(project.projectDetails?.techStack || project.projectDetails?.timeline ||
                  project.projectDetails?.prerequisites || project.documentationFiles?.length) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Enhanced Project Information</h3>

                    {/* Tech Stack */}
                    {project.projectDetails?.techStack && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Technologies Used</h4>
                        <p className="text-blue-700 dark:text-blue-400 text-sm">{project.projectDetails.techStack}</p>
                      </div>
                    )}

                    {/* Timeline and Prerequisites */}
                    <div className="grid grid-cols-1 gap-3">
                      {project.projectDetails?.timeline && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Development Timeline</h4>
                          <p className="text-green-700 dark:text-green-400 text-sm">{project.projectDetails.timeline}</p>
                        </div>
                      )}

                      {project.projectDetails?.prerequisites && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">Prerequisites</h4>
                          <p className="text-yellow-700 dark:text-yellow-400 text-sm">{project.projectDetails.prerequisites}</p>
                        </div>
                      )}
                    </div>

                    {/* Documentation Files */}
                    {project.documentationFiles && project.documentationFiles.length > 0 && (
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2">Documentation Files ({project.documentationFiles.length})</h4>
                        <div className="space-y-2">
                          {project.documentationFiles.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between text-sm p-2 bg-white dark:bg-gray-800 rounded border">
                              <div className="flex items-center">
                                <span className="mr-2">
                                  {doc.fileType === 'readme' ? '📖' : doc.fileType === 'technical' ? '🔧' : '📋'}
                                </span>
                                <div>
                                  <span className="text-indigo-700 dark:text-indigo-400 font-medium">{doc.originalName}</span>
                                  <div className="text-xs text-gray-500">
                                    <span className="capitalize">{doc.fileType}</span> • {(doc.size / 1024).toFixed(1)} KB
                                    {doc.description && <span> • {doc.description}</span>}
                                  </div>
                                </div>
                              </div>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 transition-colors"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Installation Instructions */}
                    {project.projectDetails?.installationInstructions && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Installation Instructions</h4>
                        <div className="text-green-700 dark:text-green-400 text-sm whitespace-pre-wrap bg-white dark:bg-gray-800 p-2 rounded border font-mono">
                          {project.projectDetails.installationInstructions}
                        </div>
                      </div>
                    )}

                    {/* Usage Instructions */}
                    {project.projectDetails?.usageInstructions && (
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Usage Instructions</h4>
                        <div className="text-purple-700 dark:text-purple-400 text-sm whitespace-pre-wrap bg-white dark:bg-gray-800 p-2 rounded border font-mono">
                          {project.projectDetails.usageInstructions}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Links */}
                <div className="space-y-3">
                  {project.githubRepo && (
                    <a
                      href={project.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      View Source Code
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Live Demo
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {project.stats?.views || 0}
                    </div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {project.stats?.sales || 0}
                    </div>
                    <div className="text-xs text-gray-500">Sales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {project.stats?.downloads || 0}
                    </div>
                    <div className="text-xs text-gray-500">Downloads</div>
                  </div>
                </div>
              </div>

              {/* Right Column - Admin Actions & Info (30%) */}
              <div className="lg:col-span-1 space-y-6">
                {/* Price */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Price</span>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-600 mr-1" />
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${project.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* File Information */}
                {project.file && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Project File
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Filename:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {project.file.originalName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Type:</span>
                        <span className="text-gray-900 dark:text-white">
                          {project.file.mimetype}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Size:</span>
                        <span className="text-gray-900 dark:text-white">
                          {formatFileSize(project.file.size)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Seller Information */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Seller Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {project.seller?.displayName || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="text-gray-900 dark:text-white">
                        {project.seller?.email || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">ID:</span>
                      <span className="text-gray-900 dark:text-white font-mono text-xs">
                        {project.seller?._id || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    Admin Actions
                  </h3>

                  <div className="space-y-3">
                    {project.status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusChange('approved')}
                          disabled={actionLoading}
                          className="w-full"
                          leftIcon={<CheckCircle className="h-4 w-4" />}
                        >
                          {actionLoading ? 'Processing...' : 'Approve Project'}
                        </Button>
                        <Button
                          variant="error"
                          size="sm"
                          onClick={() => handleStatusChange('rejected')}
                          disabled={actionLoading}
                          className="w-full"
                          leftIcon={<XCircle className="h-4 w-4" />}
                        >
                          {actionLoading ? 'Processing...' : 'Reject Project'}
                        </Button>
                      </>
                    )}

                    {project.status === 'approved' && (
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleStatusChange('suspended')}
                        disabled={actionLoading}
                        className="w-full"
                        leftIcon={<AlertTriangle className="h-4 w-4" />}
                      >
                        {actionLoading ? 'Processing...' : 'Suspend Project'}
                      </Button>
                    )}

                    {(project.status === 'rejected' || project.status === 'suspended') && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleStatusChange('approved')}
                        disabled={actionLoading}
                        className="w-full"
                        leftIcon={<CheckCircle className="h-4 w-4" />}
                      >
                        {actionLoading ? 'Processing...' : 'Restore Project'}
                      </Button>
                    )}

                    {/* Delete Action */}
                    {onDelete && (
                      <Button
                        variant="error"
                        size="sm"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                            onDelete(project._id);
                            onClose();
                          }
                        }}
                        disabled={actionLoading}
                        className="w-full mt-4 border-t border-red-200 dark:border-red-800 pt-3"
                        leftIcon={<X className="h-4 w-4" />}
                      >
                        Delete Project
                      </Button>
                    )}
                  </div>
                </div>

                {/* Completion Status */}
                {project.completionStatus !== undefined && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Completion Status</h3>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${project.completionStatus}%` }}
                      ></div>
                    </div>
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                      {project.completionStatus}% Complete
                    </div>
                  </div>
                )}

                {/* Project Metadata */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Metadata</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Created:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(project.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(project.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Project ID:</span>
                      <span className="text-gray-900 dark:text-white font-mono text-xs">
                        {project._id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Buyers:</span>
                      <span className="text-gray-900 dark:text-white">
                        {project.buyers?.length || 0}
                      </span>
                    </div>
                    {project.projectDetails?.complexityLevel && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Complexity:</span>
                        <span className={`capitalize font-medium ${
                          project.projectDetails.complexityLevel === 'beginner' ? 'text-green-600' :
                          project.projectDetails.complexityLevel === 'intermediate' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {project.projectDetails.complexityLevel}
                        </span>
                      </div>
                    )}
                    {project.documentationFiles && project.documentationFiles.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Documentation:</span>
                        <span className="text-gray-900 dark:text-white">
                          {project.documentationFiles.length} files
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProjectModal;
