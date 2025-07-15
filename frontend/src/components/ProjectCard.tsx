import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingCart, CheckCircle, Code, ExternalLink, Github, X, ChevronLeft, ChevronRight, Share2, User, Download, Star, Heart } from 'lucide-react';

import { NegotiationButton } from './NegotiationButton';
import ShareModal from './ShareModal';
import { getImageUrl } from '../utils/imageUtils.js';
import {
  formatProjectPrice,
  formatCompactPrice,
  formatSalesCount,
  formatViewCount,
  formatRating
} from '../utils/currency';

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
    displayName?: string;
    photoURL?: string;
  };
  stats?: {
    views: number;
    sales: number;
    downloads: number;
  };
  status: string;
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
}

interface ProjectCardProps {
  project: Project;
  onPurchase?: (project: Project) => void;
  isPurchased?: boolean;
  showBuyButton?: boolean;
  user?: any;
  className?: string;
  showShareIcon?: boolean;
  onClick?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onPurchase,
  isPurchased = false,
  showBuyButton = true,
  user,
  className = '',
  showShareIcon = true,
  onClick
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  // Using centralized getImageUrl from utils

  // Early return if project data is invalid
  if (!project || !project._id || !project.title) {
    console.warn('ProjectCard: Invalid project data received', project);
    return (
      <div className={`h-full border border-gray-800 bg-gray-900 flex flex-col rounded-lg ${className}`}>
        <div className="p-4 flex items-center justify-center h-48">
          <div className="text-center text-gray-500">
            <Code className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Invalid project data</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle ESC key for modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showImageModal) {
        setShowImageModal(false);
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showImageModal]);

