import { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

// Création du contexte
const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// Provider du contexte
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialiser l'état d'authentification au chargement
  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Valeur du contexte
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