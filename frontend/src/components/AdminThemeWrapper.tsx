import React, { useEffect } from 'react';

interface AdminThemeWrapperProps {
  children: React.ReactNode;
}

const AdminThemeWrapper: React.FC<AdminThemeWrapperProps> = ({ children }) => {
  useEffect(() => {
    // Force dark black theme for admin pages to match the rest of the site
    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    // Ensure dark theme is applied
    htmlElement.classList.remove('light');
    htmlElement.classList.add('dark');
    bodyElement.classList.remove('bg-gray-50', 'text-gray-900', 'light');
    bodyElement.classList.add('bg-black', 'text-white', 'dark');

    // Cleanup function - maintain dark theme when leaving admin (no change needed)
    return () => {
      // Keep dark theme consistent across the site
      htmlElement.classList.remove('light');
      htmlElement.classList.add('dark');
      bodyElement.classList.remove('bg-gray-50', 'text-gray-900', 'light');
      bodyElement.classList.add('bg-black', 'text-white', 'dark');
    };
  }, []);

  return (
    <div className="admin-theme-wrapper dark">
      {children}
    </div>
  );
};

export default AdminThemeWrapper;