  // Handle image modal click
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalImageIndex(currentImageIndex);
    setShowImageModal(true);
  };

  // Handle card click (for project details)
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on buttons, links, or interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="button"]') ||
      target.closest('.negotiation-button') ||
      target.closest('.payment-modal') ||
      target.closest('.payment-dialog')
    ) {
      return;
    }

    onClick?.(project);
  };



  // Get all project images
  const getProjectImages = () => {
    const images = [];

    // Add images from images array
    if (project.images && project.images.length > 0) {
      images.push(...project.images);
    }

    // Add main image if it exists and isn't already in images array
    if (project.image?.url && !images.some(img => img.url === project.image?.url)) {
      images.push(project.image);
    }

    return images;
  };

  const images = getProjectImages();
  const currentImage = images[currentImageIndex];



  // Auto cycle images on hover
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let startDelay: NodeJS.Timeout;

    if (isHovered && images.length > 1) {
      // Add a small delay before starting the cycling to prevent immediate cycling
      startDelay = setTimeout(() => {
        interval = setInterval(() => {
          setCurrentImageIndex((prev) => {
            const nextIndex = (prev + 1) % images.length;
            return nextIndex;
          });
        }, 1200); // Change image every 1.2 seconds
      }, 300); // Wait 300ms before starting to cycle

    } else if (!isHovered) {
      // Reset to first image when not hovered
      setCurrentImageIndex(0);
    }

    return () => {
      if (startDelay) clearTimeout(startDelay);
      if (interval) clearInterval(interval);
    };
  }, [isHovered, images.length, project.title]);

  // Truncate description to consistent length
  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <>
      <div
        className={`project-card-unified group ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >

        {/* Dominant Project Image - 80% of card */}
        <div className="project-card-image" onClick={handleImageClick}>
          {/* Price overlay on image */}
          <div className="project-card-price">
            {formatProjectPrice(project.price)}
          </div>
          {currentImage?.url ? (
            <div className="relative w-full h-full group">
              <img
                key={`${project._id}-${currentImageIndex}`} // Unique key for smooth transitions
                src={getImageUrl(currentImage.url)}
                alt={`${project.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        ) : null}

          {/* Fallback icon */}
          <div className={`${currentImage?.url ? 'hidden' : ''} h-full flex items-center justify-center bg-muted`}>
            <Code className="h-12 w-12 text-muted-foreground" />
          </div>

        {/* Image indicators */}
        {images.length > 1 && (
          <div className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5 backdrop-blur-sm rounded-full px-2 py-1 transition-all duration-300 ${
            isHovered ? 'bg-blue-600/40' : 'bg-black/30'
          }`}>
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentImageIndex
                    ? isHovered
                      ? 'bg-blue-300 shadow-lg scale-125 animate-pulse'
                      : 'bg-white shadow-lg scale-125'
                    : 'bg-white/60 hover:bg-white/80'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
              />
            ))}
          </div>
        )}

        {/* Image count badge - Smaller */}
        {images.length > 1 && (
          <div className={`absolute top-1.5 right-1.5 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-full transition-all duration-300 ${
            isHovered ? 'bg-blue-600/80 scale-105' : 'bg-black/50'
          }`}>
            {currentImageIndex + 1}/{images.length}
            {isHovered && <span className="ml-0.5 animate-pulse">●</span>}
          </div>
        )}

          {/* Category badge - Smaller */}
          <div className="absolute top-1.5 left-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground backdrop-blur-sm capitalize">
              {project.category}
            </span>
          </div>

        {/* Completion Status Badge - Smaller */}
        {project.completionStatus !== undefined && project.completionStatus < 100 && (
          <div className="absolute bottom-1.5 left-1.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100/90 text-yellow-800 backdrop-blur-sm">
              {project.completionStatus}%
            </span>
          </div>
        )}

        {/* Documentation Available Badge - Smaller */}
        {project.documentationFiles && project.documentationFiles.length > 0 && (
          <div className="absolute bottom-1.5 right-1.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100/90 text-blue-800 backdrop-blur-sm">
              📚
            </span>
          </div>
        )}

        {/* Quick action buttons - Share, Demo, GitHub - Smaller */}
        <div className={`absolute ${images.length > 1 ? 'top-7 right-1.5' : 'top-1.5 right-1.5'} flex space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
          {/* Share Button - Always visible */}
          {showShareIcon && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Share button clicked for project:', project._id);
                setShowShareModal(true);
              }}
              className="p-1 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors"
              title="Share this project"
            >
              <Share2 className="h-2.5 w-2.5" />
            </button>
          )}
          {isPurchased && project.githubRepo && (
            <a
              href={project.githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="View Source Code (Purchased)"
            >
              <Github className="h-2.5 w-2.5" />
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="View Live Demo"
            >
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      </div>

        {/* Content Section - 20% with action buttons */}
        <div className="project-card-content">
          {/* Project Info Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="project-card-title">
                {project.title}
              </h3>
              <p className="project-card-description">
                {project.category || 'Development'}
              </p>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Eye className="h-3 w-3" />
              <span>{project.stats?.sales || 0}</span>
            </div>
          </div>

          {/* Action Buttons Row */}
          {showBuyButton && (
            <div className="project-card-actions">
              {user && user.role === 'buyer' ? (
                isPurchased ? (
                  <div className="flex items-center justify-center p-2 bg-gray-900 border border-gray-700 rounded-lg">
                    <CheckCircle className="h-3 w-3 text-white mr-1.5" />
                    <span className="text-xs font-medium text-white">
                      Owned
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      className="project-card-button flex-1 bg-black hover:bg-gray-800 text-white border border-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClick?.(project);
                      }}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1.5" />
                      <span className="text-xs">Buy {formatProjectPrice(project.price)}</span>
                    </button>

                    {/* Negotiation Button */}
                    <div className="flex-1">
                      <NegotiationButton
                        projectId={project._id}
                        projectTitle={project.title}
                        originalPrice={project.price}
                        onNegotiationStart={() => {
                          console.log('Negotiation started for project:', project.title);
                        }}
                        className="w-full project-card-button bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600"
                        size="sm"
                      />
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link to={user ? `/project/${project._id}` : '/login'} className="flex-1">
                    <button className="w-full project-card-button bg-black hover:bg-gray-800 text-white border border-gray-700">
                      <ShoppingCart className="h-3 w-3 mr-1.5" />
                      <span className="text-xs">{user ? 'View Details' : 'Sign in to Buy'}</span>
                    </button>
                  </Link>
                  <button
                    className="project-card-button bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowShareModal(true);
                    }}
                  >
                    <Heart className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="modal-image-backdrop bg-black/80 backdrop-blur-sm"
          onClick={() => setShowImageModal(false)}
        >
          <div className="modal-image-content relative max-w-4xl max-h-[90vh] w-full">
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Modal Image */}
            <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl">
              <img
                src={getImageUrl(images[modalImageIndex]?.url)}
                alt={`${project.title} - Image ${modalImageIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  {/* Previous Button */}
                  {modalImageIndex > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalImageIndex(modalImageIndex - 1);
                      }}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                  )}

                  {/* Next Button */}
                  {modalImageIndex < images.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalImageIndex(modalImageIndex + 1);
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {modalImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Project Info Overlay */}
            <div className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded-lg max-w-md">
              <h4 className="font-semibold text-lg mb-1">{project.title}</h4>
              <p className="text-sm text-gray-200">₹{project.price}</p>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          projectId={project._id}
          projectTitle={project.title}
        />
      )}
    </>
  );
};

export default ProjectCard;
