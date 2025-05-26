import api from './api';

// Local storage prefix (to configure in .env)
const STORAGE_PREFIX = import.meta.env.VITE_STORAGE_PREFIX || 'admin_app_';

// Storage keys
const TOKEN_KEY = `${STORAGE_PREFIX}token`;
const USER_KEY = `${STORAGE_PREFIX}user`;

/**
 * Authentication service for admin application
 */
const authService = {
  /**
   * Create admin account
   * @param {Object} userData - User data
   * @returns {Promise} - Promise with user data
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', {
        ...userData,
        role: "Admin" // Ensure role is Admin with capital letter
      });
      
      const { token, user } = response.data;
      
      // Store token and user info
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error("Registration error:", error);
      throw error.response?.data || { message: 'Error during registration' };
    }
  },

  /**
   * Test backend connectivity
   */
  async testConnection() {
    try {
      console.log('🔍 Testing backend connectivity...');
      const response = await api.get('/health'); // or any test endpoint
      console.log('✅ Backend accessible:', response.status);
      return true;
    } catch (error) {
      console.error('❌ Backend inaccessible:', error.message);
      if (error.code === 'ERR_NETWORK') {
        console.error('💡 Check that your backend is started and accessible');
        console.error(`💡 Make sure the backend accepts CORS from ${window.location.origin}`);
      }
      return false;
    }
  },

  /**
   * Admin login
   * @param {string} email - Admin email
   * @param {string} password - Password
   * @returns {Promise} - Promise with user data
   */
  async login(email, password) {
    try {
      console.log(`Login attempt with ${email}`);
      
      // Create data object with structure expected by API
      const loginData = { 
        email, 
        password,
        role: 'Admin' // Ensure role is explicitly specified with capital letter
      };
      console.log('Data sent:', { ...loginData, password: '[PROTECTED]' });
      
      // Send request
      const response = await api.post('/auth/login', loginData);
      
      console.log('Login response:', response.status, response.statusText);
      
      // Extract data
      const { token, ...userData } = response.data;
      
      // For compatibility with different API response formats
      const user = userData.user || userData;
      
      console.log('User role:', user.role);
      
      // Check if user is an administrator
      if (user.role && user.role !== 'Admin') {
        console.warn(`Unauthorized role: ${user.role}`);
        throw { message: 'Unauthorized access. Only administrators can access this application.' };
      }
      
      // Store token and user info
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      console.log('Authentication successful');
      return user;
    } catch (error) {
      console.error("Login error:", error);
      
      // Show as much information as possible for debugging
      if (error.response) {
        console.error("Error details:", error.response.status, error.response.data);
        
        // Custom error message based on status code
        if (error.response.status === 401) {
          throw { 
            message: `Authentication failed: Incorrect email or password. Please check your credentials.`,
            details: `Make sure your backend server expects the 'Admin' role with a capital letter.`
          };
        } else if (error.response.status === 500) {
          throw { message: `Server error: Please contact the system administrator.` };
        }
      }
      
      // General error message
      throw { 
        message: error.response?.data?.message || error.message || 'Login error: Incorrect credentials or server unavailable',
        details: error.toString()
      };
    }
  },
  
  /**
   * Admin logout
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  
  /**
   * Get currently logged in user
   * @returns {Object|null} - User data or null
   */
  getCurrentUser() {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
  
  /**
   * Check if user is authenticated
   * @returns {boolean} - True if authenticated
   */
  isAuthenticated() {
    return !!this.getToken() && !!this.getCurrentUser();
  },
  
  /**
   * Get authentication token
   * @returns {string|null} - Token or null
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  /**
   * Get logged in user profile from API
   * @returns {Promise} - Promise with profile data
   */
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching profile' };
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update 
   * @returns {Promise} - Promise with updated profile data
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      // Update stored user data
      const updatedUser = response.data;
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      throw error.response?.data || { message: 'Error updating profile' };
    }
  },

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} - Promise with result
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error changing password' };
    }
  }
};

export default authService;