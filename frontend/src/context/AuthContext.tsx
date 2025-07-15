import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

interface User {
  _id: string;
  email: string;
  displayName: string;
  role: 'buyer' | 'seller' | 'admin';
  emailVerified: boolean;
  createdAt: string;
  stats: {
    projectsPurchased: number;
    projectsSold: number;
    totalSpent: number;
    totalEarned: number;
  };
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticating: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName: string, role: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  handleAuthSuccess: (userData: User, token: string) => void;
  loginWithGoogle: () => void;
  loginWithGitHub: () => void;
  handleOAuthCallback: (token: string, provider: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Global flag to prevent multiple authentication processes
let globalAuthInProgress = false;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitialized || globalAuthInProgress) {
        console.log('🔄 Auth already initialized or in progress, skipping');
        return;
      }

      globalAuthInProgress = true;
      console.log('🚀 Initializing authentication...');
      setIsInitialized(true);

      const token = localStorage.getItem('token');
      if (token) {
        console.log('🔑 Found existing token, verifying...');
        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch user profile
        await fetchUserProfile();
      } else {
        console.log('❌ No token found, user not authenticated');
        setLoading(false);
      }

      globalAuthInProgress = false;
    };

    initializeAuth();
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log('🔍 Fetching user profile...');
      const response = await api.get('/users/me');

      if (response.data.success) {
        const userData = response.data.data;

        console.log('📋 User data received:', {
          email: userData.email,
          role: userData.role,
          emailVerified: userData.emailVerified
        });

        // Batch state updates to prevent multiple re-renders
        setUser(userData);
        setRole(userData.role);
        setError(null);

        console.log('✅ User profile loaded successfully:', userData.email, 'Role:', userData.role);
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (error: any) {
      console.error('❌ Error fetching user profile:', error.message);

      // If token is invalid, clear it and reset auth state
      if (error.response?.status === 401) {
        console.log('🔑 Token invalid, clearing authentication...');
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setRole(null);
      }

      setError('Failed to load user profile');
    } finally {
      console.log('🏁 Profile fetch completed, setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (isAuthenticating || globalAuthInProgress) {
      console.log('⚠️ Authentication already in progress, skipping login...');
      return false;
    }

    try {
      globalAuthInProgress = true;
      setIsAuthenticating(true);
      setLoading(true);
      setError(null);

      console.log('🔍 Attempting login for:', email);
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success) {
        const { user: userData, token } = response.data.data;

        // Store token
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Batch state updates
        setUser(userData);
        setRole(userData.role);
        setError(null);

        console.log('✅ Login successful:', userData.email, 'Role:', userData.role);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(error.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
      setIsAuthenticating(false);
      globalAuthInProgress = false;
    }
  };

  const register = async (email: string, password: string, displayName: string, role: string): Promise<boolean> => {
    if (isAuthenticating || globalAuthInProgress) {
      console.log('⚠️ Authentication already in progress, skipping registration...');
      return false;
    }

    try {
      globalAuthInProgress = true;
      setIsAuthenticating(true);
      setLoading(true);
      setError(null);

      console.log('🔍 AuthContext registration attempt:');
      console.log('Email:', email);
      console.log('Password length:', password?.length || 0);
      console.log('Display name:', displayName);
      console.log('Role:', role);

      // Client-side validation
      if (!email || !password || !role) {
        throw new Error('All required fields must be provided');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const requestData = {
        email: email.trim(),
        password,
        displayName: displayName.trim(),
        role: role.trim()
      };

      console.log('📤 Sending registration request:', {
        ...requestData,
        password: '***'
      });

      const response = await api.post('/auth/register', requestData);

      if (response.data.success) {
        const { user: userData, token } = response.data.data;

        // Store token
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Batch state updates to prevent multiple re-renders
        setUser(userData);
        setRole(userData.role);
        setError(null);

        console.log('✅ Registration successful:', userData.email, 'Role:', userData.role);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('❌ Registration error details:');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Full error:', error);

      let errorMessage = 'Registration failed';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors?.length > 0) {
        errorMessage = error.response.data.errors[0].msg || error.response.data.errors[0].message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
      setIsAuthenticating(false);
      globalAuthInProgress = false;
    }
  };

  const logout = () => {
    console.log('Logging out...');

    // Clear token
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];

    // Clear user data
    setUser(null);
    setRole(null);
    setError(null);

    console.log('✅ Logout successful');
  };

  const clearError = () => {
    setError(null);
  };

  const handleAuthSuccess = (userData: User, token: string) => {
    // Store token
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Batch state updates to prevent multiple re-renders
    setUser(userData);
    setRole(userData.role);
    setError(null);
    setLoading(false);
    setIsAuthenticating(false);
    globalAuthInProgress = false;

    console.log('✅ Authentication successful:', userData.email, 'Role:', userData.role);
  };

  // OAuth methods
  const loginWithGoogle = () => {
    // Determine backend URL based on environment
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const backendUrl = isDevelopment ? 'http://localhost:5000' : (import.meta.env.VITE_BACKEND_URL || 'https://project-buzzv1-2.onrender.com');

    // Only log in development
    if (isDevelopment && import.meta.env.DEV) {
      console.log('🔍 Google OAuth redirect:', {
        isDevelopment,
        hostname: window.location.hostname,
        backendUrl
      });
    }

    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const loginWithGitHub = () => {
    // GitHub login is temporarily disabled - handled by UI components
    return;

    // TODO: Re-enable when GitHub OAuth is ready
    // const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    // window.location.href = `${backendUrl}/api/auth/github`;
  };

  const handleOAuthCallback = async (token: string, provider: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 Handling ${provider} OAuth callback with token:`, token.substring(0, 20) + '...');

      // Fetch user data using the token
      console.log('🔍 Making API call to /auth/oauth/user');
      const response = await api.get(`/auth/oauth/user?token=${token}`);
      console.log('🔍 API response:', response.data);

      if (response.data.success) {
        const { user: userData, token: authToken } = response.data.data;
        handleAuthSuccess(userData, authToken);
        console.log(`✅ ${provider} OAuth login successful:`, userData.email);
        return true;
      } else {
        console.error('❌ OAuth response not successful:', response.data);
        throw new Error(response.data.message || `${provider} OAuth login failed`);
      }
    } catch (error: any) {
      console.error(`❌ ${provider} OAuth callback error:`, error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      setError(error.response?.data?.message || error.message || `${provider} login failed`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    role,
    loading,
    error,
    isAuthenticating,
    login,
    register,
    logout,
    clearError,
    handleAuthSuccess,
    loginWithGoogle,
    loginWithGitHub,
    handleOAuthCallback
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
