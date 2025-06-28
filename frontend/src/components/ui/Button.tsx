import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gradient' | 'static-primary' | 'static-outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  glow?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  glow = false,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg focus:ring-blue-500",
    secondary: "bg-gray-100 text-gray-900 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-100",
    outline: "border-2 border-gray-300 bg-transparent text-gray-700 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300",
    ghost: "text-gray-700 focus:ring-gray-500 dark:text-gray-300",
    destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg focus:ring-red-500",
    gradient: "bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white shadow-lg focus:ring-purple-500",
    'static-primary': "bg-blue-600 text-white focus:ring-blue-500",
    'static-outline': "border-2 border-gray-300 bg-transparent text-gray-700 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-lg",
    xl: "px-8 py-4 text-lg rounded-xl"
  };

  const glowStyles = glow ? "shadow-2xl shadow-blue-500/25" : "";

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        glowStyles,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >

      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
