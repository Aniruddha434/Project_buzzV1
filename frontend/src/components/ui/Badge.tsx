import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gradient' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  glow?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  glow = false,
  className
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full transition-all duration-200";
  
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    gradient: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg",
    neon: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-500/25"
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-1.5 text-sm",
    lg: "px-3 py-2 text-base"
  };

  const pulseStyles = pulse ? "animate-pulse" : "";
  const glowStyles = glow ? "shadow-lg shadow-current/25" : "";

  const badgeContent = (
    <span
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        pulseStyles,
        glowStyles,
        className
      )}
    >
      {children}
    </span>
  );

  if (pulse) {
    return (
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {badgeContent}
      </motion.div>
    );
  }

  return badgeContent;
};

export default Badge;
