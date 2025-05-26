import { createContext, useState } from 'react';
import authService from '../services/authService';

// Create context
const AuthContext = createContext(null);

// Context provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // On commence sans chargement
  const [error, setError] = useState(null);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await authService.login(email, password);
      
      // Check if user is an administrator
      if (userData.role !== 'Admin') {
        throw new Error('Unauthorized access. Only administrators can access this application.');
      }
      
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Login error in AuthContext:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;