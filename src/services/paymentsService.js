import api from './api';

/**
 * Service pour la gestion des paiements
 */
const paymentsService = {
  /**
   * Récupérer la liste des paiements avec filtres
   * @param {Object} params - Paramètres de filtrage (doctorId, patientId, startDate, endDate, status)
   * @returns {Promise} - Promesse avec la liste des paiements
   */
  async getAllPayments(params = {}) {
    try {
      const response = await api.get('/payments', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des paiements' };
    }
  },

  /**
   * Récupérer les détails d'un paiement
   * @param {string|number} id - ID du paiement
   * @returns {Promise} - Promesse avec les détails du paiement
   */
  async getPaymentById(id) {
    try {
      const response = await api.get(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du paiement' };
    }
  },

  /**
   * Créer un nouveau paiement
   * @param {Object} paymentData - Données du paiement
   * @returns {Promise} - Promesse avec les données du paiement créé
   */
  async createPayment(paymentData) {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création du paiement' };
    }
  },

  /**
   * Mettre à jour un paiement existant
   * @param {string|number} id - ID du paiement
   * @param {Object} paymentData - Données du paiement à mettre à jour
   * @returns {Promise} - Promesse avec les données du paiement mis à jour
   */
  async updatePayment(id, paymentData) {
    try {
      const response = await api.put(`/payments/${id}`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du paiement' };
    }
  },

  /**
   * Supprimer un paiement
   * @param {string|number} id - ID du paiement
   * @returns {Promise} - Promesse avec le résultat de la suppression
   */
  async deletePayment(id) {
    try {
      const response = await api.delete(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression du paiement' };
    }
  }
};

export default paymentsService; 