/**
 * Utility to fix SVG attribute validation errors with Framer Motion
 * This addresses the "Expected length, 'auto'" errors during payment verification
 */

// Store original console.error to restore later if needed
const originalConsoleError = console.error;

/**
 * Suppress specific SVG attribute validation errors
 */
export const suppressSVGErrors = () => {
  console.error = (...args: any[]) => {
    const message = args[0];
    
    // Check if it's an SVG attribute validation error
    if (
      typeof message === 'string' && 
      (
        message.includes('attribute width: Expected length, "auto"') ||
        message.includes('attribute height: Expected length, "auto"') ||
        message.includes('<svg> attribute width') ||
        message.includes('<svg> attribute height')
      )
    ) {
      // Suppress these specific SVG errors
      return;
    }
    
    // Allow all other console.error messages
    originalConsoleError.apply(console, args);
  };
};

/**
 * Restore original console.error behavior
 */
export const restoreConsoleError = () => {
  console.error = originalConsoleError;
};

/**
 * Fix SVG elements that might have invalid auto attributes
 */
export const fixSVGAttributes = () => {
  // Find all SVG elements with auto width/height
  const svgElements = document.querySelectorAll('svg[width="auto"], svg[height="auto"]');
  
  svgElements.forEach((svg) => {
    // Remove invalid auto attributes
    if (svg.getAttribute('width') === 'auto') {
      svg.removeAttribute('width');
    }
    if (svg.getAttribute('height') === 'auto') {
      svg.removeAttribute('height');
    }
  });
};

/**
 * Initialize SVG error fixes
 * Call this once when the app starts
 */
export const initSVGFixes = () => {
  // Suppress SVG validation errors
  suppressSVGErrors();
  
  // Fix existing SVG elements
  fixSVGAttributes();
  
  // Set up a mutation observer to fix new SVG elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if the added node is an SVG or contains SVGs
            if (element.tagName === 'svg') {
              fixSVGElement(element);
            } else {
              const svgs = element.querySelectorAll('svg');
              svgs.forEach(fixSVGElement);
            }
          }
        });
      }
      
      // Also check for attribute changes
      if (mutation.type === 'attributes' && mutation.target.nodeName === 'svg') {
        const svg = mutation.target as Element;
        if (mutation.attributeName === 'width' || mutation.attributeName === 'height') {
          fixSVGElement(svg);
        }
      }
    });
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['width', 'height']
  });
  
  return observer;
};

/**
 * Fix a single SVG element
 */
const fixSVGElement = (svg: Element) => {
  if (svg.getAttribute('width') === 'auto') {
    svg.removeAttribute('width');
  }
  if (svg.getAttribute('height') === 'auto') {
    svg.removeAttribute('height');
  }
};

/**
 * Cleanup function for development
 */
export const cleanupSVGFixes = (observer?: MutationObserver) => {
  restoreConsoleError();
  if (observer) {
    observer.disconnect();
  }
};
