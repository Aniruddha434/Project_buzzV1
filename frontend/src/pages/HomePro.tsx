import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FeaturedProjects from '../components/FeaturedProjects';
import { DemoOne } from '../components/ui/demo-one';
import { WhyChooseProjectBuzzPins, HowItWorksPins, JoinCommunityPins } from '../components/ProjectBuzzPins';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';

const HomePro: React.FC = () => {
  const { user } = useAuth();







  return (
    <div className="min-h-screen bg-black page-with-navbar">
      {/* Hero Section with Rubik's Cube */}
      <DemoOne />





      {/* Featured Projects */}
      <FeaturedProjects
        title="Featured Projects"
        subtitle="Quality projects from verified developers"
        limit={4}
        showViewAllButton={true}
      />

      {/* Why Choose ProjectBuzz - 3D Pins */}
      <WhyChooseProjectBuzzPins />

      {/* How It Works - 3D Pins */}
      <HowItWorksPins />

      {/* Join Our Community - 3D Pins */}
      <JoinCommunityPins />

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
  );
};

export default HomePro;