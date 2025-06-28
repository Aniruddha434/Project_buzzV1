import React from 'react';
import { cn } from '../../utils/cn';

interface ProjectBuzzLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'minimal' | 'icon-only';
  className?: string;
  showTagline?: boolean;
}

const ProjectBuzzLogo: React.FC<ProjectBuzzLogoProps> = ({
  size = 'md',
  variant = 'default',
  className,
  showTagline = true
}) => {
  const sizes = {
    sm: {
      container: 'h-8',
      icon: 'w-8 h-8',
      text: 'text-lg',
      tagline: 'text-xs'
    },
    md: {
      container: 'h-10',
      icon: 'w-10 h-10',
      text: 'text-xl',
      tagline: 'text-xs'
    },
    lg: {
      container: 'h-12',
      icon: 'w-12 h-12',
      text: 'text-2xl',
      tagline: 'text-sm'
    },
    xl: {
      container: 'h-16',
      icon: 'w-16 h-16',
      text: 'text-3xl',
      tagline: 'text-base'
    }
  };

  const currentSize = sizes[size];

  // Custom ProjectBuzz Icon - represents digital marketplace with code/project elements
  const ProjectBuzzIcon = () => (
    <div className={cn(
      currentSize.icon,
      "relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
    )}>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />

      {/* Main icon - combination of code brackets and marketplace elements */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        width="24"
        height="24"
        className="w-1/2 h-1/2 text-white relative z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Code brackets */}
        <path
          d="M8 6L4 12L8 18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 6L20 12L16 18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Central element - representing projects/marketplace */}
        <circle
          cx="12"
          cy="12"
          r="2"
          fill="currentColor"
        />
        {/* Connection lines - representing network/marketplace */}
        <path
          d="M12 8V10M12 14V16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );

  if (variant === 'icon-only') {
    return (
      <div className={cn("group cursor-pointer", className)}>
        <ProjectBuzzIcon />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-3 group cursor-pointer", className)}>
      <ProjectBuzzIcon />

      {variant !== 'minimal' && (
        <div className="flex flex-col">
          <span className={cn(
            currentSize.text,
            "font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight tracking-tight"
          )}>
            ProjectBuzz
          </span>
          {showTagline && (
            <span className={cn(
              currentSize.tagline,
              "text-gray-500 dark:text-gray-400 -mt-1 font-medium tracking-wide"
            )}>
              Digital Marketplace
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectBuzzLogo;
