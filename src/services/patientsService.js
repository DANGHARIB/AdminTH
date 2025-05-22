import api from './api';

/**
 * Transform patient data from API to frontend format
 * @param {Object} apiPatient - Patient data from API
 * @param {Object} userData - Associated user data (optional)
 * @returns {Object} Patient formatted for frontend
 */
const transformPatientData = (apiPatient, userData = null) => {
  // Calculate age from birth date
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

  // Transform gender
  const transformGender = (gender) => {
    if (!gender) return 'Not specified';
    return gender.toLowerCase() === 'male' ? 'Male' : 
           gender.toLowerCase() === 'female' ? 'Female' : 
           'Not specified';
  };

  return {
    id: apiPatient._id,
    firstName: apiPatient.first_name || '',
    lastName: apiPatient.last_name || '',
    name: `${apiPatient.first_name || ''} ${apiPatient.last_name || ''}`.trim(),
    age: calculateAge(apiPatient.date_of_birth),
    birthdate: apiPatient.date_of_birth ? new Date(apiPatient.date_of_birth).toLocaleDateString('en-US') : null,
    gender: transformGender(apiPatient.gender),
    
    // User data if available
    email: userData?.email || `${apiPatient.first_name?.toLowerCase() || 'patient'}.${apiPatient.last_name?.toLowerCase() || 'unknown'}@example.com`,
    phone: userData?.phone || 'Not provided',
    address: userData?.address || 'Address not provided',
    
    // Status based on has_taken_assessment and other criteria
    status: apiPatient.has_taken_assessment ? 'active' : 'pending',
    
    // Default medical data (adapt according to your model)
    bloodType: 'Not specified',
    assignedDoctor: null,
    insurance: 'Not specified',
    emergencyContact: 'Not provided',
    
    // Calculated data
    joinDate: apiPatient.createdAt,
    lastConsultation: null, // To calculate from appointments if available
    consultationsCount: 0,  // To calculate from appointments
    totalSpent: 0,          // To calculate from payments
    
    // Default allergies and medical history
    allergies: [],
    medicalHistory: [],
    
    // Default finances
    finances: {
      totalSpent: 0,
      pendingPayments: 0,
      lastPayment: null,
      averageConsultationCost: 0,
      consultationsCount: 0,
      totalRefunds: 0,
      preferredPaymentMethod: 'Not specified'
    },
    
    // Empty transactions by default
    transactions: [],
    monthlyStats: [],
    
    // Original data for reference
    _originalData: apiPatient
  };
};

/**
 * Service for patient management
 */
