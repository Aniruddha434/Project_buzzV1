import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, LogIn, CheckCircle, AlertCircle } from 'lucide-react';
import { getBuyAction } from '../utils/buyFlowUtils';

// Define types locally to avoid import issues
interface User {
  _id: string;
  email: string;
  displayName: string;
  role: 'buyer' | 'seller' | 'admin';
  emailVerified: boolean;
  createdAt: string;
  stats: {
    projectsPurchased: number;
    projectsSold: number;
    totalSpent: number;
    totalEarned: number;
  };
}

interface Project {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags?: string[];
  seller: {
    _id: string;
    displayName: string;
  };
  status: string;
  createdAt: string;
}

interface UniversalBuyButtonProps {
  project: Project;
  user: User | null;
  isPurchased?: boolean;
  preferModal?: boolean;
  onModalOpen?: (projectId: string) => void;
  onRedirect?: (url: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const UniversalBuyButton: React.FC<UniversalBuyButtonProps> = ({
  project,
  user,
  isPurchased = false,
  preferModal = false,
  onModalOpen,
  onRedirect,
  className = '',
  size = 'md',
  fullWidth = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const action = getBuyAction(project, user, isPurchased);

  const handleClick = () => {
    if (action.disabled) {
      return;
    }

    switch (action.type) {
      case 'login':
        const currentPath = location.pathname;
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
        break;

      case 'buy':
        // Navigate to dedicated payment page
        const returnUrl = encodeURIComponent(location.pathname + location.search);
        const source = getSourceFromPath(location.pathname);
        navigate(`/payment/${project._id}?returnUrl=${returnUrl}&source=${source}`);
        break;

      default:
        console.warn('Buy action not available for current state');
    }
  };

  // Helper function to determine source
  const getSourceFromPath = (pathname: string): string => {
    if (pathname.includes('/market')) return 'market';
    if (pathname.includes('/dashboard')) return 'dashboard';
    if (pathname.includes('/project/')) return 'project-detail';
    if (pathname === '/') return 'home';
    return 'unknown';
  };

  const getIcon = () => {
    const iconClass = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5';
    const marginClass = size === 'sm' ? 'mr-1' : size === 'lg' ? 'mr-2' : 'mr-1.5';

    switch (action.icon) {
      case 'ShoppingCart':
        return <ShoppingCart className={`${iconClass} ${marginClass}`} />;
      case 'LogIn':
        return <LogIn className={`${iconClass} ${marginClass}`} />;
      case 'CheckCircle':
        return <CheckCircle className={`${iconClass} ${marginClass} text-green-400`} />;
      case 'AlertCircle':
        return <AlertCircle className={`${iconClass} ${marginClass}`} />;
      default:
        return null;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const getTextColor = () => {
    if (action.type === 'owned') {
      return 'text-green-400 font-medium';
    }
    return action.className.includes('text-white') ? 'text-white' : 
           action.className.includes('text-gray-400') ? 'text-gray-400' : 'text-white';
  };

  const buttonClasses = `
    ${action.className}
    ${getSizeClasses()}
    ${fullWidth ? 'w-full justify-center' : ''}
    ${className}
  `.trim();

  return (
    <button
      onClick={handleClick}
      disabled={action.disabled}
      className={buttonClasses}
      title={action.disabled ? 'Not available for purchase' : `${action.label} - ₹${project.price}`}
    >
      {getIcon()}
      <span className={getTextColor()}>{action.label}</span>
    </button>
  );
};

export default UniversalBuyButton;

// Export additional utility components for specific use cases

interface QuickBuyButtonProps {
  project: Project;
  user: User | null;
  isPurchased?: boolean;
  onModalOpen?: (projectId: string) => void;
}

export const QuickBuyButton: React.FC<QuickBuyButtonProps> = (props) => (
  <UniversalBuyButton
    {...props}
    preferModal={true}
    size="sm"
  />
);

interface DetailPageBuyButtonProps {
  project: Project;
  user: User | null;
  isPurchased?: boolean;
}

export const DetailPageBuyButton: React.FC<DetailPageBuyButtonProps> = (props) => (
  <UniversalBuyButton
    {...props}
    preferModal={false}
    size="md"
  />
);

interface ModalBuyButtonProps {
  project: Project;
  user: User | null;
  isPurchased?: boolean;
  onModalOpen?: (projectId: string) => void;
}

export const ModalBuyButton: React.FC<ModalBuyButtonProps> = (props) => (
  <UniversalBuyButton
    {...props}
    preferModal={true}
    size="md"
    fullWidth={true}
  />
);

interface SharePageBuyButtonProps {
  project: Project;
  user: User | null;
  isPurchased?: boolean;
}

export const SharePageBuyButton: React.FC<SharePageBuyButtonProps> = (props) => (
  <UniversalBuyButton
    {...props}
    preferModal={false}
    size="md"
    fullWidth={true}
  />
);

// Utility hook for buy button state
export const useBuyButtonState = (project: Project, user: User | null, isPurchased: boolean = false) => {
  const action = getBuyAction(project, user, isPurchased);
  
  return {
    canBuy: action.type === 'buy',
    needsLogin: action.type === 'login',
    isOwned: action.type === 'owned',
    isUnavailable: action.type === 'unavailable',
    buttonText: action.label,
    buttonIcon: action.icon,
    isDisabled: action.disabled
  };
};
