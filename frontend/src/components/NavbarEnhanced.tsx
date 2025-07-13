import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Settings, Bell, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import Button from './ui/Button';
import Badge from './ui/Badge';
import NotificationCenter from './NotificationCenter';
import ProjectBuzzLogo from './ui/ProjectBuzzLogo';

const NavbarEnhanced: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isHoveringTop, setIsHoveringTop] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Update scrolled state
      setIsScrolled(currentScrollY > 10);

      // Auto-hide logic
      if (currentScrollY < 10) {
        // Always show at top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100 && !isHoveringTop) {
        // Scrolling down & past threshold - hide (unless hovering)
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY || isHoveringTop) {
        // Scrolling up or hovering top area - show
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [lastScrollY, isHoveringTop]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const getDashboardPath = () => {
    switch (role) {
      case 'seller':
        return '/dashboard/seller';
      case 'buyer':
        return '/dashboard/buyer';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/dashboard/buyer';
    }
  };

  const getSettingsPath = () => {
    switch (role) {
      case 'seller':
        return '/dashboard/seller'; // Redirect to seller dashboard (settings can be added later)
      case 'buyer':
        return '/dashboard/buyer?tab=settings'; // Direct link to buyer dashboard settings tab
      case 'admin':
        return '/dashboard/admin'; // Redirect to admin dashboard (admin settings via admin management)
      default:
        return '/dashboard/buyer?tab=settings';
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: 'Home', path: '/', icon: null },
    { name: 'Market', path: '/market', icon: null },
    { name: 'About', path: '/about', icon: null },
    ...(user && role === 'buyer' ? [{ name: 'Negotiations', path: '/negotiations', icon: null }] : []),
  ];

  return (
    <>
      {/* Hover detection area */}
      <div
        className="fixed top-0 left-0 right-0 h-20 z-40 pointer-events-none"
        onMouseEnter={() => setIsHoveringTop(true)}
        onMouseLeave={() => setIsHoveringTop(false)}
        style={{ pointerEvents: isVisible ? 'none' : 'auto' }}
      />

      <motion.nav
        initial={{ y: -100 }}
        animate={{
          y: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0
        }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth animation
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-black/90 backdrop-blur-xl shadow-xl border-b border-gray-800/50'
            : 'bg-black/95 backdrop-blur-lg shadow-lg'
        }`}
        style={{
          // Ensure consistent positioning across browsers
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          // Chrome-specific fixes
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
          // Ensure proper stacking context
          isolation: 'isolate'
        }}
        onMouseEnter={() => setIsHoveringTop(true)}
        onMouseLeave={() => setIsHoveringTop(false)}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div>
            <Link to="/" className="block">
              <ProjectBuzzLogo
                size="md"
                variant="default"
                showTagline={true}
                className="transition-transform duration-200 hover:scale-105"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg ${
                  isActive(item.path)
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {item.name}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Search Button */}
                <Button variant="ghost" size="sm" className="hidden lg:flex">
                  <Search className="h-4 w-4" />
                </Button>

                {/* Notifications */}
                <NotificationCenter className="relative" />

                {/* Dashboard Link */}
                <Link to={getDashboardPath()}>
                  <Button
                    variant={isActive(getDashboardPath()) ? 'primary' : 'outline'}
                    size="sm"
                    className="hidden md:flex"
                  >
                    Dashboard
                  </Button>
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-xl"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="h-8 w-8 rounded-full ring-2 ring-blue-500/20 object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className="hidden lg:block text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.displayName || 'User'}
                      </div>
                      <Badge variant="info" size="sm" className="mt-0.5">
                        {role}
                      </Badge>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-3">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.displayName || 'User'}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {user.displayName || 'User'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <Link
                            to={getSettingsPath()}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            Profile Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm text-red-600"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="gradient" size="sm" glow>
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {user && (
                <>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-600"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
    </>
  );
};

export default NavbarEnhanced;
