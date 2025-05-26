import api from './api';

/**
 * Transform notification data from API to frontend format
 */
const transformNotificationData = (apiNotification) => {
  return {
    id: apiNotification._id,
    userId: apiNotification.userId || apiNotification.user,
    message: apiNotification.message || '',
    title: apiNotification.title || '',
    type: apiNotification.type || 'info',
    read: apiNotification.read || false,
    isRead: apiNotification.read || false,
    link: apiNotification.link || null,
    data: apiNotification.data || null,
    createdAt: apiNotification.createdAt,
    // Original data for reference
    _originalData: apiNotification
  };
};

/**
 * Service for notification management
 */
const notificationsService = {
  /**
   * Get list of notifications
   * @param {Object} params - Filter parameters (userId, read)
   * @returns {Promise} - Promise with transformed notification list
   */
  async getAllNotifications(params = {}) {
    try {
      console.log('🔔 Fetching notifications...');
      const response = await api.get('/notifications', { params });
      
      const transformedNotifications = response.data.map(
        notification => transformNotificationData(notification)
      );
      
      console.log('✅ Notifications fetched:', transformedNotifications.length);
      return transformedNotifications;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      throw error.response?.data || { message: 'Error fetching notifications' };
    }
  },

  /**
   * Get user's notifications
   * @param {string} userId - User ID
   * @param {boolean} onlyUnread - Only fetch unread notifications
   * @returns {Promise} - Promise with transformed notification list
   */
  async getUserNotifications(userId, onlyUnread = false) {
    try {
      console.log(`🔔 Fetching notifications for user ${userId}...`);
      
      const params = { 
        userId,
        read: onlyUnread ? false : undefined
      };
      
      const response = await api.get('/notifications', { params });
      
      const transformedNotifications = response.data.map(
        notification => transformNotificationData(notification)
      );
      
      console.log('✅ User notifications fetched:', transformedNotifications.length);
      return transformedNotifications;
    } catch (error) {
      console.error(`❌ Error fetching user notifications:`, error);
      throw error.response?.data || { message: 'Error fetching user notifications' };
    }
  },

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @returns {Promise} - Promise with updated notification
   */
  async markAsRead(id) {
    try {
      console.log(`📖 Marking notification ${id} as read...`);
      const response = await api.put(`/notifications/${id}/read`);
      
      const transformedNotification = transformNotificationData(response.data);
      
      console.log('✅ Notification marked as read:', transformedNotification);
      return transformedNotification;
    } catch (error) {
      console.error(`❌ Error marking notification as read:`, error);
      throw error.response?.data || { message: 'Error marking notification as read' };
    }
  },

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with result
   */
  async markAllAsRead(userId) {
    try {
      console.log(`📖 Marking all notifications as read for user ${userId}...`);
      const response = await api.put(`/notifications/read-all`, { userId });
      
      console.log('✅ All notifications marked as read');
      return response.data;
    } catch (error) {
      console.error(`❌ Error marking all notifications as read:`, error);
      throw error.response?.data || { message: 'Error marking all notifications as read' };
    }
  },

  /**
   * Delete a notification
   * @param {string} id - Notification ID
   * @returns {Promise} - Promise with deletion result
   */
  async deleteNotification(id) {
    try {
      console.log(`🗑️ Deleting notification ${id}...`);
      const response = await api.delete(`/notifications/${id}`);
      
      console.log('✅ Notification deleted');
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting notification:`, error);
      throw error.response?.data || { message: 'Error deleting notification' };
    }
  }
};

export default notificationsService; 