import React from 'react';
import { Link } from 'react-router-dom';
import {
  Github, Twitter, Linkedin, Mail, Phone, MapPin,
  Heart, Shield, Users, Star, ArrowRight
} from 'lucide-react';
import ProjectBuzzLogo from './ui/ProjectBuzzLogo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <ProjectBuzzLogo
              size="md"
              variant="default"
              showTagline={true}
              className="text-white [&_*]:text-white"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              The premier marketplace for buying and selling high-quality digital projects.
              Connect with talented developers and discover amazing projects.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/market"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Browse Market
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal & Policies</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/refunds"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Refunds & Cancellations
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Sellers</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/seller-registration"
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium group"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Become a Seller
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
              <li>
                <div className="text-gray-400 text-sm">
                  <Shield className="h-4 w-4 inline mr-2" />
                  Instant seller activation
                </div>
              </li>
              <li>
                <div className="text-gray-400 text-sm">
                  <Star className="h-4 w-4 inline mr-2" />
                  85% revenue share
                </div>
              </li>
              <li>
                <div className="text-gray-400 text-sm">
                  Professional dashboard
                </div>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-400 text-sm">
                <Mail className="h-4 w-4 mr-3 flex-shrink-0" />
                <a
                  href="mailto:infoprojectbuzz@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  infoprojectbuzz@gmail.com
                </a>
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <Phone className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>+91 8624829427</span>
              </li>
              <li className="flex items-start text-gray-400 text-sm">
                <MapPin className="h-4 w-4 mr-3 flex-shrink-0 mt-0.5" />
                <span>
                  Amravati, Maharashtra<br />
                  India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Seller CTA Section */}
        <div className="py-8 border-t border-gray-800">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-center">
            <h3 className="text-white text-xl font-bold mb-2">
              Ready to Start Selling?
            </h3>
            <p className="text-blue-100 mb-4 max-w-2xl mx-auto">
              Join our community of sellers and start monetizing your projects immediately.
              Complete registration and begin selling your digital products right away!
            </p>
            <Link
              to="/seller-registration"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Users className="h-5 w-5 mr-2" />
              Start Selling Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 ProjectBuzz. All rights reserved.
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 mx-1 text-red-500" />
              <span>by Aniruddha Gayki</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
