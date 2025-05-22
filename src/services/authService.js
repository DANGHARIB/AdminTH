import axios from 'axios';

// URL de base de l'API (à configurer dans .env)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Stockage du token dans le localStorage
const TOKEN_KEY = 'admin_auth_token';
const USER_KEY = 'admin_user';

/**
 * Service d'authentification pour l'application admin
 */
const authService = {
  /**
   * Connexion de l'administrateur
   * @param {string} email - Email de l'administrateur
   * @param {string} password - Mot de passe
   * @returns {Promise} - Promesse avec les données utilisateur
   */
  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/admin/login`, {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Stocker le token et les infos utilisateur
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      // Configurer axios pour les futures requêtes
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return user;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur de connexion' };
    }
  },
  
  /**
   * Déconnexion de l'administrateur
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete axios.defaults.headers.common['Authorization'];
  },
  
  /**
   * Récupérer l'utilisateur actuellement connecté
   * @returns {Object|null} - Données utilisateur ou null
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
   * Vérifier si l'utilisateur est authentifié
   * @returns {boolean} - True si authentifié
   */
  isAuthenticated() {
    return !!this.getToken() && !!this.getCurrentUser();
  },
  
  /**
   * Récupérer le token d'authentification
   * @returns {string|null} - Token ou null
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  /**
   * Initialiser les en-têtes d'authentification
   */
  initAuthHeaders() {
    const token = this.getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
};

// Initialiser les en-têtes au chargement du service
authService.initAuthHeaders();

export default authService;