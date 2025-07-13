import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface InlineErrorProps {
  message?: string | null;
  className?: string;
  variant?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: boolean;
}

const InlineError: React.FC<InlineErrorProps> = ({
  message,
  className,
  variant = 'error',
  dismissible = false,
  onDismiss,
  icon = true
}) => {
  if (!message) return null;

  const variants = {
    error: {
      container: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
      icon: 'text-red-500 dark:text-red-400',
      button: 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
      icon: 'text-yellow-500 dark:text-yellow-400',
      button: 'text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
      icon: 'text-blue-500 dark:text-blue-400',
      button: 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
    }
  };

  const variantStyles = variants[variant];

  return (
    <div className={cn(
      'flex items-start space-x-2 p-3 rounded-lg border text-sm font-medium',
      variantStyles.container,
      className
    )}>
      {icon && (
        <AlertCircle className={cn('h-4 w-4 mt-0.5 flex-shrink-0', variantStyles.icon)} />
      )}
      <div className="flex-1 min-w-0">
        <p className="break-words">{message}</p>
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 p-0.5 rounded-md transition-colors',
            variantStyles.button
          )}
          aria-label="Dismiss error"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default InlineError;
