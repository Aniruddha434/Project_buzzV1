import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import discountService from '../services/discountService';

interface DiscountEligibility {
  isEligibleForWelcome: boolean;
  hasUsedWelcome: boolean;
  welcomeCodeStatus: any;
  loading: boolean;
  error: string | null;
}

export const useDiscountEligibility = () => {
  const { user } = useAuth();
  const [eligibility, setEligibility] = useState<DiscountEligibility>({
    isEligibleForWelcome: false,
    hasUsedWelcome: false,
    welcomeCodeStatus: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const checkEligibility = async () => {
      if (!user || user.role !== 'buyer') {
        setEligibility({
          isEligibleForWelcome: false,
          hasUsedWelcome: false,
          welcomeCodeStatus: null,
          loading: false,
          error: null
        });
        return;
      }

      try {
        setEligibility(prev => ({ ...prev, loading: true, error: null }));

        // Check welcome code status
        const welcomeStatus = await discountService.getWelcomeStatus();
        
        let isEligibleForWelcome = false;
        let hasUsedWelcome = false;

        if (welcomeStatus.hasWelcomeCode && welcomeStatus.welcomeCode) {
          const code = welcomeStatus.welcomeCode;
          
          // Check if code is still valid and not used
          isEligibleForWelcome = code.isValid && !code.isUsed;
          hasUsedWelcome = code.isUsed;
        } else {
          // If no welcome code exists, check if user is eligible to get one
          try {
            const eligibilityCheck = await discountService.checkWelcomeEligibility();
            isEligibleForWelcome = eligibilityCheck.eligible;
          } catch (error) {
            // If eligibility check fails, assume not eligible
            isEligibleForWelcome = false;
          }
        }

        setEligibility({
          isEligibleForWelcome,
          hasUsedWelcome,
          welcomeCodeStatus: welcomeStatus,
          loading: false,
          error: null
        });

      } catch (error: any) {
        console.error('Error checking discount eligibility:', error);
        setEligibility({
          isEligibleForWelcome: false,
          hasUsedWelcome: false,
          welcomeCodeStatus: null,
          loading: false,
          error: error.message || 'Failed to check discount eligibility'
        });
      }
    };

    checkEligibility();
  }, [user]);

  return eligibility;
};

export default useDiscountEligibility;
