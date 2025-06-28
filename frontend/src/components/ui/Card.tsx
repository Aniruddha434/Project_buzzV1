import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'neon';
  hover?: boolean;
  glow?: boolean;
  animate?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hover = false,
  glow = false,
  animate = false,
  onMouseEnter,
  onMouseLeave,
  onClick
}) => {
  const baseStyles = "rounded-xl relative overflow-hidden";

  const variants = {
    default: "bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700",
    glass: "bg-white/10 dark:bg-gray-900/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 shadow-xl",
    gradient: "bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-black shadow-xl border border-gray-200/50 dark:border-gray-700/50",
    neon: "bg-gray-900 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/25"
  };

  const hoverStyles = "";
  const glowStyles = glow ? "shadow-2xl shadow-blue-500/20" : "";

  const cardContent = (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        hoverStyles,
        glowStyles,
        className
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Background gradient for neon variant */}
      {variant === 'neon' && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
      )}

      {/* Glass effect overlay */}
      {variant === 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      )}

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  return cardContent;
};

export default Card;
