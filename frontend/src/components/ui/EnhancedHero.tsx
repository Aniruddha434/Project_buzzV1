import React, { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Users, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Lazy load the Squares component for better performance
const Squares = lazy(() => import('./Squares').then(module => ({ default: module.Squares })));

const EnhancedHero: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0" aria-hidden="true">
        <Suspense fallback={<div className="w-full h-full bg-black"></div>}>
          <Squares
            direction="diagonal"
            speed={0.2}
            borderColor="#333"
            squareSize={80}
            hoverFillColor="#1a1a1a"
            className="w-full h-full opacity-30"
          />
        </Suspense>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
                Project<span className="text-white">Buzz</span>
              </h1>

              {/* Enhanced Tagline */}
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-6 font-light leading-tight">
                Where Digital Projects Come to Life
              </h2>

              {/* Value Proposition */}
              <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                The premier digital marketplace for buying and selling any digital data -
                from source code and projects to digital assets and innovative solutions.
              </p>

              {/* Key Benefits */}
              <div className="flex flex-col sm:flex-row gap-6 mb-10 justify-center lg:justify-start">
                <div className="flex items-center text-gray-300">
                  <Code className="h-5 w-5 mr-2 text-white" />
                  <span className="text-sm">Quality Digital Data</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Users className="h-5 w-5 mr-2 text-white" />
                  <span className="text-sm">Verified Sellers</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Zap className="h-5 w-5 mr-2 text-white" />
                  <span className="text-sm">Instant Access</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {user ? (
                  <Link
                    to="/market"
                    className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-xl"
                  >
                    Browse Projects
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-xl"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                )}
                
                <Link
                  to="/seller-registration"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-all duration-200"
                >
                  Start Selling
                </Link>
              </div>

              {/* Trust Message */}
              <div className="mt-12 pt-8 border-t border-gray-800">
                <p className="text-sm text-gray-500 text-center lg:text-left">
                  Your trusted marketplace for digital assets and solutions
                </p>
              </div>
            </div>

            {/* Right Column - Hero Visual */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Hero Visual Container */}
                <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-gray-800 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  {/* Code Editor Mockup */}
                  <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                    {/* Editor Header */}
                    <div className="flex items-center px-4 py-3 bg-gray-800 border-b border-gray-700">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-100"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-200"></div>
                      </div>
                      <div className="ml-4 text-sm text-gray-400 font-mono">ProjectBuzz.js</div>
                    </div>

                    {/* Code Content with Typing Animation */}
                    <div className="p-4 font-mono text-sm leading-relaxed">
                      <div className="text-gray-500 mb-1">// Where Digital Projects Come to Life</div>
                      <div className="text-blue-400">const <span className="text-white">projectBuzz</span> = {'{'}</div>
                      <div className="ml-4 text-green-400">tagline: <span className="text-yellow-300">'Where Digital Projects Come to Life'</span>,</div>
                      <div className="ml-4 text-green-400">mission: <span className="text-yellow-300">'Digital Marketplace for All'</span>,</div>
                      <div className="ml-4 text-green-400">products: [</div>
                      <div className="ml-8 text-yellow-300">'Source Code',</div>
                      <div className="ml-8 text-yellow-300">'Digital Assets',</div>
                      <div className="ml-8 text-yellow-300">'Software Solutions',</div>
                      <div className="ml-8 text-yellow-300">'Any Digital Data'</div>
                      <div className="ml-4 text-green-400">],</div>
                      <div className="ml-4 text-green-400">status: <span className="text-yellow-300">'🚀 Live & Growing'</span></div>
                      <div className="text-blue-400">{'};'}</div>
                      <div className="mt-2 text-gray-500">// Your digital marketplace awaits!</div>
                    </div>
                  </div>

                  {/* Floating Status Badges */}
                  <div className="absolute -top-3 -right-3 bg-white text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                    ✨ Live
                  </div>
                  <div className="absolute -bottom-3 -left-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold border border-green-500 animate-pulse">
                    💾 Digital Assets
                  </div>
                </div>

                {/* Background Glow Effect */}
                <div className="absolute -inset-6 bg-gradient-to-r from-white/10 via-transparent to-white/5 rounded-3xl blur-2xl opacity-50"></div>
              </div>

              {/* Mobile Hero Visual - Simplified */}
              <div className="lg:hidden mt-12 text-center">
                <div className="inline-block bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
                  <div className="text-4xl mb-2">💾</div>
                  <div className="text-white font-semibold">Digital Assets</div>
                  <div className="text-gray-400 text-sm">Quality • Verified • Instant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-600 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export { EnhancedHero };
