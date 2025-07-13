import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onResend?: () => void;
  isLoading?: boolean;
  error?: string;
  resendCooldown?: number;
  className?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  onResend,
  isLoading = false,
  error,
  resendCooldown = 0,
  className
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (otp.every(digit => digit !== '')) {
      onComplete(otp.join(''));
    }
  }, [otp, onComplete]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input if current field is filled
    if (value && index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const pastedDigits = pastedData.replace(/\D/g, '').split('').slice(0, length);
    
    if (pastedDigits.length > 0) {
      const newOtp = [...otp];
      pastedDigits.forEach((digit, index) => {
        if (index < length) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);
      
      const nextIndex = Math.min(pastedDigits.length, length - 1);
      setActiveIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const clearOtp = () => {
    setOtp(new Array(length).fill(''));
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-center space-x-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setActiveIndex(index)}
            disabled={isLoading}
            className={cn(
              "w-12 h-12 text-center text-lg font-semibold rounded-lg border-2 transition-all duration-200",
              "bg-gray-800 text-white placeholder-gray-400",
              "border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              digit && "border-blue-500",
              activeIndex === index && "ring-2 ring-blue-500/20"
            )}
          />
        ))}
      </div>

      {error && (
        <div className="text-center">
          <p className="text-sm text-red-400">{error}</p>
          <button
            type="button"
            onClick={clearOtp}
            className="text-xs text-blue-400 hover:text-blue-300 mt-1"
          >
            Clear and try again
          </button>
        </div>
      )}

      {onResend && (
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={onResend}
            disabled={resendCooldown > 0 || isLoading}
            className={cn(
              "text-sm font-medium transition-colors",
              resendCooldown > 0 || isLoading
                ? "text-gray-500 cursor-not-allowed"
                : "text-blue-400 hover:text-blue-300"
            )}
          >
            {resendCooldown > 0 
              ? `Resend in ${resendCooldown}s` 
              : isLoading 
                ? 'Sending...' 
                : 'Resend Code'
            }
          </button>
        </div>
      )}
    </div>
  );
};

export default OTPInput;
