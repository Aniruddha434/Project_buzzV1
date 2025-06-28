import React, { Suspense, lazy } from 'react'; // Import Suspense and lazy
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Lazy load page components
const LandingPage = lazy(() => import('./pages/LandingPage.tsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.tsx'));
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
const CardsStackTest = lazy(() => import('./pages/CardsStackTest.tsx'));
const BuyerDashboardNew = lazy(() => import('./pages/BuyerDashboardNew.tsx'));
const UIShowcase = lazy(() => import('./pages/UIShowcase.tsx'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess.tsx'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage.tsx'));
const ModernDashboard = lazy(() => import('./pages/ModernDashboard.tsx'));
const About = lazy(() => import('./pages/About.tsx'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions.tsx'));
const SellerRegistration = lazy(() => import('./pages/SellerRegistration.tsx'));
const AdminManagement = lazy(() => import('./pages/AdminManagement.tsx'));
const TestPins = lazy(() => import('./pages/TestPins.tsx'));
const Negotiations = lazy(() => import('./pages/Negotiations.tsx'));

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
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/ui-showcase" element={<UIShowcase />} />
            <Route path="/test-pins" element={<TestPins />} />
            <Route path="/negotiations" element={<Negotiations />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/modern-dashboard" element={<ModernDashboard />} />
            <Route path="/cards-stack-test" element={<CardsStackTest />} />

            {/* Original Routes */}
            <Route path="/old-home" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/seller-registration" element={<SellerRegistration />} />
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