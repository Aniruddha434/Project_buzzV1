/**
 * SEO Validation and Testing Utilities
 * Comprehensive SEO validation for ProjectBuzz
 */

export interface SEOValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  details: {
    title: { isValid: boolean; length: number; content: string };
    description: { isValid: boolean; length: number; content: string };
    keywords: { isValid: boolean; count: number; content: string };
    openGraph: { isValid: boolean; issues: string[] };
    structuredData: { isValid: boolean; schemas: string[] };
    performance: { isValid: boolean; issues: string[] };
    accessibility: { isValid: boolean; issues: string[] };
  };
}

/**
 * Validate current page SEO
 */
export const validatePageSEO = (): SEOValidationResult => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Validate title tag
  const titleElement = document.querySelector('title');
  const title = titleElement?.textContent || '';
  const titleValid = title.length >= 30 && title.length <= 60 && title.includes('ProjectBuzz');
  
  if (!titleValid) {
    issues.push('Title tag is missing, too short, too long, or doesn\'t include brand name');
    score -= 15;
  }

  // Validate meta description
  const descriptionMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
  const description = descriptionMeta?.content || '';
  const descriptionValid = description.length >= 120 && description.length <= 160;
  
  if (!descriptionValid) {
    issues.push('Meta description is missing, too short, or too long');
    score -= 15;
  }

  // Validate keywords
  const keywordsMeta = document.querySelector('meta[name="keywords"]') as HTMLMetaElement;
  const keywords = keywordsMeta?.content || '';
  const keywordsValid = keywords.length > 0 && keywords.includes('ProjectBuzz');
  
  if (!keywordsValid) {
    issues.push('Keywords meta tag is missing or doesn\'t include primary keywords');
    score -= 10;
  }

  // Validate Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
  const ogDescription = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
  const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
  const ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
  
  const ogIssues: string[] = [];
  if (!ogTitle?.content) ogIssues.push('Missing og:title');
  if (!ogDescription?.content) ogIssues.push('Missing og:description');
  if (!ogImage?.content) ogIssues.push('Missing og:image');
  if (!ogUrl?.content) ogIssues.push('Missing og:url');
  
  if (ogIssues.length > 0) {
    issues.push(`Open Graph issues: ${ogIssues.join(', ')}`);
    score -= 10;
  }

  // Validate structured data
  const structuredDataScript = document.querySelector('script[type="application/ld+json"]');
  const structuredDataValid = !!structuredDataScript;
  const schemas: string[] = [];
  
  if (structuredDataScript) {
    try {
      const data = JSON.parse(structuredDataScript.textContent || '');
      if (data['@graph']) {
        schemas.push(...data['@graph'].map((item: any) => item['@type']));
      } else if (data['@type']) {
        schemas.push(data['@type']);
      }
    } catch (e) {
      issues.push('Invalid structured data JSON');
      score -= 10;
    }
  } else {
    issues.push('Missing structured data');
    score -= 15;
  }

  // Validate canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalLink?.href) {
    issues.push('Missing canonical URL');
    score -= 5;
  }

  // Validate favicon
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (!favicon?.href || favicon.href.includes('vite.svg')) {
    issues.push('Missing or default favicon');
    score -= 5;
  }

  // Performance checks
  const performanceIssues: string[] = [];
  
  // Check for resource hints
  const dnsPreconnect = document.querySelectorAll('link[rel="dns-prefetch"], link[rel="preconnect"]');
  if (dnsPreconnect.length === 0) {
    performanceIssues.push('Missing resource hints (dns-prefetch/preconnect)');
  }

  // Check for manifest
  const manifest = document.querySelector('link[rel="manifest"]');
  if (!manifest) {
    performanceIssues.push('Missing web app manifest');
  }

  if (performanceIssues.length > 0) {
    issues.push(...performanceIssues);
    score -= performanceIssues.length * 3;
  }

  // Accessibility checks
  const accessibilityIssues: string[] = [];
  
  // Check for lang attribute
  const htmlLang = document.documentElement.lang;
  if (!htmlLang) {
    accessibilityIssues.push('Missing lang attribute on html element');
  }

  // Check for viewport meta tag
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    accessibilityIssues.push('Missing viewport meta tag');
  }

  if (accessibilityIssues.length > 0) {
    issues.push(...accessibilityIssues);
    score -= accessibilityIssues.length * 2;
  }

  // Generate recommendations
  if (score < 90) {
    recommendations.push('Optimize meta tags for better search engine visibility');
  }
  if (ogIssues.length > 0) {
    recommendations.push('Add complete Open Graph tags for better social media sharing');
  }
  if (!structuredDataValid) {
    recommendations.push('Implement structured data markup for rich snippets');
  }
  if (performanceIssues.length > 0) {
    recommendations.push('Add performance optimizations like resource hints and web app manifest');
  }

  return {
    isValid: score >= 80,
    score: Math.max(0, score),
    issues,
    recommendations,
    details: {
      title: { isValid: titleValid, length: title.length, content: title },
      description: { isValid: descriptionValid, length: description.length, content: description },
      keywords: { isValid: keywordsValid, count: keywords.split(',').length, content: keywords },
      openGraph: { isValid: ogIssues.length === 0, issues: ogIssues },
      structuredData: { isValid: structuredDataValid, schemas },
      performance: { isValid: performanceIssues.length === 0, issues: performanceIssues },
      accessibility: { isValid: accessibilityIssues.length === 0, issues: accessibilityIssues }
    }
  };
};

/**
 * Generate SEO report for console logging
 */
export const generateSEOReport = (): void => {
  const result = validatePageSEO();
  
  console.group('🔍 ProjectBuzz SEO Validation Report');
  console.log(`📊 Overall Score: ${result.score}/100 ${result.isValid ? '✅' : '❌'}`);
  
  if (result.issues.length > 0) {
    console.group('⚠️ Issues Found:');
    result.issues.forEach(issue => console.log(`• ${issue}`));
    console.groupEnd();
  }
  
  if (result.recommendations.length > 0) {
    console.group('💡 Recommendations:');
    result.recommendations.forEach(rec => console.log(`• ${rec}`));
    console.groupEnd();
  }
  
  console.group('📋 Detailed Analysis:');
  console.log('Title:', result.details.title);
  console.log('Description:', result.details.description);
  console.log('Keywords:', result.details.keywords);
  console.log('Open Graph:', result.details.openGraph);
  console.log('Structured Data:', result.details.structuredData);
  console.log('Performance:', result.details.performance);
  console.log('Accessibility:', result.details.accessibility);
  console.groupEnd();
  
  console.groupEnd();
};

/**
 * Auto-run SEO validation in development
 */
if (process.env.NODE_ENV === 'development') {
  // Run validation after page load
  window.addEventListener('load', () => {
    setTimeout(generateSEOReport, 1000);
  });
}
