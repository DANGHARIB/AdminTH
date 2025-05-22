import axios from 'axios';

// API base URL configuration
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log('Configured API URL:', baseURL);

// Local storage prefix
const STORAGE_PREFIX = import.meta.env.VITE_STORAGE_PREFIX || 'admin_app_';
const TOKEN_KEY = `${STORAGE_PREFIX}token`;

/**
 * Configured axios instance for API
 */
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Interceptor to add JWT token to requests
 */
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Authenticated request: ${config.method} ${config.url}`);
    } else {
      console.log(`Unauthenticated request: ${config.method} ${config.url}`);
    }
    return config;
  },
  error => {
    console.error('Error in request interceptor:', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor to handle response errors
 */
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message);
    
    // Show more error details for debugging
    if (error.response) {
      console.error('Error response details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    // Handle 401 errors (unauthorized)
    if (error.response && error.response.status === 401) {
      console.warn('401 Error: Unauthorized - Check that authentication data format is correct');
      
      // Don't logout user during login attempt
      if (!window.location.pathname.includes('/login')) {
        // Logout user
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(`${STORAGE_PREFIX}user`);
        
        // Redirect to login page
        console.log('Redirecting to login page');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;