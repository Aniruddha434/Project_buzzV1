import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FieldErrorProps {
  message?: string | null;
  className?: string;
  icon?: boolean;
}

const FieldError: React.FC<FieldErrorProps> = ({
  message,
  className,
  icon = true
}) => {
  if (!message) return null;

  return (
    <div className={cn(
      'flex items-center space-x-1 mt-1 text-sm text-red-600 dark:text-red-400',
      className
    )}>
      {icon && (
        <AlertCircle className="h-3 w-3 flex-shrink-0" />
      )}
      <span className="break-words">{message}</span>
    </div>
  );
};

export default FieldError;
