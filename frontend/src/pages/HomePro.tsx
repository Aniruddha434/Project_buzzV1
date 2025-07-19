import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FeaturedProjects from '../components/FeaturedProjects';
import { EnhancedHero } from '../components/ui/EnhancedHero';
import { WhyChooseProjectBuzzPins, HowItWorksPins, JoinCommunityPins } from '../components/ProjectBuzzPins';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import SEOHead from '../components/SEO/SEOHead';

const HomePro: React.FC = () => {
  const { user } = useAuth();

  // SEO structured data for homepage
  const homepageStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ProjectBuzz',
    alternateName: 'Project Buzz',
    url: 'https://projectbuzz.tech',
    description: 'Where Digital Projects Come to Life - ProjectBuzz is the premier digital marketplace for developers to buy and sell high-quality programming projects, source code, and innovative solutions.',
    keywords: 'ProjectBuzz, project buzz, digital marketplace, where digital projects come to life, buy projects, sell projects, developer marketplace, code marketplace, programming projects',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://projectbuzz.tech/market?search={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'ProjectBuzz',
      url: 'https://projectbuzz.tech',
      founder: {
        '@type': 'Person',
        name: 'Aniruddha Gayki'
      }
    }
  };

  return (
    <>
      {/* SEO Head Component */}
      <SEOHead
        title="ProjectBuzz - Where Digital Projects Come to Life | Developer Marketplace"
        description="Where Digital Projects Come to Life - ProjectBuzz is the premier marketplace for developers to buy ready-made projects, sell coding solutions, and discover innovative programming projects worldwide."
        keywords={[
          'ProjectBuzz', 'project buzz', 'digital marketplace', 'where digital projects come to life',
          'buy projects', 'sell projects', 'developer marketplace', 'code marketplace', 'programming projects',
          'buy ready-made projects', 'sell coding projects online', 'developer project marketplace',
          'purchase source code projects', 'marketplace for developers', 'buy programming projects',
          'sell software projects', 'digital project marketplace', 'code project marketplace'
        ]}
        canonical="https://projectbuzz.tech"
        ogImage="https://projectbuzz.tech/og-image-homepage.jpg"
        structuredData={homepageStructuredData}
        breadcrumbs={[
          { name: 'Home', url: 'https://projectbuzz.tech' }
        ]}
      />

      <div className="min-h-screen bg-black page-with-navbar">
        {/* Enhanced Hero Section - SEO Optimized */}
        <header role="banner" aria-label="ProjectBuzz Digital Marketplace Hero">
          <EnhancedHero />
        </header>







        {/* Featured Projects - SEO Enhanced */}
        <section aria-label="Featured Programming Projects">
          <FeaturedProjects
            title="Featured Projects - Top Programming Solutions"
            subtitle="Discover quality projects from verified developers in our digital marketplace"
            limit={4}
            showViewAllButton={true}
          />
        </section>

        {/* Why Choose ProjectBuzz - 3D Pins */}
        <section aria-label="Why Choose ProjectBuzz Digital Marketplace">
          <WhyChooseProjectBuzzPins />
        </section>

        {/* How It Works - 3D Pins */}
        <section aria-label="How ProjectBuzz Marketplace Works">
          <HowItWorksPins />
        </section>

        {/* Join Our Community - 3D Pins */}
        <section aria-label="Join ProjectBuzz Developer Community">
          <JoinCommunityPins />
        </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {user ? (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Welcome back, {user.displayName}!
              </h2>
              <p className="text-lg mb-8 text-primary-foreground/80">
                Continue exploring amazing projects or manage your {user.role === 'seller' ? 'listings' : user.role === 'admin' ? 'platform' : 'purchases'}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-lg mb-8 text-primary-foreground/80">
                Join developers building amazing projects with ProjectBuzz
              </p>
            </>
          )}

          {user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/market">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />} className="bg-white text-black hover:bg-gray-200">
                  Browse Market
                </Button>
              </Link>
              {user.role === 'seller' && (
                <Link to="/dashboard/seller">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                    Seller Dashboard
                  </Button>
                </Link>
              )}
              {user.role === 'buyer' && (
                <Link to="/dashboard/buyer">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                    My Purchases
                  </Button>
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/dashboard/admin">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                    Admin Dashboard
                  </Button>
                </Link>
              )}
            </div>
          )}

          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/login">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />} className="bg-white text-black hover:bg-gray-200">
                  Get Started
                </Button>
              </Link>
              <Link to="/market">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                  Browse Market
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-primary-foreground/70">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Free to join
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Secure payments
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              24/7 support
            </div>
          </div>
        </div>
      </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default HomePro;