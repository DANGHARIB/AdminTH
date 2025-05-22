import api from './api';

/**
 * Service pour la gestion des utilisateurs
 */
const usersService = {
  /**
   * Récupérer la liste des utilisateurs
   * @param {Object} params - Paramètres de filtre et pagination
   * @returns {Promise} - Promesse avec la liste des utilisateurs
   */
  async getAllUsers(params = {}) {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des utilisateurs' };
    }
  },

  /**
   * Récupérer les détails d'un utilisateur
   * @param {string|number} id - ID de l'utilisateur
   * @returns {Promise} - Promesse avec les détails de l'utilisateur
   */
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de l\'utilisateur' };
    }
  },

  /**
   * Créer un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise} - Promesse avec les données de l'utilisateur créé
   */
  async createUser(userData) {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création de l\'utilisateur' };
    }
  },

  /**
   * Mettre à jour un utilisateur existant
   * @param {string|number} id - ID de l'utilisateur
   * @param {Object} userData - Données de l'utilisateur à mettre à jour
   * @returns {Promise} - Promesse avec les données de l'utilisateur mis à jour
   */
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de l\'utilisateur' };
    }
  },

  /**
   * Supprimer un utilisateur
   * @param {string|number} id - ID de l'utilisateur
   * @returns {Promise} - Promesse avec le résultat de la suppression
   */
  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression de l\'utilisateur' };
    }
  }
};

export default usersService; 