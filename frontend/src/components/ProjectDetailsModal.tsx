import React, { useState } from 'react';
import { X, Github, ExternalLink, Eye, Calendar, Tag, User, ShoppingCart, CheckCircle, Download } from 'lucide-react';
import Button from './ui/Button';
import PaymentModal from './PaymentModal';
import { NegotiationButton } from './NegotiationButton';
import { projectService } from '../services/projectService';

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
  projectZipFile?: {
    url: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    uploadedAt: string;
    description?: string;
  };
  projectDetails?: {
    timeline?: string;
    techStack?: string;
    complexityLevel?: 'beginner' | 'intermediate' | 'advanced';
    installationInstructions?: string;
    usageInstructions?: string;
    prerequisites?: string;
  };
}

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onPurchase?: (project: Project) => void;
  isPurchased?: boolean;
  user?: any;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  project,
  onPurchase,
  isPurchased = false,
  user
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!isOpen) return null;

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

  const images = getProjectImages();
  const currentImage = images[selectedImageIndex];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" data-modal="project-details">
      {/* Professional Dark Backdrop */}
      <div className="fixed inset-0 backdrop-blur-sm transition-opacity" style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }} onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden"
          style={{
            backgroundColor: '#000000',
            border: '1px solid #374151',
            color: '#ffffff'
          }}
          data-modal-content="project-details"
        >
          {/* Professional Header */}
          <div
            className="flex items-center justify-between p-6"
            style={{
              backgroundColor: '#111827',
              borderBottom: '1px solid #374151'
            }}
          >
            <div className="flex items-center space-x-3 text-sm">
              <span style={{ color: '#9ca3af' }}>Projects</span>
              <span style={{ color: '#6b7280' }}>›</span>
              <span className="capitalize" style={{ color: '#d1d5db' }}>{project.category}</span>
              <span style={{ color: '#6b7280' }}>›</span>
              <span className="font-medium truncate max-w-xs" style={{ color: '#ffffff' }}>
                {project.title}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors group"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X className="h-5 w-5" style={{ color: '#9ca3af' }} />
            </button>
          </div>

          {/* Content */}
          <div
            className="overflow-y-auto max-h-[calc(95vh-80px)]"
            style={{
              backgroundColor: '#000000',
              color: '#ffffff'
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
              {/* Left Column - Images (40%) */}
              <div className="lg:col-span-1 space-y-4">
                {/* Main Image */}
                <div
                  className="aspect-square rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151'
                  }}
                >
                  {currentImage?.url ? (
                    <img
                      src={currentImage.url}
                      alt={project.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div
                          className="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: '#374151' }}
                        >
                          <Eye className="h-8 w-8" style={{ color: '#9ca3af' }} />
                        </div>
                        <p style={{ color: '#9ca3af' }}>No preview available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Thumbnails */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(0, 4).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                          index === selectedImageIndex
                            ? 'border-blue-500 ring-2 ring-blue-500/20'
                            : 'border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* View More Images */}
                {images.length > 4 && (
                  <button
                    className="w-full py-2 text-sm font-medium"
                    style={{ color: '#60a5fa' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#93c5fd'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#60a5fa'}
                  >
                    View all {images.length} images
                  </button>
                )}
              </div>

              {/* Middle Column - Product Details (40%) */}
              <div className="lg:col-span-1 space-y-6">
                {/* Title and Brand */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className="capitalize px-2 py-1 text-xs font-semibold rounded"
                      style={{
                        backgroundColor: 'rgba(194, 65, 12, 0.4)',
                        color: '#fed7aa',
                        border: '1px solid #c2410c',
                        textShadow: 'none'
                      }}
                    >
                      {project.category}
                    </span>
                    <span
                      className="px-2 py-1 text-xs font-semibold rounded"
                      style={{
                        backgroundColor: 'rgba(21, 128, 61, 0.4)',
                        color: '#bbf7d0',
                        border: '1px solid #15803d',
                        textShadow: 'none'
                      }}
                    >
                      Digital Product
                    </span>
                    {project.projectDetails?.complexityLevel && (
                      <span
                        className="capitalize px-2 py-1 text-xs font-semibold rounded"
                        style={{
                          backgroundColor: project.projectDetails.complexityLevel === 'beginner'
                            ? 'rgba(21, 128, 61, 0.4)'
                            : project.projectDetails.complexityLevel === 'intermediate'
                            ? 'rgba(161, 98, 7, 0.4)'
                            : 'rgba(185, 28, 28, 0.4)',
                          color: project.projectDetails.complexityLevel === 'beginner'
                            ? '#bbf7d0'
                            : project.projectDetails.complexityLevel === 'intermediate'
                            ? '#fef3c7'
                            : '#fecaca',
                          border: project.projectDetails.complexityLevel === 'beginner'
                            ? '1px solid #15803d'
                            : project.projectDetails.complexityLevel === 'intermediate'
                            ? '1px solid #a16207'
                            : '1px solid #b91c1c',
                          textShadow: 'none'
                        }}
                      >
                        {project.projectDetails.complexityLevel}
                      </span>
                    )}
                    {project.completionStatus !== undefined && project.completionStatus < 100 && (
                      <span
                        className="px-2 py-1 text-xs font-semibold rounded"
                        style={{
                          backgroundColor: 'rgba(29, 78, 216, 0.4)',
                          color: '#bfdbfe',
                          border: '1px solid #1d4ed8',
                          textShadow: 'none'
                        }}
                      >
                        {project.completionStatus}% Complete
                      </span>
                    )}
                    {project.documentationFiles && project.documentationFiles.length > 0 && (
                      <span
                        className="px-2 py-1 text-xs font-semibold rounded"
                        style={{
                          backgroundColor: 'rgba(126, 34, 206, 0.4)',
                          color: '#e9d5ff',
                          border: '1px solid #7e22ce',
                          textShadow: 'none'
                        }}
                      >
                        📚 Docs Available
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold mb-2 leading-tight" style={{ color: '#ffffff' }}>
                    {project.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm mb-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" style={{ color: '#9ca3af' }} />
                      <span style={{ color: '#60a5fa' }} className="hover:text-blue-300 cursor-pointer">
                        {project.seller?.displayName || 'Unknown Seller'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" style={{ color: '#9ca3af' }} />
                      <span style={{ color: '#9ca3af' }}>{formatDate(project.createdAt)}</span>
                    </div>
                  </div>
                </div>



                {/* Description Preview */}
                <div className="space-y-3">
                  <h3 className="font-semibold" style={{ color: '#ffffff' }}>About this project</h3>
                  <p className="text-sm line-clamp-3" style={{ color: '#d1d5db' }}>
                    {project.description}
                  </p>
                </div>

                {/* Technologies */}
                {project.tags && project.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center" style={{ color: '#ffffff' }}>
                      <Tag className="h-4 w-4 mr-2" style={{ color: '#9ca3af' }} />
                      Technologies Used
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-semibold rounded"
                          style={{
                            backgroundColor: 'rgba(29, 78, 216, 0.4)',
                            color: '#bfdbfe',
                            border: '1px solid #1d4ed8',
                            textShadow: 'none'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div
                  className="grid grid-cols-3 gap-4 p-4 rounded-lg"
                  style={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151'
                  }}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ color: '#ffffff' }}>
                      {project.stats?.views || 0}
                    </div>
                    <div className="text-xs" style={{ color: '#9ca3af' }}>Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ color: '#ffffff' }}>
                      {project.stats?.sales || 0}
                    </div>
                    <div className="text-xs" style={{ color: '#9ca3af' }}>Sales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ color: '#ffffff' }}>
                      {project.stats?.downloads || 0}
                    </div>
                    <div className="text-xs" style={{ color: '#9ca3af' }}>Downloads</div>
                  </div>
                </div>
              </div>

              {/* Right Column - Purchase Box (20%) */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-4">
                  {/* Purchase Card */}
                  <div
                    className="rounded-xl p-6 shadow-2xl"
                    style={{
                      backgroundColor: '#111827',
                      border: '1px solid #374151'
                    }}
                  >
                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline space-x-2 mb-2">
                        <span
                          className="text-3xl font-bold"
                          style={{ color: '#ffffff' }}
                        >
                          ₹{project.price}
                        </span>
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: '#9ca3af' }}
                      >
                        Digital download
                      </div>
                    </div>

                    {/* Purchase Actions */}
                    {user && user.role === 'buyer' ? (
                      isPurchased ? (
                        <div className="space-y-3">
                          <div
                            className="flex items-center justify-center p-4 rounded-xl"
                            style={{
                              backgroundColor: 'rgba(21, 128, 61, 0.3)',
                              border: '1px solid #15803d'
                            }}
                          >
                            <CheckCircle className="h-5 w-5 mr-2" style={{ color: '#22c55e' }} />
                            <span className="font-medium" style={{ color: '#bbf7d0' }}>
                              You own this project
                            </span>
                          </div>
                          {project.githubRepo && (
                            <a
                              href={project.githubRepo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <Button
                                variant="outline"
                                size="lg"
                                leftIcon={<Github className="h-5 w-5" />}
                                className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                              >
                                Access Source Code
                              </Button>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="payment-modal relative z-10">
                            <PaymentModal
                              project={project}
                              isOpen={false}
                              onClose={() => {}}
                              onPaymentSuccess={() => {
                                console.log('Payment successful');
                                onPurchase?.(project);
                              }}
                              onPaymentError={(error) => {
                                console.error('Payment error:', error);
                              }}
                              trigger={
                                <Button
                                  variant="primary"
                                  size="lg"
                                  leftIcon={<ShoppingCart className="h-5 w-5" />}
                                  className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3"
                                >
                                  Buy Now
                                </Button>
                              }
                            />
                          </div>
                          <div className="negotiation-button relative z-10">
                            <NegotiationButton
                              projectId={project._id}
                              projectTitle={project.title}
                              originalPrice={project.price}
                              onNegotiationStart={() => {
                                console.log('Negotiation started for project:', project.title);
                              }}
                            />
                          </div>
                        </div>
                      )
                    ) : (
                      <Button
                        variant="primary"
                        size="lg"
                        leftIcon={<ShoppingCart className="h-5 w-5" />}
                        onClick={onClose}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
                      >
                        {user ? 'Contact Seller' : 'Sign in to Buy'}
                      </Button>
                    )}

                    {/* Demo Link */}
                    {project.demoUrl && (
                      <div className="mt-4 pt-4" style={{ borderTop: '1px solid #374151' }}>
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button
                            variant="outline"
                            size="md"
                            leftIcon={<ExternalLink className="h-4 w-4" />}
                            className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                          >
                            View Live Demo
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Seller Info */}
                  <div
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor: '#111827',
                      border: '1px solid #374151'
                    }}
                  >
                    <h3
                      className="font-semibold mb-3"
                      style={{ color: '#ffffff' }}
                    >
                      Seller
                    </h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div
                        className="font-medium"
                        style={{ color: '#ffffff' }}
                      >
                        {project.seller?.displayName || 'Unknown Seller'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full-width Description Section */}
            <div className="col-span-full mt-8 pt-8" style={{ borderTop: '1px solid #374151' }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Description */}
                <div className="lg:col-span-2">
                  <h3 className="text-2xl font-bold mb-6" style={{ color: '#ffffff' }}>
                    Product Description
                  </h3>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="leading-relaxed whitespace-pre-wrap text-lg" style={{ color: '#d1d5db' }}>
                      {project.description}
                    </p>
                  </div>

                  {/* Enhanced Project Information */}
                  <div className="mt-8 space-y-6">
                    {/* Tech Stack */}
                    {project.projectDetails?.techStack && (
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: 'rgba(29, 78, 216, 0.3)',
                          border: '1px solid #1d4ed8'
                        }}
                      >
                        <h4 className="text-lg font-semibold mb-2" style={{ color: '#bfdbfe' }}>Technologies Used</h4>
                        <p className="text-sm" style={{ color: '#dbeafe' }}>{project.projectDetails.techStack}</p>
                      </div>
                    )}

                    {/* Timeline and Prerequisites */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.projectDetails?.timeline && (
                        <div
                          className="p-4 rounded-lg"
                          style={{
                            backgroundColor: 'rgba(21, 128, 61, 0.3)',
                            border: '1px solid #15803d'
                          }}
                        >
                          <h4 className="text-lg font-semibold mb-2" style={{ color: '#bbf7d0' }}>Development Timeline</h4>
                          <p className="text-sm" style={{ color: '#dcfce7' }}>{project.projectDetails.timeline}</p>
                        </div>
                      )}

                      {project.projectDetails?.prerequisites && (
                        <div
                          className="p-4 rounded-lg"
                          style={{
                            backgroundColor: 'rgba(161, 98, 7, 0.3)',
                            border: '1px solid #a16207'
                          }}
                        >
                          <h4 className="text-lg font-semibold mb-2" style={{ color: '#fef3c7' }}>Prerequisites</h4>
                          <p className="text-sm" style={{ color: '#fefce8' }}>{project.projectDetails.prerequisites}</p>
                        </div>
                      )}
                    </div>

                    {/* Installation Instructions */}
                    {project.projectDetails?.installationInstructions && (
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: '#111827',
                          border: '1px solid #374151'
                        }}
                      >
                        <h4 className="text-lg font-semibold mb-2" style={{ color: '#ffffff', textShadow: 'none' }}>Installation Instructions</h4>
                        <div
                          className="text-sm whitespace-pre-wrap"
                          style={{
                            color: '#e5e7eb',
                            backgroundColor: 'transparent',
                            textShadow: 'none',
                            opacity: 1,
                            visibility: 'visible'
                          }}
                        >
                          {project.projectDetails.installationInstructions}
                        </div>
                      </div>
                    )}

                    {/* Usage Instructions */}
                    {project.projectDetails?.usageInstructions && (
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: 'rgba(126, 34, 206, 0.3)',
                          border: '1px solid #7e22ce'
                        }}
                      >
                        <h4 className="text-lg font-semibold mb-2" style={{ color: '#e9d5ff', textShadow: 'none' }}>Usage Instructions</h4>
                        <div
                          className="text-sm whitespace-pre-wrap"
                          style={{
                            color: '#f3e8ff',
                            backgroundColor: 'transparent',
                            textShadow: 'none',
                            opacity: 1,
                            visibility: 'visible'
                          }}
                        >
                          {project.projectDetails.usageInstructions}
                        </div>
                      </div>
                    )}

                    {/* Project Source Code */}
                    {project.projectZipFile && (
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: 'rgba(21, 128, 61, 0.3)',
                          border: '1px solid #15803d'
                        }}
                      >
                        <h4 className="text-lg font-semibold mb-3 flex items-center" style={{ color: '#bbf7d0' }}>
                          <Download className="h-5 w-5 mr-2" style={{ color: '#bbf7d0' }} />
                          Project Source Code
                        </h4>
                        <div
                          className="p-3 rounded"
                          style={{
                            backgroundColor: '#111827',
                            border: '1px solid #374151'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className="p-2 rounded-lg"
                                style={{
                                  backgroundColor: 'rgba(21, 128, 61, 0.5)',
                                  color: '#22c55e'
                                }}
                              >
                                <Download className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium" style={{ color: '#ffffff' }}>
                                  {project.projectZipFile.originalName}
                                </p>
                                <p className="text-xs" style={{ color: '#9ca3af' }}>
                                  ZIP File • {(project.projectZipFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#22c55e' }}>
                                  {project.projectZipFile.description || 'Complete project source code and assets'}
                                </p>
                              </div>
                            </div>
                            {isPurchased ? (
                              <button
                                onClick={async () => {
                                  try {
                                    await projectService.downloadProjectZip(project._id);
                                  } catch (error) {
                                    console.error('Download failed:', error);
                                    alert('Download failed. Please try again.');
                                  }
                                }}
                                className="px-3 py-1 text-sm rounded transition-colors"
                                style={{
                                  backgroundColor: '#16a34a',
                                  color: '#ffffff'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                              >
                                Download
                              </button>
                            ) : (
                              <span
                                className="px-3 py-1 text-sm rounded"
                                style={{
                                  backgroundColor: '#374151',
                                  color: '#d1d5db'
                                }}
                              >
                                Purchase Required
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Documentation Files */}
                    {project.documentationFiles && project.documentationFiles.length > 0 && (
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: 'rgba(67, 56, 202, 0.3)',
                          border: '1px solid #4338ca'
                        }}
                      >
                        <h4 className="text-lg font-semibold mb-3" style={{ color: '#c7d2fe' }}>Documentation Files</h4>
                        <div className="space-y-2">
                          {project.documentationFiles.map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 rounded"
                              style={{
                                backgroundColor: '#111827',
                                border: '1px solid #374151'
                              }}
                            >
                              <div className="flex items-center">
                                <span className="text-2xl mr-2">
                                  {doc.fileType === 'readme' ? '📖' : doc.fileType === 'technical' ? '🔧' : '📋'}
                                </span>
                                <div>
                                  <p className="font-medium" style={{ color: '#ffffff' }}>{doc.originalName}</p>
                                  <p className="text-xs capitalize" style={{ color: '#9ca3af' }}>{doc.fileType} documentation</p>
                                </div>
                              </div>
                              <span
                                className="px-3 py-1 text-sm rounded"
                                style={{
                                  backgroundColor: '#374151',
                                  color: '#d1d5db'
                                }}
                              >
                                Available after purchase
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Additional Info */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Project Stats - Hidden for buyers */}
                  {!isPurchased && (
                    <div
                      className="rounded-lg p-4"
                      style={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151'
                      }}
                    >
                      <h4 className="text-lg font-semibold mb-3" style={{ color: '#ffffff' }}>Project Stats</h4>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold" style={{ color: '#60a5fa' }}>{project.stats.views}</div>
                          <div className="text-sm" style={{ color: '#9ca3af' }}>Views</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>{project.stats.sales}</div>
                          <div className="text-sm" style={{ color: '#9ca3af' }}>Sales</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completion Status */}
                  {project.completionStatus !== undefined && (
                    <div
                      className="rounded-lg p-4"
                      style={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151'
                      }}
                    >
                      <h4 className="text-lg font-semibold mb-3" style={{ color: '#ffffff' }}>Completion Status</h4>
                      <div
                        className="w-full rounded-full h-4"
                        style={{
                          backgroundColor: '#374151',
                          border: '1px solid #4b5563',
                          padding: '1px'
                        }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${project.completionStatus}%`,
                            backgroundColor: '#3b82f6',
                            boxShadow: '0 0 8px rgba(59, 130, 246, 0.3)',
                            minWidth: project.completionStatus > 0 ? '8px' : '0'
                          }}
                        ></div>
                      </div>
                      <div className="text-center mt-3 text-sm font-medium" style={{ color: '#d1d5db' }}>
                        {project.completionStatus}% Complete
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
