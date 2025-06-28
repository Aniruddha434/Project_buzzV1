import api from '../api.js';

// User API service functions
export const userService = {
  // Get current user profile
  async getProfile() {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update current user profile
  async updateProfile(profileData) {
    const response = await api.put('/users/me', profileData);
    return response.data;
  },

  // Change user password
  async changePassword(passwordData) {
    const response = await api.put('/users/me/password', passwordData);
    return response.data;
  },

  // Get user's purchased projects
  async getPurchases() {
    const response = await api.get('/users/me/purchases');
    return response.data;
  },

  // Get user's sold projects (for sellers)
  async getSales() {
    const response = await api.get('/users/me/sales');
    return response.data;
  },

  // Get user statistics
  async getStats() {
    const response = await api.get('/users/me/stats');
    return response.data;
  },

  // Fix user's purchase statistics
  async fixStats() {
    const response = await api.post('/users/me/fix-stats');
    return response.data;
  },

  // Get public user profile
  async getPublicProfile(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Admin: Get all users
  async getAllUsers(params = {}) {
    const response = await api.get('/users', { params });
    return response.data;
  }
};

export default userService;
