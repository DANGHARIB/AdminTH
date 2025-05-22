import api from './api';

/**
 * Service pour la gestion des rendez-vous
 */
const appointmentsService = {
  /**
   * Récupérer la liste des rendez-vous
   * @param {Object} params - Paramètres de filtre et pagination
   * @returns {Promise} - Promesse avec la liste des rendez-vous
   */
  async getAllAppointments(params = {}) {
    try {
      const response = await api.get('/appointments', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des rendez-vous' };
    }
  },

  /**
   * Récupérer les détails d'un rendez-vous
   * @param {string|number} id - ID du rendez-vous
   * @returns {Promise} - Promesse avec les détails du rendez-vous
   */
  async getAppointmentById(id) {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du rendez-vous' };
    }
  },

  /**
   * Créer un nouveau rendez-vous
   * @param {Object} appointmentData - Données du rendez-vous
   * @returns {Promise} - Promesse avec les données du rendez-vous créé
   */
  async createAppointment(appointmentData) {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création du rendez-vous' };
    }
  },

  /**
   * Mettre à jour un rendez-vous existant
   * @param {string|number} id - ID du rendez-vous
   * @param {Object} appointmentData - Données du rendez-vous à mettre à jour
   * @returns {Promise} - Promesse avec les données du rendez-vous mis à jour
   */
  async updateAppointment(id, appointmentData) {
    try {
      const response = await api.put(`/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du rendez-vous' };
    }
  },

  /**
   * Supprimer un rendez-vous
   * @param {string|number} id - ID du rendez-vous
   * @returns {Promise} - Promesse avec le résultat de la suppression
   */
  async deleteAppointment(id) {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression du rendez-vous' };
    }
  },
  
  /**
   * Récupérer les notes d'un rendez-vous
   * @param {string|number} appointmentId - ID du rendez-vous
   * @returns {Promise} - Promesse avec les notes du rendez-vous
   */
  async getAppointmentNotes(appointmentId) {
    try {
      const response = await api.get(`/appointment-notes/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des notes du rendez-vous' };
    }
  },
  
  /**
   * Ajouter une note à un rendez-vous
   * @param {string|number} appointmentId - ID du rendez-vous
   * @param {string} note - Contenu de la note
   * @returns {Promise} - Promesse avec la note créée
   */
  async addAppointmentNote(appointmentId, note) {
    try {
      const response = await api.post(`/appointment-notes`, { 
        appointmentId, 
        content: note 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'ajout de la note au rendez-vous' };
    }
  }
};

export default appointmentsService; 