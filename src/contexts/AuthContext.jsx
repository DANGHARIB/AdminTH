import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Création du contexte
const AuthContext = createContext(null);

// Provider du contexte
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialiser l'état d'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Récupérer l'utilisateur depuis le stockage local
        const currentUser = authService.getCurrentUser();
        
        // Vérifier si l'utilisateur est un administrateur
        if (currentUser && currentUser.role !== 'Admin') {
          console.error('Utilisateur connecté n\'est pas un administrateur');
          authService.logout(); // Déconnecter l'utilisateur non-Admin
          setUser(null);
        } else {
          setUser(currentUser);
        }
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
      
      // Vérifier si l'utilisateur est un administrateur
      if (userData.role !== 'Admin') {
        throw new Error('Accès non autorisé. Seuls les administrateurs peuvent accéder à cette application.');
      }
      
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Erreur de connexion dans AuthContext:', err);
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