const patientsService = {
  /**
   * Get list of patients
   * @param {Object} params - Filter and pagination parameters
   * @returns {Promise} - Promise with transformed patients list
   */
  async getAllPatients(params = {}) {
    try {
      const response = await api.get('/patients', { params });
      
      // Transform each patient
      const transformedPatients = response.data.map(patient => transformPatientData(patient));
      
      console.log('Transformed patients:', transformedPatients);
      return transformedPatients;
    } catch (error) {
      console.error('Patients service error:', error);
      throw error.response?.data || { message: 'Error fetching patients' };
    }
  },

  /**
   * Get patient details
   * @param {string|number} id - Patient ID
   * @returns {Promise} - Promise with transformed patient details
   */
  async getPatientById(id) {
    try {
      const response = await api.get(`/patients/${id}`);
      
      // Try to get associated user data
      let userData = null;
      if (response.data.user) {
        try {
          const userResponse = await api.get(`/users/${response.data.user}`);
          userData = userResponse.data;
        } catch (userError) {
          console.warn('Unable to fetch user data:', userError);
        }
      }
      
      const transformedPatient = transformPatientData(response.data, userData);
      
      // Enrich with additional data if necessary
      await this.enrichPatientData(transformedPatient);
      
      return transformedPatient;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error.response?.data || { message: 'Error fetching patient' };
    }
  },

  /**
   * Enrich patient data with additional information
   * @param {Object} patient - Patient to enrich
   */
  async enrichPatientData(patient) {
    try {
      // Get patient appointments to calculate statistics
      const appointments = await this.getPatientAppointments(patient.id);
      patient.consultationsCount = appointments.length;
      patient.lastConsultation = appointments.length > 0 ? 
        appointments.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : null;

      // Get payments for finances
      const payments = await this.getPatientPayments(patient.id);
      patient.totalSpent = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      patient.finances.totalSpent = patient.totalSpent;
      patient.finances.consultationsCount = patient.consultationsCount;
      
      if (patient.consultationsCount > 0) {
        patient.finances.averageConsultationCost = patient.totalSpent / patient.consultationsCount;
      }

    } catch (error) {
      console.warn('Error enriching data:', error);
      // Continue even if enrichment fails
    }
  },

  /**
   * Get patient appointments
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} List of appointments
   */
  async getPatientAppointments(patientId) {
    try {
      const response = await api.get(`/appointments?patientId=${patientId}`);
      return response.data || [];
    } catch (error) {
      console.warn('Error fetching patient appointments:', error);
      return [];
    }
  },

  /**
   * Get patient finances
   * @param {string|number} id - Patient ID
   * @returns {Promise} - Promise with patient financial data
   */
  async getPatientFinances(id) {
    try {
      const response = await api.get(`/patients/${id}/finances`);
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist, return default data
      console.warn('Finances endpoint not available, using default data');
      return {
        totalSpent: 0,
        pendingPayments: 0,
        lastPayment: null,
        averageConsultationCost: 0,
        consultationsCount: 0,
        totalRefunds: 0,
        preferredPaymentMethod: 'Not specified'
      };
    }
  },

  /**
   * Get patient payments
   * @param {string|number} patientId - Patient ID
   * @param {Object} params - Filter parameters (startDate, endDate, status)
   * @returns {Promise} - Promise with patient payments
   */
  async getPatientPayments(patientId, params = {}) {
    try {
      const response = await api.get('/payments', {
        params: { patientId, ...params }
      });
      return response.data || [];
    } catch (error) {
      console.warn('Error fetching payments:', error);
      return [];
    }
  },

  /**
   * Create new patient
   * @param {Object} patientData - Patient data
   * @returns {Promise} - Promise with created patient data
   */
  async createPatient(patientData) {
    try {
      // Transform frontend data to API format
      const apiData = {
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        date_of_birth: patientData.birthdate ? new Date(patientData.birthdate) : null,
        gender: patientData.gender === 'Male' ? 'Male' : 
                patientData.gender === 'Female' ? 'Female' : patientData.gender,
        has_taken_assessment: false,
        savedDoctors: []
      };

      const response = await api.post('/patients', apiData);
      return transformPatientData(response.data);
    } catch (error) {
      throw error.response?.data || { message: 'Error creating patient' };
    }
  },

  /**
   * Update existing patient
   * @param {string|number} id - Patient ID
   * @param {Object} patientData - Patient data to update
   * @returns {Promise} - Promise with updated patient data
   */
  async updatePatient(id, patientData) {
    try {
      // Transform frontend data to API format
      const apiData = {
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        date_of_birth: patientData.birthdate ? new Date(patientData.birthdate) : undefined,
        gender: patientData.gender === 'Male' ? 'Male' : 
                patientData.gender === 'Female' ? 'Female' : patientData.gender
      };

      const response = await api.put(`/patients/${id}`, apiData);
      return transformPatientData(response.data);
    } catch (error) {
      throw error.response?.data || { message: 'Error updating patient' };
    }
  },

  /**
   * Delete patient
   * @param {string|number} id - Patient ID
   * @returns {Promise} - Promise with deletion result
   */
  async deletePatient(id) {
    try {
      const response = await api.delete(`/patients/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error deleting patient' };
    }
  }
};

export default patientsService;