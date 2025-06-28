import api from '../api.js';

// Admin API service functions
export const adminService = {
  // Get platform statistics
  async getPlatformStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Get all users with admin privileges
  async getAllUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Get all projects with admin privileges
  async getAllProjects(params = {}) {
    const response = await api.get('/admin/projects', { params });
    return response.data;
  },

  // Update user role
  async updateUserRole(userId, role) {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // Update project status
  async updateProjectStatus(projectId, status) {
    const response = await api.put(`/admin/projects/${projectId}/status`, { status });
    return response.data;
  },

  // Delete user (admin only)
  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Delete project (admin only)
  async deleteProject(projectId) {
    const response = await api.delete(`/admin/projects/${projectId}`);
    return response.data;
  },

  // Get system logs
  async getSystemLogs(params = {}) {
    const response = await api.get('/admin/logs', { params });
    return response.data;
  },

  // Get analytics data
  async getAnalytics(timeframe = '30d') {
    const response = await api.get('/admin/analytics', { 
      params: { timeframe } 
    });
    return response.data;
  },

  // Suspend/unsuspend user
  async suspendUser(userId, suspended = true) {
    const response = await api.put(`/admin/users/${userId}/suspend`, { suspended });
    return response.data;
  },

  // Feature/unfeature project
  async featureProject(projectId, featured = true) {
    const response = await api.put(`/admin/projects/${projectId}/feature`, { featured });
    return response.data;
  },

  // Bulk operations
  async bulkUpdateProjects(projectIds, updates) {
    const response = await api.put('/admin/projects/bulk', { 
      projectIds, 
      updates 
    });
    return response.data;
  },

  async bulkUpdateUsers(userIds, updates) {
    const response = await api.put('/admin/users/bulk', { 
      userIds, 
      updates 
    });
    return response.data;
  },

  // Export data
  async exportUsers(format = 'csv') {
    const response = await api.get('/admin/export/users', {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  async exportProjects(format = 'csv') {
    const response = await api.get('/admin/export/projects', {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Platform settings
  async getPlatformSettings() {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  async updatePlatformSettings(settings) {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  }
};

export default adminService;
