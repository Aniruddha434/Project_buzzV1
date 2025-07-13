import crypto from 'crypto';
import emailService from './emailService.js';

class OTPService {
  constructor() {
    // In-memory storage for OTPs (in production, use Redis or database)
    this.otpStorage = new Map();
    this.maxAttempts = 3;
    this.otpExpiry = 10 * 60 * 1000; // 10 minutes
    this.resendCooldown = 60 * 1000; // 1 minute
  }

  /**
   * Generate a 6-digit OTP
   */
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Generate OTP key for storage
   */
  generateOTPKey(userId, type) {
    return `${userId}_${type}`;
  }

  /**
   * Send OTP for user registration
   */
  async sendRegistrationOTP(userId, email, displayName) {
    try {
      const otp = this.generateOTP();
      const key = this.generateOTPKey(userId, 'registration');
      
      // Store OTP with metadata
      this.otpStorage.set(key, {
        otp,
        email,
        displayName,
        attempts: 0,
        createdAt: Date.now(),
        expiresAt: Date.now() + this.otpExpiry,
        lastSentAt: Date.now()
      });

      // Send OTP via email
      const emailResult = await emailService.sendEmail({
        to: email,
        subject: 'ProjectBuzz - Email Verification Code',
        template: 'otp-verification',
        data: {
          userName: displayName || email.split('@')[0],
          otp,
          expiryMinutes: 10,
          appName: 'ProjectBuzz'
        }
      });

      console.log(`📧 OTP sent to ${email}: ${otp} (for development)`);
      
      return {
        success: true,
        message: 'OTP sent successfully',
        expiresAt: Date.now() + this.otpExpiry
      };

    } catch (error) {
      console.error('Error sending registration OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP'
      };
    }
  }

  /**
   * Send OTP for seller registration
   */
  async sendSellerRegistrationOTP(userId, email, displayName) {
    try {
      const otp = this.generateOTP();
      const key = this.generateOTPKey(userId, 'seller_registration');
      
      // Store OTP with metadata
      this.otpStorage.set(key, {
        otp,
        email,
        displayName,
        attempts: 0,
        createdAt: Date.now(),
        expiresAt: Date.now() + this.otpExpiry,
        lastSentAt: Date.now()
      });

      // Send OTP via email
      const emailResult = await emailService.sendEmail({
        to: email,
        subject: 'ProjectBuzz - Seller Account Verification',
        template: 'seller-otp-verification',
        data: {
          userName: displayName || email.split('@')[0],
          otp,
          expiryMinutes: 10,
          appName: 'ProjectBuzz'
        }
      });

      console.log(`📧 Seller OTP sent to ${email}: ${otp} (for development)`);
      
      return {
        success: true,
        message: 'OTP sent successfully',
        expiresAt: Date.now() + this.otpExpiry
      };

    } catch (error) {
      console.error('Error sending seller registration OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP'
      };
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(userId, otp, type) {
    try {
      const key = this.generateOTPKey(userId, type);
      const otpData = this.otpStorage.get(key);

      if (!otpData) {
        return {
          success: false,
          message: 'OTP not found or expired'
        };
      }

      // Check if OTP is expired
      if (Date.now() > otpData.expiresAt) {
        this.otpStorage.delete(key);
        return {
          success: false,
          message: 'OTP has expired'
        };
      }

      // Check attempts
      if (otpData.attempts >= this.maxAttempts) {
        this.otpStorage.delete(key);
        return {
          success: false,
          message: 'Maximum attempts exceeded'
        };
      }

      // Verify OTP
      if (otpData.otp !== otp) {
        otpData.attempts++;
        this.otpStorage.set(key, otpData);
        
        return {
          success: false,
          message: 'Invalid OTP',
          attemptsRemaining: this.maxAttempts - otpData.attempts
        };
      }

      // OTP is valid - remove from storage
      this.otpStorage.delete(key);
      
      return {
        success: true,
        message: 'OTP verified successfully'
      };

    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP'
      };
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(userId, type, email, displayName) {
    try {
      const key = this.generateOTPKey(userId, type);
      const otpData = this.otpStorage.get(key);

      // Check cooldown
      if (otpData && (Date.now() - otpData.lastSentAt) < this.resendCooldown) {
        const remainingTime = Math.ceil((this.resendCooldown - (Date.now() - otpData.lastSentAt)) / 1000);
        return {
          success: false,
          message: `Please wait ${remainingTime} seconds before requesting a new code`
        };
      }

      // Generate new OTP
      const otp = this.generateOTP();
      
      // Update or create OTP data
      this.otpStorage.set(key, {
        otp,
        email: email || otpData?.email,
        displayName: displayName || otpData?.displayName,
        attempts: 0,
        createdAt: Date.now(),
        expiresAt: Date.now() + this.otpExpiry,
        lastSentAt: Date.now()
      });

      // Send OTP based on type
      let emailResult;
      if (type === 'seller_registration') {
        emailResult = await this.sendSellerRegistrationOTP(userId, email || otpData?.email, displayName || otpData?.displayName);
      } else {
        emailResult = await this.sendRegistrationOTP(userId, email || otpData?.email, displayName || otpData?.displayName);
      }

      return emailResult;

    } catch (error) {
      console.error('Error resending OTP:', error);
      return {
        success: false,
        message: 'Failed to resend OTP'
      };
    }
  }

  /**
   * Clean up expired OTPs (should be called periodically)
   */
  cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [key, otpData] of this.otpStorage.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStorage.delete(key);
      }
    }
  }
}

// Create singleton instance
const otpService = new OTPService();

// Clean up expired OTPs every 5 minutes (with minimal logging)
setInterval(() => {
  const beforeCount = otpService.otpStorage.size;
  otpService.cleanupExpiredOTPs();
  const afterCount = otpService.otpStorage.size;

  // Only log if OTPs were actually cleaned up
  if (beforeCount > afterCount) {
    console.log(`🧹 Cleaned up ${beforeCount - afterCount} expired OTPs`);
  }
}, 5 * 60 * 1000);

export default otpService;
