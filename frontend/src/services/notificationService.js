import api from '../api.js';

const notificationService = {
  // Get user notifications
  async getNotifications(options = {}) {
    try {
      const {
        status,
        category,
        limit = 20,
        skip = 0,
        sort = '-createdAt'
      } = options;

      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (category) params.append('category', category);
      params.append('limit', limit.toString());
      params.append('skip', skip.toString());
      params.append('sort', sort);

      const response = await api.get(`/notifications?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get unread notification count
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  async markAllAsRead(category = null) {
    try {
      const body = category ? { category } : {};
      const response = await api.put('/notifications/mark-all-read', body);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Send test notification (admin only)
  async sendTestNotification(data) {
    try {
      const response = await api.post('/notifications/test', data);
      return response.data;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  },

  // Get notification statistics (admin only)
  async getNotificationStats() {
    try {
      const response = await api.get('/notifications/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  },

  // Helper function to format notification time
  formatNotificationTime(timestamp) {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  },

  // Get notification icon based on type
  getNotificationIcon(type) {
    const icons = {
      'PURCHASE_CONFIRMATION': '🛒',
      'PAYMENT_SUCCESS': '✅',
      'PAYMENT_FAILED': '❌',
      'SALE_NOTIFICATION': '💰',
      'NEW_USER_REGISTRATION': '👤',
      'ADMIN_ALERT': '🚨',
      'SYSTEM_NOTIFICATION': '🔔',
      'PROJECT_UPDATE': '📝',
      'ACCOUNT_UPDATE': '⚙️'
    };
    return icons[type] || '🔔';
  },

  // Get notification color based on priority
  getNotificationColor(priority) {
    const colors = {
      'low': 'text-gray-600',
      'medium': 'text-blue-600',
      'high': 'text-orange-600',
      'urgent': 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  },

  // Get notification background color based on status
  getNotificationBgColor(status) {
    const colors = {
      'unread': 'bg-blue-50 border-blue-200',
      'read': 'bg-gray-50 border-gray-200',
      'archived': 'bg-gray-100 border-gray-300'
    };
    return colors[status] || 'bg-gray-50 border-gray-200';
  }
};

export default notificationService;
