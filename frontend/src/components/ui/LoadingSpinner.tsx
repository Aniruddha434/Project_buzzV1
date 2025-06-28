import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'neon' | 'dots' | 'pulse' | 'static';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
  text
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              'rounded-full bg-blue-500',
              size === 'sm' ? 'w-2 h-2' :
              size === 'md' ? 'w-3 h-3' :
              size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
            style={{
              width: 'auto',
              height: 'auto'
            }}
          />
        ))}
        {text && (
          <span className={cn('ml-3 text-gray-600 dark:text-gray-400', textSizes[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center space-y-3', className)}>
        <motion.div
          className={cn(
            'rounded-full bg-gradient-to-r from-blue-500 to-purple-500',
            sizes[size]
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity
          }}
          style={{
            width: 'auto',
            height: 'auto'
          }}
        />
        {text && (
          <span className={cn('text-gray-600 dark:text-gray-400', textSizes[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Static variant without animations
  if (variant === 'static') {
    return (
      <div className={cn('flex flex-col items-center space-y-3', className)}>
        <div
          className={cn(
            'rounded-full border-2 border-gray-300 border-t-blue-500',
            sizes[size]
          )}
        />
        {text && (
          <span className={cn('text-gray-600 dark:text-gray-400', textSizes[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  const spinnerVariants = {
    default: 'border-gray-200 border-t-blue-500',
    gradient: 'border-transparent border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-cyan-500',
    neon: 'border-gray-800 border-t-cyan-500 shadow-lg shadow-cyan-500/25'
  };

  return (
    <div className={cn('flex flex-col items-center space-y-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2',
          sizes[size],
          spinnerVariants[variant]
        )}
      />
      {text && (
        <span className={cn('text-gray-600 dark:text-gray-400', textSizes[size])}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
