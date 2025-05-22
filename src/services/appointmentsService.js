import api from './api';

/**
 * Transforme les données de rendez-vous depuis l'API vers le format frontend
 * @param {Object} apiAppointment - Données rendez-vous depuis l'API
 * @param {Object} doctorData - Données médecin associées (optionnel)
 * @param {Object} patientData - Données patient associées (optionnel)
 * @returns {Object} Rendez-vous formaté pour le frontend
 */
const transformAppointmentData = (apiAppointment, doctorData = null, patientData = null) => {
  // Transformer le statut
  const transformStatus = (status) => {
    const statusMap = {
      'reschedule_requested': 'pending',
      'cancelled': 'cancelled',
      'confirmed': 'confirmed',
      'completed': 'completed',
      'scheduled': 'confirmed'
    };
    return statusMap[status] || status || 'pending';
  };

  // Transformer le type basé sur les détails du cas ou autres informations
  const getAppointmentType = (caseDetails, duration) => {
    if (!caseDetails) return 'consultation';
    
    const details = caseDetails.toLowerCase();
    if (details.includes('urgent') || details.includes('emergency')) return 'urgence';
    if (details.includes('controle') || details.includes('control') || details.includes('suivi')) return 'controle';
    return 'consultation';
  };

  // Formater le nom du patient
  const formatPatientName = (patient) => {
    if (!patient) return null;
    
    if (typeof patient === 'string') {
      return { name: 'Patient inconnu', id: patient };
    }
    
    if (patient.first_name || patient.last_name) {
      return {
        id: patient._id || patient.id,
        name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim(),
        firstName: patient.first_name,
        lastName: patient.last_name
      };
    }
    
    return { name: 'Patient inconnu', id: patient._id || patient.id };
  };

  // Formater le nom du médecin
  const formatDoctorName = (doctor) => {
    if (!doctor) return null;
    
    if (typeof doctor === 'string') {
      return { name: 'Médecin inconnu', id: doctor };
    }
    
    if (doctor.first_name || doctor.last_name) {
      return {
        id: doctor._id || doctor.id,
        name: `Dr. ${doctor.first_name || ''} ${doctor.last_name || ''}`.trim(),
        firstName: doctor.first_name,
        lastName: doctor.last_name,
        specialty: doctor.specialty || 'Spécialité non renseignée'
      };
    }
    
    return { name: 'Médecin inconnu', id: doctor._id || doctor.id };
  };

  // Créer une date complète à partir des créneaux
  const createAppointmentDate = () => {
    if (apiAppointment.slotDate) {
      return apiAppointment.slotDate;
    }
    // Si pas de date spécifique, utiliser createdAt comme fallback
    return apiAppointment.createdAt || new Date().toISOString();
  };

  return {
    id: apiAppointment._id,
    date: createAppointmentDate(),
    time: apiAppointment.slotStartTime || 'Heure non définie',
    endTime: apiAppointment.slotEndTime || null,
    duration: apiAppointment.duration || 30,
    
    // Données patient et médecin
    patient: patientData ? formatPatientName(patientData) : formatPatientName(apiAppointment.patient),
    doctor: doctorData ? formatDoctorName(doctorData) : formatDoctorName(apiAppointment.doctor),
    
    // Statut et type
    status: transformStatus(apiAppointment.status),
    type: getAppointmentType(apiAppointment.caseDetails, apiAppointment.duration),
    
    // Détails financiers
    price: apiAppointment.price || 0,
    paymentStatus: apiAppointment.paymentStatus || 'pending',
    
    // Informations supplémentaires
    caseDetails: apiAppointment.caseDetails || 'Consultation standard',
    sessionLink: apiAppointment.sessionLink || null,
    
    // Données techniques
    availability: apiAppointment.availability,
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
      
      // Transformer chaque rendez-vous
      const transformedAppointments = await Promise.all(
        response.data.map(async (appointment) => {
          // Essayer de récupérer les données complètes du patient et du médecin
          let doctorData = null;
          let patientData = null;
          
          try {
            if (appointment.doctor && typeof appointment.doctor === 'string') {
              const doctorResponse = await api.get(`/doctors/${appointment.doctor}`);
              doctorData = doctorResponse.data;
            }
          } catch (error) {
            console.warn('Impossible de récupérer les données du médecin:', error);
          }
          
          try {
            if (appointment.patient && typeof appointment.patient === 'string') {
              const patientResponse = await api.get(`/patients/${appointment.patient}`);
              patientData = patientResponse.data;
            }
          } catch (error) {
            console.warn('Impossible de récupérer les données du patient:', error);
          }
          
          return transformAppointmentData(appointment, doctorData, patientData);
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
      
      // Récupérer les données complètes du patient et du médecin
      let doctorData = null;
      let patientData = null;
      
      try {
        if (response.data.doctor) {
          const doctorResponse = await api.get(`/doctors/${response.data.doctor}`);
          doctorData = doctorResponse.data;
        }
      } catch (error) {
        console.warn('Impossible de récupérer les données du médecin:', error);
      }
      
      try {
        if (response.data.patient) {
          const patientResponse = await api.get(`/patients/${response.data.patient}`);
          patientData = patientResponse.data;
        }
      } catch (error) {
        console.warn('Impossible de récupérer les données du patient:', error);
      }
      
      return transformAppointmentData(response.data, doctorData, patientData);
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
        doctor: appointmentData.doctorId,
        patient: appointmentData.patientId,
        availability: appointmentData.availabilityId,
        slotStartTime: appointmentData.time,
        slotEndTime: appointmentData.endTime,
        duration: appointmentData.duration || 30,
        price: appointmentData.price || 0,
        caseDetails: appointmentData.caseDetails || 'Consultation standard',
        status: 'confirmed'
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
      
      if (appointmentData.time) apiData.slotStartTime = appointmentData.time;
      if (appointmentData.endTime) apiData.slotEndTime = appointmentData.endTime;
      if (appointmentData.duration) apiData.duration = appointmentData.duration;
      if (appointmentData.price !== undefined) apiData.price = appointmentData.price;
      if (appointmentData.status) apiData.status = appointmentData.status;
      if (appointmentData.caseDetails) apiData.caseDetails = appointmentData.caseDetails;

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
  },

  /**
   * Changer le statut d'un rendez-vous
   * @param {string|number} id - ID du rendez-vous
   * @param {string} newStatus - Nouveau statut
   * @returns {Promise} - Promesse avec le rendez-vous mis à jour
   */
  async changeAppointmentStatus(id, newStatus) {
    try {
      // Mapper les statuts frontend vers API si nécessaire
      const statusMap = {
        'pending': 'reschedule_requested',
        'confirmed': 'confirmed',
        'completed': 'completed',
        'cancelled': 'cancelled'
      };
      
      const apiStatus = statusMap[newStatus] || newStatus;
      
      const response = await api.put(`/appointments/${id}`, { 
        status: apiStatus 
      });
      
      return transformAppointmentData(response.data);
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du changement de statut' };
    }
  }
};

export default appointmentsService;