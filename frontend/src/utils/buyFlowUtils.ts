import { User } from '../types/User';
import { Project } from '../types/Project';

/**
 * Universal Buy Flow Utilities
 * Provides consistent buying experience across all project detail views
 */

export interface BuyFlowOptions {
  project: Project;
  user: User | null;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
  redirectUrl?: string;
}

/**
 * Determines the appropriate buy action based on user state and project
 */
export const getBuyAction = (project: Project, user: User | null, isPurchased: boolean = false) => {
  // If user already owns the project
  if (isPurchased) {
    return {
      type: 'owned',
      label: 'Owned',
      icon: 'CheckCircle',
      disabled: true,
      className: 'inline-flex items-center px-3 py-1.5 bg-green-900/20 border border-green-700 rounded text-sm'
    };
  }

  // If user is not logged in
  if (!user) {
    return {
      type: 'login',
      label: 'Sign in to Buy',
      icon: 'LogIn',
      disabled: false,
      className: 'inline-flex items-center px-3 py-1.5 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded border border-gray-600 hover:border-gray-500 transition-colors',
      action: () => {
        const currentPath = window.location.pathname;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    };
  }

  // If user is logged in and project is approved
  if (user && project.status === 'approved') {
    return {
      type: 'buy',
      label: 'Buy Now',
      icon: 'ShoppingCart',
      disabled: false,
      className: 'inline-flex items-center px-3 py-1.5 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded border border-gray-600 hover:border-gray-500 transition-colors',
      action: (options?: { openModal?: boolean }) => {
        if (options?.openModal) {
          // Open purchase modal
          return { type: 'modal', projectId: project._id };
        } else {
          // Redirect to purchase page
          window.location.href = `/projects?projectId=${project._id}`;
        }
      }
    };
  }

  // If user is seller or project not approved
  return {
    type: 'unavailable',
    label: 'Not Available',
    icon: 'AlertCircle',
    disabled: true,
    className: 'inline-flex items-center px-3 py-1.5 bg-gray-700 text-gray-400 text-sm rounded border border-gray-600 cursor-not-allowed'
  };
};

/**
 * Handles buy button click with consistent behavior
 */
export const handleBuyClick = (
  project: Project, 
  user: User | null, 
  isPurchased: boolean = false,
  options: {
    preferModal?: boolean;
    onModalOpen?: (projectId: string) => void;
    onRedirect?: (url: string) => void;
  } = {}
) => {
  const action = getBuyAction(project, user, isPurchased);
  
  if (action.disabled) {
    return;
  }

  switch (action.type) {
    case 'login':
      if (action.action) {
        action.action();
      }
      break;
      
    case 'buy':
      if (action.action) {
        const result = action.action({ openModal: options.preferModal });
        
        if (result && result.type === 'modal') {
          options.onModalOpen?.(result.projectId);
        } else if (options.onRedirect) {
          options.onRedirect(`/projects?projectId=${project._id}`);
        }
      }
      break;
      
    default:
      console.warn('Buy action not available for current state');
  }
};

/**
 * Gets consistent buy button props for any component
 */
export const getBuyButtonProps = (
  project: Project,
  user: User | null,
  isPurchased: boolean = false
) => {
  const action = getBuyAction(project, user, isPurchased);

  return {
    className: action.className,
    disabled: action.disabled,
    label: action.label,
    icon: action.icon,
    onClick: () => handleBuyClick(project, user, isPurchased)
  };
};

/**
 * Formats price consistently across all components
 */
export const formatProjectPrice = (price: number): string => {
  return `₹${price.toFixed(2)}`;
};

/**
 * Gets project status badge props
 */
export const getProjectStatusBadge = (project: Project) => {
  switch (project.status) {
    case 'approved':
      return {
        label: 'Available',
        className: 'bg-green-100 text-green-800 text-xs px-2 py-1 rounded'
      };
    case 'pending':
      return {
        label: 'Pending Review',
        className: 'bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded'
      };
    case 'rejected':
      return {
        label: 'Not Available',
        className: 'bg-red-100 text-red-800 text-xs px-2 py-1 rounded'
      };
    default:
      return {
        label: 'Unknown',
        className: 'bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded'
      };
  }
};

/**
 * Checks if user can purchase project
 */
export const canPurchaseProject = (project: Project, user: User | null): boolean => {
  if (!user) return false;
  if (project.status !== 'approved') return false;
  if (user.role !== 'buyer') return false;
  if (project.seller?._id === user._id) return false; // Can't buy own project
  
  return true;
};

/**
 * Gets share URL for project
 */
export const getProjectShareUrl = (projectId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/project/share/${projectId}`;
};

/**
 * Handles project sharing
 */
export const shareProject = async (project: Project): Promise<void> => {
  const shareUrl = getProjectShareUrl(project._id);
  const shareData = {
    title: project.title,
    text: `Check out this amazing project: ${project.title}`,
    url: shareUrl
  };

  try {
    if (navigator.share && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareUrl);
      // You might want to show a toast notification here
      console.log('Share URL copied to clipboard');
    }
  } catch (error) {
    console.error('Error sharing project:', error);
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      console.log('Share URL copied to clipboard');
    } catch (clipboardError) {
      console.error('Failed to copy to clipboard:', clipboardError);
    }
  }
};

/**
 * Universal buy flow configuration
 */
export const BUY_FLOW_CONFIG = {
  // Button styling
  buttonClasses: {
    primary: 'inline-flex items-center px-3 py-1.5 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded border border-gray-600 hover:border-gray-500 transition-colors',
    secondary: 'inline-flex items-center px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded text-sm transition-colors border border-gray-700',
    success: 'inline-flex items-center px-3 py-1.5 bg-green-900/20 border border-green-700 rounded text-sm',
    disabled: 'inline-flex items-center px-3 py-1.5 bg-gray-700 text-gray-400 text-sm rounded border border-gray-600 cursor-not-allowed'
  },
  
  // Icon sizes
  iconSize: 'h-3.5 w-3.5',
  
  // Spacing
  iconMargin: 'mr-1.5',
  
  // Font sizes
  fontSize: 'text-sm'
};
