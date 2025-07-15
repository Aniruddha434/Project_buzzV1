/**
 * SEO Utilities for ProjectBuzz
 * Comprehensive SEO optimization system for achieving top search rankings
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: any;
  noIndex?: boolean;
  noFollow?: boolean;
}

// Primary and secondary keywords for ProjectBuzz
export const KEYWORDS = {
  primary: ['ProjectBuzz', 'project buzz', 'digital marketplace'],
  secondary: ['buy projects', 'sell projects', 'developer marketplace', 'code marketplace', 'programming projects'],
  longTail: [
    'buy ready-made projects',
    'sell coding projects online',
    'developer project marketplace',
    'purchase source code projects',
    'marketplace for developers',
    'buy programming projects',
    'sell software projects',
    'digital project marketplace',
    'code project marketplace',
    'developer project store'
  ]
};

// Default SEO configuration for ProjectBuzz
export const DEFAULT_SEO: SEOConfig = {
  title: 'ProjectBuzz - Digital Marketplace for Developers | Buy & Sell Projects',
  description: 'ProjectBuzz is the premier digital marketplace for developers. Buy ready-made projects, sell coding projects, and discover innovative solutions. Join thousands of developers worldwide.',
  keywords: [...KEYWORDS.primary, ...KEYWORDS.secondary, ...KEYWORDS.longTail],
  ogType: 'website',
  ogImage: 'https://projectbuzz.tech/og-image.jpg',
  twitterCard: 'summary_large_image',
  canonical: 'https://projectbuzz.tech'
};

// Page-specific SEO configurations
export const PAGE_SEO: Record<string, SEOConfig> = {
  home: {
    title: 'ProjectBuzz - Digital Marketplace for Developers | Buy & Sell Projects',
    description: 'Discover, buy, and sell high-quality programming projects on ProjectBuzz. The premier digital marketplace for developers with ready-made solutions, source code, and innovative projects.',
    keywords: [...KEYWORDS.primary, ...KEYWORDS.secondary, 'homepage', 'featured projects'],
    canonical: 'https://projectbuzz.tech',
    structuredData: {
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
    }
  },
  
  market: {
    title: 'Browse Projects - Digital Marketplace | ProjectBuzz',
    description: 'Browse thousands of high-quality programming projects on ProjectBuzz. Find web development, mobile apps, AI/ML projects, and more. Buy ready-made solutions from expert developers.',
    keywords: [...KEYWORDS.secondary, 'browse projects', 'project catalog', 'programming solutions'],
    canonical: 'https://projectbuzz.tech/market',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Project Marketplace',
      description: 'Browse and purchase programming projects',
      url: 'https://projectbuzz.tech/market'
    }
  },

  about: {
    title: 'About ProjectBuzz - Digital Marketplace Founded by Aniruddha Gayki',
    description: 'Learn about ProjectBuzz, the revolutionary digital marketplace founded by Aniruddha Gayki. Discover our mission to empower developers worldwide with high-quality projects and source code.',
    keywords: ['ProjectBuzz', 'Aniruddha Gayki', 'about us', 'digital marketplace', 'company story'],
    canonical: 'https://projectbuzz.tech/about'
  },

  sellerDashboard: {
    title: 'Seller Dashboard - Manage Your Projects | ProjectBuzz',
    description: 'Manage your projects, track sales, and grow your business on ProjectBuzz. Comprehensive seller dashboard for digital project creators and developers.',
    keywords: ['seller dashboard', 'manage projects', 'sell projects', 'project management'],
    canonical: 'https://projectbuzz.tech/dashboard/seller',
    noIndex: true // Private dashboard pages
  },

  buyerDashboard: {
    title: 'Buyer Dashboard - Your Purchased Projects | ProjectBuzz',
    description: 'Access your purchased projects, download source code, and manage your ProjectBuzz account. Secure buyer dashboard for project purchasers.',
    keywords: ['buyer dashboard', 'purchased projects', 'my projects', 'account management'],
    canonical: 'https://projectbuzz.tech/dashboard/buyer',
    noIndex: true // Private dashboard pages
  },

  login: {
    title: 'Login to ProjectBuzz - Digital Marketplace for Developers',
    description: 'Login to your ProjectBuzz account to access the digital marketplace. Buy projects, sell your code, and connect with developers worldwide.',
    keywords: ['login', 'sign in', 'account access', 'ProjectBuzz login'],
    canonical: 'https://projectbuzz.tech/login'
  },

  register: {
    title: 'Join ProjectBuzz - Create Your Developer Account Today',
    description: 'Create your free ProjectBuzz account and join thousands of developers. Start buying and selling programming projects in the premier digital marketplace.',
    keywords: ['register', 'sign up', 'create account', 'join ProjectBuzz', 'developer account'],
    canonical: 'https://projectbuzz.tech/register'
  },

  categories: {
    web: {
      title: 'Web Development Projects - Buy Ready-Made Solutions | ProjectBuzz',
      description: 'Discover premium web development projects on ProjectBuzz. React, Vue, Angular, Node.js, and full-stack solutions. Buy ready-made web applications from expert developers.',
      keywords: ['web development projects', 'React projects', 'Vue projects', 'Angular projects', 'Node.js', 'full-stack'],
      canonical: 'https://projectbuzz.tech/market?category=web'
    },
    mobile: {
      title: 'Mobile App Projects - iOS & Android Solutions | ProjectBuzz',
      description: 'Browse mobile app projects for iOS and Android. React Native, Flutter, Swift, and Kotlin projects. Buy complete mobile applications and source code.',
      keywords: ['mobile app projects', 'iOS projects', 'Android projects', 'React Native', 'Flutter', 'mobile development'],
      canonical: 'https://projectbuzz.tech/market?category=mobile'
    },
    aiml: {
      title: 'AI & Machine Learning Projects - Advanced Solutions | ProjectBuzz',
      description: 'Explore cutting-edge AI and machine learning projects. Python, TensorFlow, PyTorch, and deep learning solutions. Buy advanced AI projects from expert developers.',
      keywords: ['AI projects', 'machine learning projects', 'Python AI', 'TensorFlow', 'PyTorch', 'deep learning'],
      canonical: 'https://projectbuzz.tech/market?category=ai-ml'
    }
  }
};

/**
 * Update document head with SEO meta tags
 */
