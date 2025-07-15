/**
 * SEO Head Component for ProjectBuzz
 * Comprehensive SEO optimization with meta tags, structured data, and performance optimization
 */

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { updateSEO, SEOConfig, PAGE_SEO, generateBreadcrumbSchema } from '../../utils/seo';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  structuredData?: any;
  noIndex?: boolean;
  noFollow?: boolean;
  breadcrumbs?: Array<{ name: string; url: string }>;
  customConfig?: Partial<SEOConfig>;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  structuredData,
  noIndex,
  noFollow,
  breadcrumbs,
  customConfig
}) => {
  const location = useLocation();

  useEffect(() => {
    // Determine page-specific SEO config
    let pageSEO: Partial<SEOConfig> = {};
    
    const pathname = location.pathname;
    
    // Map routes to SEO configs
    if (pathname === '/' || pathname === '/home') {
      pageSEO = PAGE_SEO.home;
    } else if (pathname === '/market') {
      pageSEO = PAGE_SEO.market;
    } else if (pathname === '/about') {
      pageSEO = PAGE_SEO.about;
    } else if (pathname === '/login') {
      pageSEO = PAGE_SEO.login;
    } else if (pathname === '/register' || pathname.startsWith('/register/')) {
      pageSEO = PAGE_SEO.register;
    } else if (pathname === '/dashboard/seller') {
      pageSEO = PAGE_SEO.sellerDashboard;
    } else if (pathname === '/dashboard/buyer') {
      pageSEO = PAGE_SEO.buyerDashboard;
    } else if (pathname.includes('/market') && location.search.includes('category=web')) {
      pageSEO = PAGE_SEO.categories.web;
    } else if (pathname.includes('/market') && location.search.includes('category=mobile')) {
      pageSEO = PAGE_SEO.categories.mobile;
    } else if (pathname.includes('/market') && location.search.includes('category=ai-ml')) {
      pageSEO = PAGE_SEO.categories.aiml;
    }

    // Build final SEO config
    const seoConfig: Partial<SEOConfig> = {
      ...pageSEO,
      ...customConfig,
      ...(title && { title }),
      ...(description && { description }),
      ...(keywords && { keywords }),
      ...(canonical && { canonical }),
      ...(ogImage && { ogImage }),
      ...(structuredData && { structuredData }),
      ...(noIndex !== undefined && { noIndex }),
      ...(noFollow !== undefined && { noFollow })
    };

    // Add breadcrumb structured data if provided
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
      
      // Combine with existing structured data
      if (seoConfig.structuredData) {
        seoConfig.structuredData = [seoConfig.structuredData, breadcrumbSchema];
      } else {
        seoConfig.structuredData = breadcrumbSchema;
      }
    }

    // Apply SEO configuration
    updateSEO(seoConfig);

    // Add additional performance and SEO meta tags
    addPerformanceMetaTags();
    addSecurityMetaTags();
    addMobileOptimizationTags();

  }, [location, title, description, keywords, canonical, ogImage, structuredData, noIndex, noFollow, breadcrumbs, customConfig]);

  return null; // This component only manages head tags
};

/**
 * Add performance-related meta tags
 */
const addPerformanceMetaTags = () => {
  // DNS prefetch for external resources
  addLinkTag('dns-prefetch', '//fonts.googleapis.com');
  addLinkTag('dns-prefetch', '//www.google-analytics.com');
  addLinkTag('dns-prefetch', '//checkout.razorpay.com');
  
  // Preconnect to critical resources
  addLinkTag('preconnect', 'https://project-buzzv1-2.onrender.com');
  addLinkTag('preconnect', 'https://fonts.gstatic.com', 'crossorigin');
  
  // Resource hints for better performance
  addMetaTag('http-equiv', 'X-UA-Compatible', 'IE=edge');
  addMetaTag('name', 'format-detection', 'telephone=no');
};

/**
 * Add security-related meta tags
 */
const addSecurityMetaTags = () => {
  addMetaTag('http-equiv', 'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' http://localhost:5000 https://project-buzzv1-2.onrender.com https://checkout.razorpay.com;");

  addMetaTag('http-equiv', 'X-Content-Type-Options', 'nosniff');
  // Note: X-Frame-Options should be set via HTTP headers, not meta tags
  // addMetaTag('http-equiv', 'X-Frame-Options', 'DENY');
  addMetaTag('http-equiv', 'X-XSS-Protection', '1; mode=block');
  addMetaTag('http-equiv', 'Referrer-Policy', 'strict-origin-when-cross-origin');
};

/**
 * Add mobile optimization meta tags
 */
const addMobileOptimizationTags = () => {
  addMetaTag('name', 'viewport', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
  addMetaTag('name', 'mobile-web-app-capable', 'yes');
  addMetaTag('name', 'apple-mobile-web-app-capable', 'yes');
  addMetaTag('name', 'apple-mobile-web-app-status-bar-style', 'black-translucent');
  addMetaTag('name', 'apple-mobile-web-app-title', 'ProjectBuzz');
  addMetaTag('name', 'application-name', 'ProjectBuzz');
  addMetaTag('name', 'msapplication-TileColor', '#000000');
  addMetaTag('name', 'theme-color', '#000000');
};

/**
 * Helper function to add meta tags
 */
const addMetaTag = (attribute: string, name: string, content: string) => {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  
  meta.content = content;
};

/**
 * Helper function to add link tags
 */
const addLinkTag = (rel: string, href: string, crossorigin?: string) => {
  let link = document.querySelector(`link[rel="${rel}"][href="${href}"]`) as HTMLLinkElement;
  
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (crossorigin) {
      link.crossOrigin = crossorigin;
    }
    document.head.appendChild(link);
  }
};

export default SEOHead;
