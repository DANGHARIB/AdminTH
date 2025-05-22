import axios from 'axios';

// Configuration de l'URL de base de l'API
const baseURL = import.meta.env.VITE_API_URL || 'https://api.votredomaine.com/api';
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
    
    // Gérer les erreurs 401 (non authentifié)
    if (error.response && error.response.status === 401) {
      console.warn('Erreur 401: Non autorisé');
      // Déconnecter l'utilisateur
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(`${STORAGE_PREFIX}user`);
      
      // Rediriger vers la page de connexion si ce n'est pas déjà le cas
      if (!window.location.pathname.includes('/login')) {
        console.log('Redirection vers la page de connexion');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 