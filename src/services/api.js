import axios from 'axios';

// Configuration de l'URL de base de l'API
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log('API URL configurée:', baseURL);

// Préfixe pour le stockage local
const STORAGE_PREFIX = import.meta.env.VITE_STORAGE_PREFIX || 'admin_app_';
const TOKEN_KEY = `${STORAGE_PREFIX}token`;

/**
 * Instance axios configurée pour l'API
 */
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Intercepteur pour ajouter le token JWT aux requêtes
 */
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Requête authentifiée: ${config.method} ${config.url}`);
    } else {
      console.log(`Requête non authentifiée: ${config.method} ${config.url}`);
    }
    return config;
  },
  error => {
    console.error('Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

/**
 * Intercepteur pour gérer les erreurs de réponse
 */
api.interceptors.response.use(
  response => response,
  error => {
    console.error('Erreur API:', error.message);
    
    // Afficher plus de détails sur l'erreur pour le débogage
    if (error.response) {
      console.error('Détails de la réponse d\'erreur:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    // Gérer les erreurs 401 (non authentifié)
    if (error.response && error.response.status === 401) {
      console.warn('Erreur 401: Non autorisé - Vérifiez que le format des données d\'authentification est correct');
      
      // Ne pas déconnecter l'utilisateur pendant la tentative de connexion
      if (!window.location.pathname.includes('/login')) {
        // Déconnecter l'utilisateur
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(`${STORAGE_PREFIX}user`);
        
        // Rediriger vers la page de connexion
        console.log('Redirection vers la page de connexion');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 