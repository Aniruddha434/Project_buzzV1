import React from 'react';
import { cn } from '../../utils/cn';
import { SimpleCubeLogo } from './simple-cube-logo';

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

  // Professional Corporate ProjectBuzz Icon with Simple Cube
  const ProjectBuzzIcon = () => (
    <div className={cn(
      currentSize.icon,
      "relative bg-black rounded-sm flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300"
    )}>
      {/* Simple Cube Icon */}
      <SimpleCubeLogo
        size={size === 'sm' ? 24 : size === 'md' ? 28 : size === 'lg' ? 36 : 44}
        className="flex items-center justify-center"
      />
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
            "font-semibold text-slate-900 dark:text-white tracking-tight"
          )}>
            ProjectBuzz
          </span>
          {showTagline && (
            <span className={cn(
              currentSize.tagline,
              "text-slate-600 dark:text-slate-400 -mt-1 font-medium tracking-wide"
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
