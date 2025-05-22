import api from './api';

// Préfixe pour le stockage local (à configurer dans .env)
const STORAGE_PREFIX = import.meta.env.VITE_STORAGE_PREFIX || 'admin_app_';

// Clés de stockage
const TOKEN_KEY = `${STORAGE_PREFIX}token`;
const USER_KEY = `${STORAGE_PREFIX}user`;

/**
 * Service d'authentification pour l'application admin
 */
const authService = {
  /**
   * Création d'un compte administrateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise} - Promesse avec les données utilisateur
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', {
        ...userData,
        role: "Admin" // Assure que le rôle est bien Admin avec majuscule
      });
      
      const { token, user } = response.data;
      
      // Stocker le token et les infos utilisateur
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      throw error.response?.data || { message: 'Erreur lors de l\'inscription' };
    }
  },

  /**
 * Tester la connectivité avec le backend
 */
async testConnection() {
  try {
    console.log('🔍 Test de connectivité backend...');
    const response = await api.get('/health'); // ou tout endpoint de test
    console.log('✅ Backend accessible:', response.status);
    return true;
  } catch (error) {
    console.error('❌ Backend inaccessible:', error.message);
    if (error.code === 'ERR_NETWORK') {
      console.error('💡 Vérifiez que votre backend est démarré et accessible');
    }
    return false;
  }
},

  /**
   * Connexion de l'administrateur
   * @param {string} email - Email de l'administrateur
   * @param {string} password - Mot de passe
   * @returns {Promise} - Promesse avec les données utilisateur
   */
  async login(email, password) {
    try {
      console.log(`Tentative de connexion avec ${email}`);
      // Ne jamais logger le mot de passe en clair pour des raisons de sécurité
      // Créer l'objet de données avec la structure attendue par l'API
      const loginData = { 
        email, 
        password,
        role: 'Admin' // S'assurer que le rôle est explicitement spécifié
      };
      console.log('Données envoyées:', { ...loginData, password: '[PROTÉGÉ]' });
      
      // Envoyer la requête
      const response = await api.post('/auth/login', loginData);
      
      console.log('Réponse de connexion:', response.status, response.statusText);
      console.log('Données de réponse:', response.data);
      
      // Extraire les données
      const { token, ...userData } = response.data;
      
      // Pour la compatibilité avec différents formats de réponse API
      const user = userData.user || userData;
      
      console.log('Utilisateur extrait:', user);
      console.log('Rôle de l\'utilisateur:', user.role);
      
      // Vérifier si l'utilisateur est un administrateur
      if (user.role && user.role !== 'Admin') {
        console.warn(`Rôle non autorisé: ${user.role}`);
        throw { message: 'Accès non autorisé. Seuls les administrateurs peuvent accéder à cette application.' };
      }
      
      // Stocker le token et les infos utilisateur
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      console.log('Authentification réussie');
      return user;
    } catch (error) {
      console.error("Erreur de connexion:", error);
      
      // Afficher autant d'informations que possible pour le débogage
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.status, error.response.data);
        
        // Message d'erreur personnalisé en fonction du code de statut
        if (error.response.status === 401) {
          throw { 
            message: `Échec d'authentification: Email ou mot de passe incorrect. Vérifiez vos identifiants.`,
            details: `Assurez-vous que votre serveur backend attend bien le rôle 'Admin' avec une majuscule.`
          };
        } else if (error.response.status === 500) {
          throw { message: `Erreur serveur: Veuillez contacter l'administrateur système.` };
        }
      }
      
      // Message d'erreur général
      throw { 
        message: error.response?.data?.message || error.message || 'Erreur de connexion: Identifiants incorrects ou serveur indisponible',
        details: error.toString()
      };
    }
  },
  
  /**
   * Déconnexion de l'administrateur
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
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
   * Récupérer le profil de l'utilisateur connecté depuis l'API
   * @returns {Promise} - Promesse avec les données du profil
   */
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du profil' };
    }
  }
};

export default authService;