import api from './api';

/**
 * Transform user data from API to frontend format
 */
const transformUserData = (apiUser) => {
  return {
    id: apiUser._id,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    email: apiUser.email,
    role: apiUser.role,
    isActive: apiUser.isActive,
    fullName: `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim(),
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
    // Original data for reference
    _originalData: apiUser
  };
};

/**
 * Service for user management
 */
const usersService = {
  /**
   * Get list of users
   * @param {Object} params - Filter and pagination parameters
   * @returns {Promise} - Promise with transformed users list
   */
  async getAllUsers(params = {}) {
    try {
      const response = await api.get('/users', { params });
      return response.data.map(user => transformUserData(user));
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching users' };
    }
  },

  /**
   * Get user details
   * @param {string|number} id - User ID
   * @returns {Promise} - Promise with transformed user details
   */
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return transformUserData(response.data);
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching user' };
    }
  },

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise} - Promise with created user data
   */
  async createUser(userData) {
    try {
      // Ensure role is provided with correct format
      const apiData = {
        ...userData,
        role: userData.role || 'User'
      };

      const response = await api.post('/users', apiData);
      return transformUserData(response.data);
    } catch (error) {
      throw error.response?.data || { message: 'Error creating user' };
    }
  },

  /**
   * Update existing user
   * @param {string|number} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise} - Promise with updated user data
   */
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return transformUserData(response.data);
    } catch (error) {
      throw error.response?.data || { message: 'Error updating user' };
    }
  },

  /**
   * Delete user
   * @param {string|number} id - User ID
   * @returns {Promise} - Promise with deletion result
   */
  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error deleting user' };
    }
  }
};

export default usersService; 