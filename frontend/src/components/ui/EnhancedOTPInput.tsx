import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface EnhancedOTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onResend?: () => void;
  isLoading?: boolean;
  error?: string;
  resendCooldown?: number;
  className?: string;
}

const EnhancedOTPInput: React.FC<EnhancedOTPInputProps> = ({
  length = 6,
  onComplete,
  onResend,
  isLoading = false,
  error,
  resendCooldown = 0,
  className
}) => {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    // Check if code is complete
    if (code.every(digit => digit !== '') && code.join('').length === length) {
      onComplete(code.join(''));
    }
  }, [code, length, onComplete]);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Move to next input if value is entered
      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newCode = Array(length).fill('');
    
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    
    setCode(newCode);
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newCode.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* OTP Input Grid */}
      <div className="flex justify-center space-x-3">
        {code.map((digit, index) => (
          <div key={index} className="relative">
            <motion.div
              className="relative"
              animate={{
                scale: focusedIndex === index ? 1.05 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={() => handleFocus(index)}
                onBlur={handleBlur}
                onPaste={handlePaste}
                className={cn(
                  "w-12 h-12 text-center text-xl bg-transparent text-white border-2 rounded-lg",
                  "focus:outline-none transition-all duration-300",
                  "backdrop-blur-sm",
                  digit 
                    ? "border-white/30 bg-white/5" 
                    : "border-white/10 bg-black/20",
                  focusedIndex === index && "border-white/50 bg-white/10",
                  error && "border-red-500/50",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                style={{ caretColor: 'transparent' }}
                disabled={isLoading}
              />
              
              {/* Placeholder digit */}
              {!digit && focusedIndex !== index && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-gray-500 text-xl">0</span>
                </div>
              )}
              
              {/* Focus ring */}
              {focusedIndex === index && (
                <motion.div
                  className="absolute inset-0 border-2 border-white/20 rounded-lg pointer-events-none"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.div>
            
            {/* Separator */}
            {index < length - 1 && index === Math.floor(length / 2) - 1 && (
              <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 text-white/30 text-xl">
                |
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Resend Button */}
      {onResend && (
        <div className="text-center">
          <motion.button
            type="button"
            onClick={onResend}
            disabled={resendCooldown > 0 || isLoading}
            className={cn(
              "text-sm transition-colors duration-200",
              resendCooldown > 0 || isLoading
                ? "text-gray-500 cursor-not-allowed"
                : "text-white/70 hover:text-white"
            )}
            whileHover={resendCooldown === 0 && !isLoading ? { scale: 1.05 } : {}}
            whileTap={resendCooldown === 0 && !isLoading ? { scale: 0.95 } : {}}
          >
            {resendCooldown > 0 
              ? `Resend code in ${resendCooldown}s` 
              : 'Resend code'
            }
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default EnhancedOTPInput;