export const updateSEO = (config: Partial<SEOConfig>) => {
  const seoConfig = { ...DEFAULT_SEO, ...config };

  // Update title
  document.title = seoConfig.title;

  // Update or create meta tags
  updateMetaTag('description', seoConfig.description);
  updateMetaTag('keywords', seoConfig.keywords.join(', '));
  
  // Canonical URL
  if (seoConfig.canonical) {
    updateLinkTag('canonical', seoConfig.canonical);
  }

  // Open Graph tags
  updateMetaTag('og:title', seoConfig.ogTitle || seoConfig.title, 'property');
  updateMetaTag('og:description', seoConfig.ogDescription || seoConfig.description, 'property');
  updateMetaTag('og:type', seoConfig.ogType || 'website', 'property');
  updateMetaTag('og:url', seoConfig.canonical || window.location.href, 'property');
  updateMetaTag('og:site_name', 'ProjectBuzz', 'property');
  
  if (seoConfig.ogImage) {
    updateMetaTag('og:image', seoConfig.ogImage, 'property');
    updateMetaTag('og:image:alt', seoConfig.title, 'property');
  }

  // Twitter Card tags
  updateMetaTag('twitter:card', seoConfig.twitterCard || 'summary_large_image');
  updateMetaTag('twitter:title', seoConfig.twitterTitle || seoConfig.title);
  updateMetaTag('twitter:description', seoConfig.twitterDescription || seoConfig.description);
  updateMetaTag('twitter:site', '@ProjectBuzz');
  
  if (seoConfig.twitterImage || seoConfig.ogImage) {
    updateMetaTag('twitter:image', seoConfig.twitterImage || seoConfig.ogImage);
  }

  // Robots meta tag
  const robotsContent = [];
  if (seoConfig.noIndex) robotsContent.push('noindex');
  if (seoConfig.noFollow) robotsContent.push('nofollow');
  if (robotsContent.length === 0) robotsContent.push('index', 'follow');
  updateMetaTag('robots', robotsContent.join(', '));

  // Structured data
  if (seoConfig.structuredData) {
    updateStructuredData(seoConfig.structuredData);
  }
};

/**
 * Update or create meta tag
 */
const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  
  meta.content = content;
};

/**
 * Update or create link tag
 */
const updateLinkTag = (rel: string, href: string) => {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  
  link.href = href;
};

/**
 * Update structured data (JSON-LD)
 */
const updateStructuredData = (data: any) => {
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * Generate breadcrumb structured data
 */
export const generateBreadcrumbSchema = (breadcrumbs: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };
};

/**
 * Generate product schema for projects
 */
export const generateProductSchema = (project: any) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: project.title,
    description: project.description,
    image: project.images?.[0]?.url,
    brand: {
      '@type': 'Brand',
      name: 'ProjectBuzz'
    },
    offers: {
      '@type': 'Offer',
      price: project.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: project.seller?.displayName || 'ProjectBuzz Seller'
      }
    },
    aggregateRating: project.rating?.average ? {
      '@type': 'AggregateRating',
      ratingValue: project.rating.average,
      reviewCount: project.rating.count
    } : undefined
  };
};
