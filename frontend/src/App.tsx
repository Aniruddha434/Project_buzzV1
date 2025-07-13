import React, { Suspense, lazy } from 'react'; // Import Suspense and lazy
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Lazy load page components
const LandingPage = lazy(() => import('./pages/LandingPage.tsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.tsx'));
const EnhancedLoginPage = lazy(() => import('./pages/EnhancedLoginPage.tsx'));
const EnhancedSellerRegistration = lazy(() => import('./pages/EnhancedSellerRegistration.tsx'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback.tsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.tsx'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails.tsx'));
const ProjectShare = lazy(() => import('./pages/ProjectShare.tsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.tsx'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage.tsx'));

// Enhanced UI Components (MongoDB-based)
// Temporarily using direct import instead of lazy loading to fix dynamic import issues
import HomePro from './pages/HomePro';
// const HomePro = lazy(() => import('./pages/HomePro.tsx'));
const SellerDashboardPro = lazy(() => import('./pages/SellerDashboardPro.tsx'));
const BuyerDashboardNew = lazy(() => import('./pages/BuyerDashboardNew.tsx'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess.tsx'));
const MarketPage = lazy(() => import('./pages/MarketPage.tsx'));
const ModernDashboard = lazy(() => import('./pages/ModernDashboard.tsx'));
const About = lazy(() => import('./pages/About.tsx'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions.tsx'));
const SellerRegistration = lazy(() => import('./pages/SellerRegistration.tsx'));
const AdminManagement = lazy(() => import('./pages/AdminManagement.tsx'));
const Negotiations = lazy(() => import('./pages/Negotiations.tsx'));
const ConnectionTest = lazy(() => import('./pages/ConnectionTest.jsx'));

import NavbarEnhanced from './components/NavbarEnhanced.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';

import { AuthProvider } from './context/AuthContext.tsx';


// Simple loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <p className="ml-3 text-gray-700">Loading page...</p>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <NavbarEnhanced />
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}> {/* Wrap Routes with Suspense */}
            <Routes>
            {/* Enhanced UI Routes */}
            <Route path="/" element={<HomePro />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/projects" element={<MarketPage />} /> {/* Legacy redirect */}
            <Route path="/about" element={<About />} />
            <Route path="/negotiations" element={<Negotiations />} />
            <Route path="/connection-test" element={<ConnectionTest />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/modern-dashboard" element={<ModernDashboard />} />

            {/* Original Routes */}
            <Route path="/old-home" element={<LandingPage />} />
            <Route path="/login" element={<EnhancedLoginPage />} />
            <Route path="/login-old" element={<LoginPage />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/seller-registration" element={<EnhancedSellerRegistration />} />
            <Route path="/seller-registration-old" element={<SellerRegistration />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

            {/* Public Project Share Route */}
            <Route path="/project/share/:id" element={<ProjectShare />} />

            {/* Protected Routes - MongoDB-based */}
            <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
              <Route path="/dashboard/seller" element={<SellerDashboardPro />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
              <Route path="/dashboard/buyer" element={<BuyerDashboardNew />} />
              <Route path="/dashboard/purchases" element={<BuyerDashboardNew />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/admin-management" element={<AdminManagement />} />
            </Route>

            {/* Project Details page */}
            <Route element={<ProtectedRoute />}>
              <Route path="/project/:id" element={<ProjectDetails />} />
            </Route>



            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

    </Router>
    </AuthProvider>
  );
};

export default App;