import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx'; // Ensure this path is correct and .tsx
import ProjectBuzzLogo from './ui/ProjectBuzzLogo';

const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      // User will be redirected or UI will update based on AuthContext state change
    } catch (error) {
      console.error('Error logging out:', error);
      // Optionally, set an error state here to display to the user
    }
  };

  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="block">
              <ProjectBuzzLogo
                size="md"
                variant="default"
                showTagline={false}
                className="text-white [&_*]:text-white"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {user ? (
                <>
                  {role === 'buyer' && (
                    <>
                      <Link
                        to="/dashboard/buyer"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          isActive('/dashboard/buyer')
                            ? 'bg-blue-700 text-white'
                            : 'text-white hover:bg-blue-700'
                        }`}
                      >
                        Buyer Dashboard
                      </Link>
                      <Link
                        to="/negotiations"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          isActive('/negotiations')
                            ? 'bg-blue-700 text-white'
                            : 'text-white hover:bg-blue-700'
                        }`}
                      >
                        Negotiations
                      </Link>
                    </>
                  )}
                  {role === 'seller' && (
                    <Link
                      to="/dashboard/seller"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive('/dashboard/seller')
                          ? 'bg-blue-700 text-white'
                          : 'text-white hover:bg-blue-700'
                      }`}
                    >
                      Seller Dashboard
                    </Link>
                  )}
                  {role === 'admin' && (
                    <Link
                      to="/dashboard/admin"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive('/dashboard/admin')
                          ? 'bg-blue-700 text-white'
                          : 'text-white hover:bg-blue-700'
                      }`}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="ml-4 px-4 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-white text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button" // Explicitly set button type
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
              aria-controls="mobile-menu" // Accessibility: controls which element this button toggles
              aria-expanded={isMenuOpen} // Accessibility: indicates if the controlled element is expanded
            >
              <span className="sr-only">Open main menu</span> { /* Accessibility: for screen readers */}
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true" // Decorative icon
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu"> {/* Accessibility: id matches aria-controls */}
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                {role === 'buyer' && (
                  <>
                    <Link
                      to="/dashboard/buyer"
                      onClick={() => setIsMenuOpen(false)} // Close menu on click
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive('/dashboard/buyer')
                          ? 'bg-blue-700 text-white'
                          : 'text-white hover:bg-blue-700'
                      }`}
                    >
                      Buyer Dashboard
                    </Link>
                    <Link
                      to="/negotiations"
                      onClick={() => setIsMenuOpen(false)} // Close menu on click
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive('/negotiations')
                          ? 'bg-blue-700 text-white'
                          : 'text-white hover:bg-blue-700'
                      }`}
                    >
                      Negotiations
                    </Link>
                  </>
                )}
                {role === 'seller' && (
                  <Link
                    to="/dashboard/seller"
                    onClick={() => setIsMenuOpen(false)} // Close menu on click
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/dashboard/seller')
                        ? 'bg-blue-700 text-white'
                        : 'text-white hover:bg-blue-700'
                    }`}
                  >
                    Seller Dashboard
                  </Link>
                )}
                {role === 'admin' && (
                  <Link
                    to="/dashboard/admin"
                    onClick={() => setIsMenuOpen(false)} // Close menu on click
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/dashboard/admin')
                        ? 'bg-blue-700 text-white'
                        : 'text-white hover:bg-blue-700'
                    }`}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }} // Close menu on click
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium bg-red-500 hover:bg-red-600 text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)} // Close menu on click
                className="block px-3 py-2 rounded-md text-base font-medium bg-white text-blue-600 hover:bg-blue-50"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;