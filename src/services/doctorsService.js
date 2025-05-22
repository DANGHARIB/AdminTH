import api from './api';

/**
 * Service pour la gestion des médecins
 */
const doctorsService = {
  /**
   * Récupérer la liste des médecins
   * @param {Object} params - Paramètres de filtre et pagination
   * @returns {Promise} - Promesse avec la liste des médecins
   */
  async getAllDoctors(params = {}) {
    try {
      const response = await api.get('/doctors', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des médecins' };
    }
  },

  /**
   * Récupérer les détails d'un médecin
   * @param {string|number} id - ID du médecin
   * @returns {Promise} - Promesse avec les détails du médecin
   */
  async getDoctorById(id) {
    try {
      const response = await api.get(`/doctors/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du médecin' };
    }
  },

  /**
   * Récupérer les finances d'un médecin
   * @param {string|number} id - ID du médecin
   * @returns {Promise} - Promesse avec les données financières du médecin
   */
  async getDoctorFinances(id) {
    try {
      const response = await api.get(`/doctors/${id}/finances`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des finances du médecin' };
    }
  },

  /**
   * Récupérer les paiements d'un médecin
   * @param {string|number} doctorId - ID du médecin
   * @param {Object} params - Paramètres de filtre (startDate, endDate, status)
   * @returns {Promise} - Promesse avec les paiements du médecin
   */
  async getDoctorPayments(doctorId, params = {}) {
    try {
      const response = await api.get('/payments', {
        params: { doctorId, ...params }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des paiements du médecin' };
    }
  },

  /**
   * Créer un nouveau médecin
   * @param {Object} doctorData - Données du médecin
   * @returns {Promise} - Promesse avec les données du médecin créé
   */
  async createDoctor(doctorData) {
    try {
      const response = await api.post('/doctors', doctorData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création du médecin' };
    }
  },

  /**
   * Mettre à jour un médecin existant
   * @param {string|number} id - ID du médecin
   * @param {Object} doctorData - Données du médecin à mettre à jour
   * @returns {Promise} - Promesse avec les données du médecin mis à jour
   */
  async updateDoctor(id, doctorData) {
    try {
      const response = await api.put(`/doctors/${id}`, doctorData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du médecin' };
    }
  },

  /**
   * Supprimer un médecin
   * @param {string|number} id - ID du médecin
   * @returns {Promise} - Promesse avec le résultat de la suppression
   */
  async deleteDoctor(id) {
    try {
      const response = await api.delete(`/doctors/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression du médecin' };
    }
  }
};

export default doctorsService; 