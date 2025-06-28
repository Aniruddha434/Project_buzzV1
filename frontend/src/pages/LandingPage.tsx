import React, { useState, useEffect } from 'react';
import type { FC } from 'react'; // Explicitly import FC for React.FC
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { db } from '../firebaseConfig.ts';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';

// Define a type for the project data
interface Project {
  id: string;
  title: string;
  description: string;
  price: number;
  buyers?: string[];
  status?: 'pending' | 'approved' | 'rejected' | 'sold';
  fileUrl?: string;
  originalFileName?: string;
  // Allow other fields from Firestore document
  [key: string]: any;
}

const LandingPage: FC = () => {
  const { user, role } = useAuth();
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailableProjects = async () => {
      setLoading(true);
      setError(null);

      // Check if Firebase is available
      if (!db) {
        setError('Firebase not configured. Using MongoDB backend instead.');
        setLoading(false);
        return;
      }

      try {
        const projectsCollectionRef = collection(db, 'projects');
        const q = query(projectsCollectionRef, where("status", "==", "approved"));
        const querySnapshot = await getDocs(q);
        const projects: Project[] = querySnapshot.docs.map(doc => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            title: data.title || 'Untitled Project',
            description: data.description || 'No description available.',
            price: typeof data.price === 'number' ? data.price : 0,
            buyers: Array.isArray(data.buyers) ? data.buyers : [],
            status: data.status || 'pending', // Default status if not present
            ...data
          } as Project;
        });
        setAvailableProjects(projects);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError('Failed to fetch projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
            Welcome to ProjectBuzz
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto">
            Your premier marketplace for discovering, buying, and selling innovative projects.
          </p>
          {!user && (
            <div className="space-x-4">
              <Link
                to="/login"
                className="inline-block bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Available Projects Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 text-center">Featured Projects</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : availableProjects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900">No Featured Projects Available</h3>
            <p className="mt-2 text-md text-gray-500">Please check back soon for new and exciting projects!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableProjects.slice(0, 6).map(project => (
              <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                {/* Optional Image Placeholder */}
                {/* <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">Image Coming Soon</div> */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{project.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{project.description}</p>
                  <div className="flex items-center justify-between mb-4 mt-auto">
                    <span className="text-2xl font-bold text-blue-600">${project.price.toFixed(2)}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {project.buyers ? `${project.buyers.length} sold` : 'New'}
                    </span>
                  </div>
                  <div className="mt-auto space-y-3">
                    <Link
                      to={`/project/${project.id}`}
                      className="block w-full text-center px-4 py-2.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 font-semibold transition-colors duration-200"
                    >
                      View Details
                    </Link>
                    <Link
                      to={user ? `/dashboard/buyer?projectId=${project.id}` : "/login"}
                      className="block w-full text-center px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      {user ? 'Go to Purchase' : 'Login to Buy'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {availableProjects.length > 6 && (
          <div className="text-center mt-16">
            <Link
              to="/dashboard/buyer"
              className="inline-block bg-blue-600 text-white px-10 py-3.5 rounded-lg font-semibold text-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              View All Projects
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">Why Choose ProjectBuzz?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Global Marketplace", description: "Access projects from developers worldwide.", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /> },
              { title: "Secure Transactions", description: "Safe and reliable payment processing.", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /> },
              { title: "Fast Delivery", description: "Instant access to purchased projects.", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /> },
              { title: "Dedicated Support", description: "Always here to help you succeed.", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /> }
            ].map(feature => (
              <div key={feature.title} className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-5 shadow-md">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">{feature.icon}</svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight">Ready to Dive In?</h2>
          <p className="text-xl mb-10 text-blue-100 max-w-2xl mx-auto">
            Join ProjectBuzz today and unlock a world of digital assets. Whether you're buying or selling, we've got you covered.
          </p>
          {user ? (
            <Link
              to={role === 'seller' ? "/dashboard/seller" : "/dashboard/buyer"}
              className="inline-block bg-white text-blue-700 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
            >
              Go to Your Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-block bg-white text-blue-700 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
            >
              Sign Up Now & Explore
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300">&copy; {new Date().getFullYear()} ProjectBuzz. All rights reserved.</p>
          <p className="text-sm mt-2">Powered by Firebase & React with TypeScript.</p>
          {/* Add social media links or other footer content here */}
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;