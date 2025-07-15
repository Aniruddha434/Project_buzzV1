/**
 * Google Search Console Integration Component
 * Handles Google Search Console verification and structured data
 */

import React, { useEffect } from 'react';

interface GoogleSearchConsoleProps {
  verificationCode?: string;
}

export const GoogleSearchConsole: React.FC<GoogleSearchConsoleProps> = ({ 
  verificationCode 
}) => {
  useEffect(() => {
    // Add Google Search Console verification meta tag
    if (verificationCode) {
      const existingMeta = document.querySelector('meta[name="google-site-verification"]');
      if (existingMeta) {
        existingMeta.setAttribute('content', verificationCode);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'google-site-verification';
        meta.content = verificationCode;
        document.head.appendChild(meta);
      }
    }

    // Add Organization structured data for better search results
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'ProjectBuzz',
      url: 'https://projectbuzz.tech',
      logo: 'https://projectbuzz.tech/favicon.svg',
      description: 'Digital marketplace for developers to buy and sell programming projects',
      sameAs: [
        'https://github.com/ProjectBuzz',
        'https://twitter.com/ProjectBuzz'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'infoprojectbuzz@gmail.com'
      }
    };

    // Add WebSite structured data with search functionality
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ProjectBuzz',
      url: 'https://projectbuzz.tech',
      description: 'Digital marketplace for developers to buy and sell programming projects',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://projectbuzz.tech/market?search={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    };

    // Add Marketplace structured data
    const marketplaceSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'ProjectBuzz',
      url: 'https://projectbuzz.tech',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'Digital marketplace for developers to buy and sell programming projects',
      offers: {
        '@type': 'Offer',
        category: 'Digital Products',
        itemOffered: {
          '@type': 'SoftwareApplication',
          applicationCategory: 'DeveloperApplication'
        }
      }
    };

    // Combine all schemas
    const combinedSchema = {
      '@context': 'https://schema.org',
      '@graph': [organizationSchema, websiteSchema, marketplaceSchema]
    };

    // Add structured data to page
    const existingScript = document.querySelector('#structured-data');
    if (existingScript) {
      existingScript.textContent = JSON.stringify(combinedSchema);
    } else {
      const script = document.createElement('script');
      script.id = 'structured-data';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(combinedSchema);
      document.head.appendChild(script);
    }

  }, [verificationCode]);

  return null; // This component only manages head tags
};

export default GoogleSearchConsole;
