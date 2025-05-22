import api from './api';

/**
 * Service pour la gestion des patients
 */
const patientsService = {
  /**
   * Récupérer la liste des patients
   * @param {Object} params - Paramètres de filtre et pagination
   * @returns {Promise} - Promesse avec la liste des patients
   */
  async getAllPatients(params = {}) {
    try {
      const response = await api.get('/patients', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des patients' };
    }
  },

  /**
   * Récupérer les détails d'un patient
   * @param {string|number} id - ID du patient
   * @returns {Promise} - Promesse avec les détails du patient
   */
  async getPatientById(id) {
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du patient' };
    }
  },

  /**
   * Récupérer les finances d'un patient
   * @param {string|number} id - ID du patient
   * @returns {Promise} - Promesse avec les données financières du patient
   */
  async getPatientFinances(id) {
    try {
      const response = await api.get(`/patients/${id}/finances`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des finances du patient' };
    }
  },

  /**
   * Récupérer les paiements d'un patient
   * @param {string|number} patientId - ID du patient
   * @param {Object} params - Paramètres de filtre (startDate, endDate, status)
   * @returns {Promise} - Promesse avec les paiements du patient
   */
  async getPatientPayments(patientId, params = {}) {
    try {
      const response = await api.get('/payments', {
        params: { patientId, ...params }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des paiements du patient' };
    }
  },

  /**
   * Créer un nouveau patient
   * @param {Object} patientData - Données du patient
   * @returns {Promise} - Promesse avec les données du patient créé
   */
  async createPatient(patientData) {
    try {
      const response = await api.post('/patients', patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création du patient' };
    }
  },

  /**
   * Mettre à jour un patient existant
   * @param {string|number} id - ID du patient
   * @param {Object} patientData - Données du patient à mettre à jour
   * @returns {Promise} - Promesse avec les données du patient mis à jour
   */
  async updatePatient(id, patientData) {
    try {
      const response = await api.put(`/patients/${id}`, patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du patient' };
    }
  },

  /**
   * Supprimer un patient
   * @param {string|number} id - ID du patient
   * @returns {Promise} - Promesse avec le résultat de la suppression
   */
  async deletePatient(id) {
    try {
      const response = await api.delete(`/patients/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression du patient' };
    }
  }
};

export default patientsService; 