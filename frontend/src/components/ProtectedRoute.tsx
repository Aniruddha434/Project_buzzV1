import React from 'react';
import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx'; // Ensure .tsx

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: ReactNode; // For cases where ProtectedRoute might wrap direct children
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a loading spinner or a blank screen while auth state is being determined
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-700">Loading authentication...</p>
      </div>
    );
  }

  if (!user) {
    // User is not logged in, redirect to login page
    // Pass the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role || '')) {
    // User is logged in, but their role is not allowed for this route
    // Redirect to the "Unauthorized" page
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // If children are provided, render them. Otherwise, render the <Outlet /> for nested routes.
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute; 