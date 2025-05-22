import api from './api';

/**
 * Transforme les données de patient depuis l'API vers le format frontend
 * @param {Object} apiPatient - Données patient depuis l'API
 * @param {Object} userData - Données utilisateur associées (optionnel)
 * @returns {Object} Patient formaté pour le frontend
 */
const transformPatientData = (apiPatient, userData = null) => {
  // Calculer l'âge depuis la date de naissance
  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Transformer le genre
  const transformGender = (gender) => {
    if (!gender) return 'Non spécifié';
    return gender.toLowerCase() === 'male' ? 'Masculin' : 
           gender.toLowerCase() === 'female' ? 'Féminin' : 
           'Non spécifié';
  };

  return {
    id: apiPatient._id,
    firstName: apiPatient.first_name || '',
    lastName: apiPatient.last_name || '',
    name: `${apiPatient.first_name || ''} ${apiPatient.last_name || ''}`.trim(),
    age: calculateAge(apiPatient.date_of_birth),
    birthdate: apiPatient.date_of_birth ? new Date(apiPatient.date_of_birth).toLocaleDateString('fr-FR') : null,
    gender: transformGender(apiPatient.gender),
    
    // Données utilisateur si disponibles
    email: userData?.email || `${apiPatient.first_name?.toLowerCase() || 'patient'}.${apiPatient.last_name?.toLowerCase() || 'inconnu'}@example.com`,
    phone: userData?.phone || 'Non renseigné',
    address: userData?.address || 'Adresse non renseignée',
    
    // Statut basé sur has_taken_assessment et autres critères
    status: apiPatient.has_taken_assessment ? 'active' : 'pending',
    
    // Données médicales par défaut (à adapter selon votre modèle)
    bloodType: 'Non renseigné',
    assignedDoctor: null,
    insurance: 'Non renseignée',
    emergencyContact: 'Non renseigné',
    
    // Données calculées
    joinDate: apiPatient.createdAt,
    lastConsultation: null, // À calculer depuis les rendez-vous si disponible
    consultationsCount: 0,  // À calculer depuis les rendez-vous
    totalSpent: 0,          // À calculer depuis les paiements
    
    // Allergies et historique médical par défaut
    allergies: [],
    medicalHistory: [],
    
    // Finances par défaut
    finances: {
      totalSpent: 0,
      pendingPayments: 0,
      lastPayment: null,
      averageConsultationCost: 0,
      consultationsCount: 0,
      totalRefunds: 0,
      preferredPaymentMethod: 'Non spécifiée'
    },
    
    // Transactions vides par défaut
    transactions: [],
    monthlyStats: [],
    
    // Données originales pour référence
    _originalData: apiPatient
  };
};

/**
 * Service pour la gestion des patients
 */
const patientsService = {
  /**
   * Récupérer la liste des patients
   * @param {Object} params - Paramètres de filtre et pagination
   * @returns {Promise} - Promesse avec la liste des patients transformés
   */
  async getAllPatients(params = {}) {
    try {
      const response = await api.get('/patients', { params });
      
      // Transformer chaque patient
      const transformedPatients = response.data.map(patient => transformPatientData(patient));
      
      console.log('Patients transformés:', transformedPatients);
      return transformedPatients;
    } catch (error) {
      console.error('Erreur service patients:', error);
      throw error.response?.data || { message: 'Erreur lors de la récupération des patients' };
    }
  },

  /**
   * Récupérer les détails d'un patient
   * @param {string|number} id - ID du patient
   * @returns {Promise} - Promesse avec les détails du patient transformés
   */
  async getPatientById(id) {
    try {
      const response = await api.get(`/patients/${id}`);
      
      // Essayer de récupérer les données utilisateur associées
      let userData = null;
      if (response.data.user) {
        try {
          const userResponse = await api.get(`/users/${response.data.user}`);
          userData = userResponse.data;
        } catch (userError) {
          console.warn('Impossible de récupérer les données utilisateur:', userError);
        }
      }
      
      const transformedPatient = transformPatientData(response.data, userData);
      
      // Enrichir avec des données additionnelles si nécessaire
      await this.enrichPatientData(transformedPatient);
      
      return transformedPatient;
    } catch (error) {
      console.error('Erreur récupération patient:', error);
      throw error.response?.data || { message: 'Erreur lors de la récupération du patient' };
    }
  },

  /**
   * Enrichir les données d'un patient avec des informations additionnelles
   * @param {Object} patient - Patient à enrichir
   */
  async enrichPatientData(patient) {
    try {
      // Récupérer les rendez-vous du patient pour calculer les statistiques
      const appointments = await this.getPatientAppointments(patient.id);
      patient.consultationsCount = appointments.length;
      patient.lastConsultation = appointments.length > 0 ? 
        appointments.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : null;

      // Récupérer les paiements pour les finances
      const payments = await this.getPatientPayments(patient.id);
      patient.totalSpent = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      patient.finances.totalSpent = patient.totalSpent;
      patient.finances.consultationsCount = patient.consultationsCount;
      
      if (patient.consultationsCount > 0) {
        patient.finances.averageConsultationCost = patient.totalSpent / patient.consultationsCount;
      }

    } catch (error) {
      console.warn('Erreur lors de l\'enrichissement des données:', error);
      // Continue même si l'enrichissement échoue
    }
  },

  /**
   * Récupérer les rendez-vous d'un patient
   * @param {string} patientId - ID du patient
   * @returns {Promise<Array>} Liste des rendez-vous
   */
  async getPatientAppointments(patientId) {
    try {
      const response = await api.get(`/appointments?patientId=${patientId}`);
      return response.data || [];
    } catch (error) {
      console.warn('Erreur récupération rendez-vous patient:', error);
      return [];
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
      // Si l'endpoint n'existe pas, retourner des données par défaut
      console.warn('Endpoint finances non disponible, utilisation des données par défaut');
      return {
        totalSpent: 0,
        pendingPayments: 0,
        lastPayment: null,
        averageConsultationCost: 0,
        consultationsCount: 0,
        totalRefunds: 0,
        preferredPaymentMethod: 'Non spécifiée'
      };
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
      return response.data || [];
    } catch (error) {
      console.warn('Erreur récupération paiements:', error);
      return [];
    }
  },

  /**
   * Créer un nouveau patient
   * @param {Object} patientData - Données du patient
   * @returns {Promise} - Promesse avec les données du patient créé
   */
  async createPatient(patientData) {
    try {
      // Transformer les données du frontend vers le format API
      const apiData = {
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        date_of_birth: patientData.birthdate ? new Date(patientData.birthdate) : null,
        gender: patientData.gender === 'Masculin' ? 'Male' : 
                patientData.gender === 'Féminin' ? 'Female' : patientData.gender,
        has_taken_assessment: false,
        savedDoctors: []
      };

      const response = await api.post('/patients', apiData);
      return transformPatientData(response.data);
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
      // Transformer les données du frontend vers le format API
      const apiData = {
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        date_of_birth: patientData.birthdate ? new Date(patientData.birthdate) : undefined,
        gender: patientData.gender === 'Masculin' ? 'Male' : 
                patientData.gender === 'Féminin' ? 'Female' : patientData.gender
      };

      const response = await api.put(`/patients/${id}`, apiData);
      return transformPatientData(response.data);
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