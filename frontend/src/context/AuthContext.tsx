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
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName: string, role: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Fetch user profile
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile...');
      const response = await api.get('/users/me');

      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        setRole(userData.role);
        setError(null);
        console.log('✅ User profile loaded:', userData.email, 'Role:', userData.role);
      }
    } catch (error: any) {
      console.error('❌ Error fetching user profile:', error);

      // If token is invalid, clear it
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      }

      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting login for:', email);
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success) {
        const { user: userData, token } = response.data.data;

        // Store token
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Set user data
        setUser(userData);
        setRole(userData.role);

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
    }
  };

  const register = async (email: string, password: string, displayName: string, role: string): Promise<boolean> => {
    try {
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

        // Set user data
        setUser(userData);
        setRole(userData.role);

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

  const value: AuthContextType = {
    user,
    role,
    loading,
    error,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
