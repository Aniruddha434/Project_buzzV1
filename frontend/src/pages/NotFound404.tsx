/**
 * SEO-Optimized 404 Not Found Page for ProjectBuzz
 * Helps maintain SEO value and provides helpful navigation
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, ExternalLink } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import Button from '../components/ui/Button';

const NotFound404: React.FC = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '404 - Page Not Found | ProjectBuzz',
    description: 'The page you are looking for could not be found on ProjectBuzz. Explore our digital marketplace for programming projects.',
    url: typeof window !== 'undefined' ? window.location.href : 'https://projectbuzz.tech/404',
    isPartOf: {
      '@type': 'WebSite',
      name: 'ProjectBuzz',
      url: 'https://projectbuzz.tech'
    }
  };

  const popularPages = [
    {
      title: 'Browse Projects',
      description: 'Discover amazing programming projects',
      href: '/market',
      icon: <Search className="w-5 h-5" />
    },
    {
      title: 'Web Development Projects',
      description: 'React, Vue, Angular, and more',
      href: '/market?category=web',
      icon: <ExternalLink className="w-5 h-5" />
    },
    {
      title: 'Mobile App Projects',
      description: 'iOS, Android, React Native, Flutter',
      href: '/market?category=mobile',
      icon: <ExternalLink className="w-5 h-5" />
    },
    {
      title: 'AI/ML Projects',
      description: 'Machine learning and AI solutions',
      href: '/market?category=ai-ml',
      icon: <ExternalLink className="w-5 h-5" />
    }
  ];

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About ProjectBuzz', href: '/about' },
    { name: 'Digital Marketplace', href: '/market' },
    { name: 'Login', href: '/login' },
    { name: 'Register', href: '/register' }
  ];

  return (
    <>
      <SEOHead
        title="404 - Page Not Found | ProjectBuzz Digital Marketplace"
        description="The page you are looking for could not be found on ProjectBuzz. Explore our digital marketplace for programming projects, buy ready-made solutions, and discover innovative code."
        keywords={[
          '404', 'page not found', 'ProjectBuzz', 'digital marketplace',
          'programming projects', 'buy projects', 'developer marketplace'
        ]}
        canonical={`https://projectbuzz.tech${typeof window !== 'undefined' ? window.location.pathname : '/404'}`}
        noIndex={true}
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-black text-white page-with-navbar">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* 404 Header */}
          <div className="text-center mb-16">
            <div className="mb-8">
              <h1 className="text-8xl md:text-9xl font-bold text-white/20 mb-4">
                404
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Page Not Found
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                The page you're looking for doesn't exist on ProjectBuzz. 
                But don't worry - there are plenty of amazing programming projects to discover!
              </p>
            </div>

            {/* Back to Home Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/">
                <Button 
                  variant="primary" 
                  size="lg" 
                  leftIcon={<Home className="w-5 h-5" />}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  Back to Home
                </Button>
              </Link>
              <Link to="/market">
                <Button 
                  variant="outline" 
                  size="lg" 
                  leftIcon={<Search className="w-5 h-5" />}
                  className="border-white text-white hover:bg-white hover:text-black"
                >
                  Browse Projects
                </Button>
              </Link>
            </div>
          </div>

          {/* Popular Pages Section */}
          <section className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Popular Pages on ProjectBuzz
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularPages.map((page, index) => (
                <Link
                  key={index}
                  to={page.href}
                  className="group p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-all duration-200 hover:bg-gray-800"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
                      {page.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-gray-200">
                        {page.title}
                      </h4>
                      <p className="text-gray-400 group-hover:text-gray-300">
                        {page.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Quick Links */}
          <section className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Quick Navigation
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  className="px-4 py-2 bg-gray-900 text-gray-300 rounded-lg border border-gray-800 hover:border-gray-600 hover:bg-gray-800 hover:text-white transition-all duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </section>

          {/* SEO Content Section */}
          <section className="text-center">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">
                About ProjectBuzz Digital Marketplace
              </h3>
              <div className="text-gray-400 space-y-4">
                <p>
                  ProjectBuzz is the premier digital marketplace for developers to buy and sell 
                  high-quality programming projects. Whether you're looking to buy ready-made 
                  projects or sell your coding solutions, ProjectBuzz connects developers worldwide.
                </p>
                <p>
                  Explore thousands of projects across web development, mobile apps, AI/ML, 
                  blockchain, and more. Join our growing community of developers and discover 
                  innovative solutions for your next project.
                </p>
              </div>
              
              {/* Keywords for SEO */}
              <div className="mt-8 text-sm text-gray-600">
                <p>
                  <strong>Popular searches:</strong> React projects, Node.js applications, 
                  mobile app templates, AI projects, e-commerce solutions, dashboard templates, 
                  portfolio websites, full-stack applications
                </p>
              </div>
            </div>
          </section>

          {/* Breadcrumb for SEO */}
          <nav className="mt-16 text-sm text-gray-500" aria-label="Breadcrumb">
            <ol className="flex items-center justify-center space-x-2">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  ProjectBuzz
                </Link>
              </li>
              <li className="mx-2">/</li>
              <li className="text-gray-400">404 - Page Not Found</li>
            </ol>
          </nav>
        </div>
      </div>
    </>
  );
};

export default NotFound404;
