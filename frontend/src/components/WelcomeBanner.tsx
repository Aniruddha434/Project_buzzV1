import React, { useState, useEffect } from 'react';
import { X, Gift, Sparkles, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface WelcomeBannerProps {
  onClose?: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Show banner only for non-authenticated users or new buyers
    if (!user) {
      // Check if banner was dismissed in this session
      const dismissed = sessionStorage.getItem('welcomeBannerDismissed');
      if (!dismissed) {
        setIsVisible(true);
        // Add entrance animation delay
        setTimeout(() => setIsAnimating(true), 100);
      }
    } else if (user.role === 'buyer') {
      // Check if user has made any purchases (could be enhanced with API call)
      // For now, show to all buyers - can be refined later
      const dismissed = sessionStorage.getItem('welcomeBannerDismissed');
      if (!dismissed) {
        setIsVisible(true);
        setTimeout(() => setIsAnimating(true), 100);
      }
    }
  }, [user]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('welcomeBannerDismissed', 'true');
      onClose?.();
    }, 300);
  };

  const handleGetStarted = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/market');
    }
  };

  const handleBrowseProjects = () => {
    navigate('/market');
  };

  if (!isVisible) return null;

  return (
    <div className={`welcome-banner-container ${isAnimating ? 'animate-in' : ''}`}>
      <div className="welcome-banner">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="welcome-banner-close"
          aria-label="Close welcome banner"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Banner Content */}
        <div className="welcome-banner-content">
          {/* Icon and Badge */}
          <div className="welcome-banner-icon">
            <div className="gift-icon-wrapper">
              <Gift className="h-8 w-8 text-yellow-400" />
              <Sparkles className="h-4 w-4 text-yellow-300 sparkle-1" />
              <Sparkles className="h-3 w-3 text-yellow-200 sparkle-2" />
            </div>
            <div className="welcome-badge">
              New to ProjectBuzz?
            </div>
          </div>

          {/* Main Message */}
          <div className="welcome-banner-text">
            <h3 className="welcome-title">
              Get 20% off your first purchase!
            </h3>
            <p className="welcome-subtitle">
              Use code <span className="discount-code">WELCOME20</span> and save up to ₹500 on your first project
            </p>
          </div>

          {/* Action Buttons */}
          <div className="welcome-banner-actions">
            {!user ? (
              <>
                <button
                  onClick={handleGetStarted}
                  className="btn-primary"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Get Started
                </button>
                <button
                  onClick={handleBrowseProjects}
                  className="btn-secondary"
                >
                  Browse Projects
                </button>
              </>
            ) : (
              <button
                onClick={handleBrowseProjects}
                className="btn-primary"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Shop Now & Save
              </button>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="welcome-banner-decoration">
          <div className="decoration-circle decoration-1"></div>
          <div className="decoration-circle decoration-2"></div>
          <div className="decoration-circle decoration-3"></div>
        </div>
      </div>

      <style jsx>{`
        .welcome-banner-container {
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%) translateY(-20px);
          z-index: 1000;
          opacity: 0;
          transition: all 0.3s ease-out;
          pointer-events: none;
        }

        .welcome-banner-container.animate-in {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
          pointer-events: auto;
        }

        .welcome-banner {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          border: 1px solid #374151;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          position: relative;
          overflow: hidden;
          max-width: 600px;
          width: 90vw;
        }

        .welcome-banner-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 8px;
          padding: 8px;
          color: #d1d5db;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 10;
        }

        .welcome-banner-close:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .welcome-banner-content {
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
          z-index: 5;
        }

        .welcome-banner-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .gift-icon-wrapper {
          position: relative;
          padding: 12px;
          background: rgba(251, 191, 36, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(251, 191, 36, 0.2);
        }

        .sparkle-1 {
          position: absolute;
          top: -2px;
          right: -2px;
          animation: sparkle 2s ease-in-out infinite;
        }

        .sparkle-2 {
          position: absolute;
          bottom: -1px;
          left: -1px;
          animation: sparkle 2s ease-in-out infinite 0.5s;
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .welcome-badge {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .welcome-banner-text {
          flex: 1;
          color: white;
        }

        .welcome-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: white;
        }

        .welcome-subtitle {
          font-size: 14px;
          color: #d1d5db;
          margin: 0;
          line-height: 1.4;
        }

        .discount-code {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        .welcome-banner-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .btn-secondary {
          background: transparent;
          color: #d1d5db;
          border: 1px solid #374151;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: #4b5563;
          color: white;
        }

        .welcome-banner-decoration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .decoration-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(251, 191, 36, 0.1);
          animation: float 6s ease-in-out infinite;
        }

        .decoration-1 {
          width: 60px;
          height: 60px;
          top: -30px;
          right: -30px;
          animation-delay: 0s;
        }

        .decoration-2 {
          width: 40px;
          height: 40px;
          bottom: -20px;
          left: -20px;
          animation-delay: 2s;
        }

        .decoration-3 {
          width: 30px;
          height: 30px;
          top: 50%;
          right: 10px;
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }

        /* Mobile Responsive */
        @media (max-width: 640px) {
          .welcome-banner-container {
            top: 70px;
            width: 95vw;
          }

          .welcome-banner {
            padding: 16px 20px;
          }

          .welcome-banner-content {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .welcome-banner-actions {
            flex-direction: row;
            justify-content: center;
          }

          .welcome-title {
            font-size: 18px;
          }

          .welcome-subtitle {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomeBanner;
