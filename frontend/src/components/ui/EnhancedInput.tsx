import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'glass' | 'neon' | 'enhanced';
  helperText?: string;
  showFocusEffect?: boolean;
}

const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(({
  className,
  type = 'text',
  label,
  error,
  leftIcon,
  rightIcon,
  variant = 'enhanced',
  helperText,
  showFocusEffect = true,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const baseStyles = "w-full px-4 py-3 text-sm transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm";
  
  const variants = {
    default: "bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400",
    glass: "bg-gray-900/10 backdrop-blur-lg border border-gray-700/20 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-400",
    neon: "bg-gray-900 border-2 border-cyan-500/50 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-cyan-100 placeholder-cyan-300/50 shadow-lg shadow-cyan-500/10",
    enhanced: "bg-black/20 border border-white/10 rounded-full text-white placeholder-gray-400 focus:border-white/30 focus:bg-black/30"
  };

  const iconPadding = leftIcon ? "pl-12" : rightIcon ? "pr-12" : "";

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };

  return (
    <div className="space-y-2">
      {label && variant !== 'enhanced' && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {leftIcon}
          </div>
        )}
        
        <motion.div
          className="relative"
          animate={{
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <input
            type={type}
            className={cn(
              baseStyles,
              variants[variant],
              iconPadding,
              error && "border-red-500 focus:ring-red-500 focus:border-red-500",
              variant === 'enhanced' && "text-center",
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          
          {/* Enhanced variant floating label */}
          {label && variant === 'enhanced' && (
            <motion.label
              className={cn(
                "absolute left-4 transition-all duration-300 pointer-events-none",
                isFocused || hasValue || props.value
                  ? "top-1 text-xs text-gray-400"
                  : "top-1/2 -translate-y-1/2 text-sm text-gray-500"
              )}
              animate={{
                y: isFocused || hasValue || props.value ? -8 : 0,
                scale: isFocused || hasValue || props.value ? 0.85 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.label>
          )}
          
          {/* Focus ring effect for enhanced variant */}
          {showFocusEffect && variant === 'enhanced' && isFocused && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/20 pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.div>
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <motion.p
          className="text-sm text-red-400 flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

EnhancedInput.displayName = 'EnhancedInput';

export default EnhancedInput;
