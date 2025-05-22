import api from './api';

/**
 * Transforme les données de rendez-vous depuis l'API vers le format frontend
 * @param {Object} apiAppointment - Données rendez-vous depuis l'API
 * @param {Object} patientData - Données patient associées (optionnel)
 * @param {Object} doctorData - Données médecin associées (optionnel)
 * @returns {Object} Rendez-vous formaté pour le frontend
 */
const transformAppointmentData = (apiAppointment, patientData = null, doctorData = null) => {
  // Transformer le statut
  const transformStatus = (status) => {
    if (!status) return 'pending';
    switch (status.toLowerCase()) {
      case 'confirmed': return 'confirmed';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      case 'reschedule_requested': return 'pending';
      case 'scheduled': return 'confirmed';
      case 'pending': return 'pending';
      default: return 'pending';
    }
  };

  // Extraire la date et l'heure
  const extractDateTime = (appointment) => {
    let date = null;
    let time = null;
    
    // Essayer différents champs pour la date
    if (appointment.scheduledDateTime) {
      const dateTime = new Date(appointment.scheduledDateTime);
      date = dateTime;
      time = dateTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (appointment.appointmentDate) {
      date = new Date(appointment.appointmentDate);
      time = appointment.appointmentTime || '00:00';
    } else if (appointment.date) {
      date = new Date(appointment.date);
      time = appointment.time || '00:00';
    } else if (appointment.createdAt) {
      // Fallback sur la date de création
      date = new Date(appointment.createdAt);
      time = '00:00';
    }

    return { date, time };
  };

  const { date, time } = extractDateTime(apiAppointment);

  // Informations patient
  const patientInfo = patientData ? {
    id: patientData._id || patientData.id,
    name: `${patientData.first_name || ''} ${patientData.last_name || ''}`.trim() || 'Patient inconnu',
    email: patientData.email,
    phone: patientData.phone
  } : {
    id: apiAppointment.patient || apiAppointment.patientId,
    name: 'Patient inconnu',
    email: null,
    phone: null
  };

  // Informations médecin
  const doctorInfo = doctorData ? {
    id: doctorData._id || doctorData.id,
    name: `Dr. ${doctorData.first_name || ''} ${doctorData.last_name || ''}`.trim() || 'Médecin inconnu',
    specialty: doctorData.specialty || doctorData.specialization || 'Spécialité non spécifiée',
    email: doctorData.email,
    phone: doctorData.phone
  } : {
    id: apiAppointment.doctor || apiAppointment.doctorId,
    name: 'Médecin inconnu',
    specialty: '',
    email: null,
    phone: null
  };

  return {
    id: apiAppointment._id,
    date: date,
    time: time,
    
    // Informations patient et médecin
    patient: patientInfo,
    doctor: doctorInfo,
    
    // Détails du rendez-vous
    status: transformStatus(apiAppointment.status),
    type: apiAppointment.type || apiAppointment.appointmentType || 'consultation',
    duration: apiAppointment.duration || apiAppointment.estimatedDuration || 30,
    reason: apiAppointment.reason || apiAppointment.description || '',
    notes: apiAppointment.notes || '',
    
    // Métadonnées
    createdAt: apiAppointment.createdAt,
    updatedAt: apiAppointment.updatedAt,
    
    // Données originales pour référence
    _originalData: apiAppointment
  };
};

/**
 * Service pour la gestion des rendez-vous
 */
const appointmentsService = {
  /**
   * Récupérer la liste des rendez-vous
   * @param {Object} params - Paramètres de filtre et pagination
   * @returns {Promise} - Promesse avec la liste des rendez-vous transformés
   */
  async getAllAppointments(params = {}) {
    try {
      const response = await api.get('/appointments', { params });
      
      console.log('Rendez-vous bruts reçus:', response.data);
      
      // Transformer chaque rendez-vous et enrichir avec les données patient/médecin
      const transformedAppointments = await Promise.all(
        response.data.map(async (appointment) => {
          let patientData = null;
          let doctorData = null;
          
          // Récupérer les données du patient si disponible
          if (appointment.patient || appointment.patientId) {
            try {
              const patientResponse = await api.get(`/patients/${appointment.patient || appointment.patientId}`);
              patientData = patientResponse.data;
            } catch (error) {
              console.warn('Impossible de récupérer les données du patient:', error);
            }
          }
          
          // Récupérer les données du médecin si disponible
          if (appointment.doctor || appointment.doctorId) {
            try {
              const doctorResponse = await api.get(`/doctors/${appointment.doctor || appointment.doctorId}`);
              doctorData = doctorResponse.data;
            } catch (error) {
              console.warn('Impossible de récupérer les données du médecin:', error);
            }
          }
          
          return transformAppointmentData(appointment, patientData, doctorData);
        })
      );
      
      console.log('Rendez-vous transformés:', transformedAppointments);
      return transformedAppointments;
    } catch (error) {
      console.error('Erreur service appointments:', error);
      throw error.response?.data || { message: 'Erreur lors de la récupération des rendez-vous' };
    }
  },

  /**
   * Récupérer les détails d'un rendez-vous
   * @param {string|number} id - ID du rendez-vous
   * @returns {Promise} - Promesse avec les détails du rendez-vous transformés
   */
  async getAppointmentById(id) {
    try {
      const response = await api.get(`/appointments/${id}`);
      
      let patientData = null;
      let doctorData = null;
      
      // Récupérer les données du patient si disponible
      if (response.data.patient || response.data.patientId) {
        try {
          const patientResponse = await api.get(`/patients/${response.data.patient || response.data.patientId}`);
          patientData = patientResponse.data;
        } catch (error) {
          console.warn('Impossible de récupérer les données du patient:', error);
        }
      }
      
      // Récupérer les données du médecin si disponible
      if (response.data.doctor || response.data.doctorId) {
        try {
          const doctorResponse = await api.get(`/doctors/${response.data.doctor || response.data.doctorId}`);
          doctorData = doctorResponse.data;
        } catch (error) {
          console.warn('Impossible de récupérer les données du médecin:', error);
        }
      }
      
      return transformAppointmentData(response.data, patientData, doctorData);
    } catch (error) {
      console.error('Erreur récupération rendez-vous:', error);
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
      // Transformer les données du frontend vers le format API
      const apiData = {
        patient: appointmentData.patientId,
        doctor: appointmentData.doctorId,
        scheduledDateTime: appointmentData.date && appointmentData.time ? 
          new Date(`${appointmentData.date}T${appointmentData.time}`) : 
          new Date(appointmentData.date),
        type: appointmentData.type || 'consultation',
        duration: appointmentData.duration || 30,
        reason: appointmentData.reason || '',
        status: 'pending'
      };

      const response = await api.post('/appointments', apiData);
      return transformAppointmentData(response.data);
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
      // Transformer les données du frontend vers le format API
      const apiData = {};
      
      if (appointmentData.date && appointmentData.time) {
        apiData.scheduledDateTime = new Date(`${appointmentData.date}T${appointmentData.time}`);
      } else if (appointmentData.date) {
        apiData.scheduledDateTime = new Date(appointmentData.date);
      }
      
      if (appointmentData.status) apiData.status = appointmentData.status;
      if (appointmentData.type) apiData.type = appointmentData.type;
      if (appointmentData.duration) apiData.duration = appointmentData.duration;
      if (appointmentData.reason) apiData.reason = appointmentData.reason;
      if (appointmentData.notes) apiData.notes = appointmentData.notes;

      const response = await api.put(`/appointments/${id}`, apiData);
      return transformAppointmentData(response.data);
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
      const response = await api.get(`/appointment-notes`, { 
        params: { appointmentId } 
      });
      return response.data;
    } catch (error) {
      console.warn('Endpoint notes non disponible:', error);
      return [];
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