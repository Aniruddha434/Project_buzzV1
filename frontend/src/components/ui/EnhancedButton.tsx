import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gradient' | 'enhanced' | 'enhanced-outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  glow?: boolean;
  fullWidth?: boolean;
}

const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  className,
  variant = 'enhanced',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  glow = false,
  fullWidth = false,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden";

  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg focus:ring-2 focus:ring-blue-500",
    secondary: "bg-gray-100 text-gray-900 focus:ring-2 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-100",
    outline: "border-2 border-gray-300 bg-transparent text-gray-700 focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300",
    ghost: "text-gray-700 focus:ring-2 focus:ring-gray-500 dark:text-gray-300",
    destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg focus:ring-2 focus:ring-red-500",
    gradient: "bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white shadow-lg focus:ring-2 focus:ring-purple-500",
    enhanced: "bg-white text-black border-transparent hover:bg-white/90 focus:ring-2 focus:ring-white/50",
    'enhanced-outline': "bg-[#111] text-white/50 border border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20 focus:ring-2 focus:ring-white/20"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-lg",
    xl: "px-8 py-4 text-lg rounded-xl"
  };

  const enhancedSizes = {
    sm: "px-3 py-1.5 text-sm rounded-full",
    md: "px-4 py-2 text-sm rounded-full",
    lg: "px-6 py-3 text-base rounded-full",
    xl: "px-8 py-4 text-lg rounded-full"
  };

  const sizeStyles = (variant === 'enhanced' || variant === 'enhanced-outline') ? enhancedSizes : sizes;
  const glowStyles = glow ? "shadow-2xl shadow-blue-500/25" : "";
  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <motion.button
      className={cn(
        baseStyles,
        variants[variant],
        sizeStyles[size],
        glowStyles,
        widthStyles,
        className
      )}
      disabled={disabled || isLoading}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {/* Background animation for enhanced variants */}
      {(variant === 'enhanced' || variant === 'enhanced-outline') && !disabled && !isLoading && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}

      <div className="relative z-10 flex items-center justify-center">
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
      </div>
    </motion.button>
  );
};

export default EnhancedButton;
