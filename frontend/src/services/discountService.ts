import api from '../api.js';

export interface WelcomeCode {
  code: string;
  discountPercentage: number;
  maxDiscountAmount: number;
  minPurchaseAmount: number;
  expiresAt: string;
  isActive: boolean;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'negotiation' | 'welcome';
  discountPercentage: number;
  discountAmount?: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  isValid: boolean;
  isUsed: boolean;
  expiresAt: string;
  usedAt?: string;
  project?: {
    id: string;
    title: string;
    price: number;
  };
  createdAt: string;
}

export interface WelcomeEligibility {
  eligible: boolean;
  reason?: string;
  message?: string;
  welcomeCode?: WelcomeCode;
}

export interface WelcomeStatus {
  hasWelcomeCode: boolean;
  welcomeCode?: WelcomeCode & {
    isValid: boolean;
    isUsed: boolean;
    daysUntilExpiry: number;
    usedAt?: string;
  };
  message?: string;
}

export interface DiscountValidation {
  valid: boolean;
  discountCode?: {
    code: string;
    type: string;
    discountAmount: number;
    finalPrice: number;
    originalPrice: number;
    discountPercentage: number;
    expiresAt: string;
  };
  message?: string;
}

export interface UserDiscountCodes {
  discountCodes: DiscountCode[];
  total: number;
  active: number;
  used: number;
  expired: number;
}

class DiscountService {
  /**
   * Check if user is eligible for welcome discount code
   */
  async checkWelcomeEligibility(): Promise<WelcomeEligibility> {
    try {
      const response = await api.get('/discounts/welcome/eligibility');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error checking welcome eligibility:', error);
      throw new Error(error.response?.data?.message || 'Failed to check welcome eligibility');
    }
  }

  /**
   * Get current welcome code status
   */
  async getWelcomeStatus(): Promise<WelcomeStatus> {
    try {
      const response = await api.get('/discounts/welcome/status');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting welcome status:', error);
      throw new Error(error.response?.data?.message || 'Failed to get welcome status');
    }
  }

  /**
   * Validate a discount code for a specific project
   */
  async validateDiscountCode(code: string, projectId: string): Promise<DiscountValidation> {
    try {
      const response = await api.post('/discounts/validate', {
        code: code.trim().toUpperCase(),
        projectId
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ Error validating discount code:', error);
      return {
        valid: false,
        message: error.response?.data?.message || 'Invalid discount code'
      };
    }
  }

  /**
   * Get all user's discount codes
   */
  async getUserDiscountCodes(): Promise<UserDiscountCodes> {
    try {
      const response = await api.get('/discounts/user/codes');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting user discount codes:', error);
      throw new Error(error.response?.data?.message || 'Failed to get discount codes');
    }
  }

  /**
   * Calculate discount amount for a given price and percentage
   */
  calculateDiscount(
    originalPrice: number, 
    discountPercentage: number, 
    maxDiscount?: number
  ): { discountAmount: number; finalPrice: number } {
    const discountAmount = Math.min(
      Math.round(originalPrice * (discountPercentage / 100)),
      maxDiscount || Infinity
    );
    const finalPrice = originalPrice - discountAmount;
    
    return { discountAmount, finalPrice };
  }

  /**
   * Format discount code for display
   */
  formatDiscountCode(code: DiscountCode): string {
    if (code.type === 'welcome') {
      return `${code.code} - ${code.discountPercentage}% off (Welcome Offer)`;
    } else if (code.type === 'negotiation' && code.project) {
      return `${code.code} - ${code.project.title} (Negotiated Price)`;
    }
    return code.code;
  }

  /**
   * Check if discount code is about to expire (within 3 days)
   */
  isExpiringSoon(expiresAt: string): boolean {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    return expiryDate <= threeDaysFromNow && expiryDate > now;
  }

  /**
   * Get days until expiry
   */
  getDaysUntilExpiry(expiresAt: string): number {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Get welcome code suggestion for new users
   */
  getWelcomeCodeSuggestion(): {
    code: string;
    title: string;
    description: string;
    discountPercentage: number;
    maxDiscount: number;
    minPurchase: number;
  } {
    return {
      code: 'WELCOME20',
      title: 'First-time buyer discount',
      description: 'Get 20% off your first purchase',
      discountPercentage: 20,
      maxDiscount: 500,
      minPurchase: 100
    };
  }

  /**
   * Check if user should see welcome banner
   */
  shouldShowWelcomeBanner(user: any): boolean {
    // Show to non-authenticated users
    if (!user) return true;
    
    // Show to buyers who might not have used their welcome code
    if (user.role === 'buyer') {
      // This could be enhanced with API call to check actual usage
      return true;
    }
    
    return false;
  }
}

export default new DiscountService();
