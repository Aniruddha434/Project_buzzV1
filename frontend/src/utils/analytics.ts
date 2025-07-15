/**
 * Google Analytics and Search Console Integration for ProjectBuzz
 * Comprehensive tracking for SEO performance and user behavior
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Google Analytics Configuration
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || ''; // Only load if provided
const GTM_ID = import.meta.env.VITE_GTM_ID || ''; // Only load if provided

/**
 * Initialize Google Analytics 4
 */
export const initializeGA = () => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true,
    // Enhanced ecommerce for project purchases
    custom_map: {
      custom_parameter_1: 'project_category',
      custom_parameter_2: 'seller_id',
      custom_parameter_3: 'project_price'
    }
  });

  // Track initial page view
  trackPageView(window.location.pathname);
};

/**
 * Track page views for SPA navigation
 */
export const trackPageView = (path: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href
  });

  // Send custom event for SPA navigation
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href
  });
};

/**
 * Track custom events for SEO insights
 */
export const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, {
    event_category: parameters.category || 'engagement',
    event_label: parameters.label,
    value: parameters.value,
    custom_parameter_1: parameters.project_category,
    custom_parameter_2: parameters.seller_id,
    custom_parameter_3: parameters.project_price,
    ...parameters
  });
};

/**
 * Track project views for SEO performance
 */
export const trackProjectView = (project: {
  id: string;
  title: string;
  category: string;
  price: number;
  seller_id: string;
}) => {
  trackEvent('view_item', {
    category: 'ecommerce',
    item_id: project.id,
    item_name: project.title,
    item_category: project.category,
    price: project.price,
    currency: 'INR',
    project_category: project.category,
    seller_id: project.seller_id,
    project_price: project.price
  });
};

/**
 * Track project purchases for conversion tracking
 */
export const trackProjectPurchase = (project: {
  id: string;
  title: string;
  category: string;
  price: number;
  seller_id: string;
}, transactionId: string) => {
  trackEvent('purchase', {
    category: 'ecommerce',
    transaction_id: transactionId,
    value: project.price,
    currency: 'INR',
    items: [{
      item_id: project.id,
      item_name: project.title,
      item_category: project.category,
      price: project.price,
      quantity: 1
    }],
    project_category: project.category,
    seller_id: project.seller_id,
    project_price: project.price
  });
};

/**
 * Track search queries for SEO insights
 */
export const trackSearch = (searchTerm: string, category?: string, resultsCount?: number) => {
  trackEvent('search', {
    category: 'engagement',
    search_term: searchTerm,
    search_category: category,
    search_results: resultsCount,
    label: `${searchTerm}${category ? ` in ${category}` : ''}`
  });
};

/**
 * Track user registration for conversion funnel
 */
export const trackRegistration = (method: string, userRole: string) => {
  trackEvent('sign_up', {
    category: 'engagement',
    method: method, // 'email', 'google', 'github'
    user_role: userRole, // 'buyer', 'seller'
    label: `${method}_${userRole}`
  });
};

/**
 * Track user login for engagement metrics
 */
export const trackLogin = (method: string, userRole: string) => {
  trackEvent('login', {
    category: 'engagement',
    method: method,
    user_role: userRole,
    label: `${method}_${userRole}`
  });
};

/**
 * Track form submissions for conversion optimization
 */
export const trackFormSubmission = (formName: string, success: boolean, errorMessage?: string) => {
  trackEvent('form_submit', {
    category: 'engagement',
    form_name: formName,
    success: success,
    error_message: errorMessage,
    label: `${formName}_${success ? 'success' : 'error'}`
  });
};

/**
 * Track file downloads for engagement metrics
 */
export const trackDownload = (fileName: string, fileType: string, projectId: string) => {
  trackEvent('file_download', {
    category: 'engagement',
    file_name: fileName,
    file_type: fileType,
    project_id: projectId,
    label: `${fileName}_${fileType}`
  });
};

/**
 * Track external link clicks for referral analysis
 */
export const trackExternalLink = (url: string, linkText: string, location: string) => {
  trackEvent('click', {
    category: 'outbound',
    link_url: url,
    link_text: linkText,
    link_location: location,
    label: `${linkText}_${location}`
  });
};

/**
 * Track Core Web Vitals for SEO performance
 */
export const trackWebVitals = (metric: {
  name: string;
  value: number;
  id: string;
  delta?: number;
}) => {
  trackEvent(metric.name, {
    category: 'web_vitals',
    value: Math.round(metric.value),
    metric_id: metric.id,
    metric_delta: metric.delta ? Math.round(metric.delta) : undefined,
    label: metric.name
  });
};

/**
 * Track scroll depth for engagement analysis
 */
export const trackScrollDepth = (percentage: number, page: string) => {
  trackEvent('scroll', {
    category: 'engagement',
    scroll_depth: percentage,
    page_path: page,
    label: `${percentage}%_${page}`
  });
};

/**
 * Initialize scroll depth tracking
 */
export const initializeScrollTracking = () => {
  if (typeof window === 'undefined') return;

  let maxScroll = 0;
  const thresholds = [25, 50, 75, 90, 100];
  const trackedThresholds = new Set<number>();

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;

      // Track threshold crossings
      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
          trackedThresholds.add(threshold);
          trackScrollDepth(threshold, window.location.pathname);
        }
      });
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

/**
 * Google Search Console verification
 */
export const addSearchConsoleVerification = () => {
  if (typeof document === 'undefined') return;

  // Add Google Search Console verification meta tag
  const meta = document.createElement('meta');
  meta.name = 'google-site-verification';
  meta.content = 'YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE'; // Replace with actual code
  document.head.appendChild(meta);

  // Add Bing Webmaster Tools verification
  const bingMeta = document.createElement('meta');
  bingMeta.name = 'msvalidate.01';
  bingMeta.content = 'YOUR_BING_VERIFICATION_CODE'; // Replace with actual code
  document.head.appendChild(bingMeta);
};

/**
 * Initialize all analytics and tracking
 */
export const initializeAnalytics = () => {
  if (process.env.NODE_ENV === 'production') {
    initializeGA();
    addSearchConsoleVerification();
    initializeScrollTracking();
  }
};
