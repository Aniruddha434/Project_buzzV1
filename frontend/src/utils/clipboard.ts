/**
 * Copy text to clipboard utility
 * Handles browser compatibility and provides user feedback
 */

export interface ClipboardResult {
  success: boolean;
  message: string;
}

/**
 * Copy text to clipboard using modern Clipboard API with fallback
 */
export const copyToClipboard = async (text: string): Promise<ClipboardResult> => {
  try {
    // Try modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return {
        success: true,
        message: 'Link copied to clipboard!'
      };
    }
    
    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      return {
        success: true,
        message: 'Link copied to clipboard!'
      };
    } else {
      throw new Error('Copy command failed');
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return {
      success: false,
      message: 'Failed to copy link. Please copy manually.'
    };
  }
};

/**
 * Generate shareable URL for a project
 */
export const generateShareableUrl = (projectId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/project/share/${projectId}`;
};

/**
 * Check if clipboard API is supported
 */
export const isClipboardSupported = (): boolean => {
  return !!(navigator.clipboard || document.execCommand);
};
