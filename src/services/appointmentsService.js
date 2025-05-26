import api from './api';

/**
 * Transform appointment data from API to frontend format
 * @param {Object} apiAppointment - Appointment data from API
 * @param {Object} doctorData - Associated doctor data (optional)
 * @param {Object} patientData - Associated patient data (optional)
 * @returns {Object} Appointment formatted for frontend
 */
const transformAppointmentData = (apiAppointment, doctorData = null, patientData = null) => {
  // Transform status
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

  // Transform type based on case details or other information
  const getAppointmentType = (caseDetails, duration) => {
    if (!caseDetails) return 'consultation';
    
    const details = caseDetails.toLowerCase();
    if (details.includes('urgent') || details.includes('emergency')) return 'emergency';
    if (details.includes('controle') || details.includes('control') || details.includes('follow-up')) return 'checkup';
    
    // Utilisez la durée pour déterminer le type si besoin
    if (duration && duration > 45) return 'specialized';
    
    return 'consultation';
  };

  // Format patient name
  const formatPatientName = (patient) => {
    if (!patient) return null;
    
    if (typeof patient === 'string') {
      return { name: 'Unknown patient', id: patient };
    }
    
    if (patient.first_name || patient.last_name) {
      return {
        id: patient._id || patient.id,
        name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim(),
        firstName: patient.first_name,
        lastName: patient.last_name
      };
    }
    
    return { name: 'Unknown patient', id: patient._id || patient.id };
  };

  // Format doctor name
  const formatDoctorName = (doctor) => {
    if (!doctor) return null;
    
    if (typeof doctor === 'string') {
      return { name: 'Unknown doctor', id: doctor };
    }
    
    if (doctor.first_name || doctor.last_name || doctor.full_name) {
      return {
        id: doctor._id || doctor.id,
        name: doctor.full_name ? `Dr. ${doctor.full_name}` : `Dr. ${doctor.first_name || ''} ${doctor.last_name || ''}`.trim(),
        firstName: doctor.first_name,
        lastName: doctor.last_name,
        specialty: doctor.specialization?.name || doctor.specialty || 'Specialty not specified'
      };
    }
    
    return { name: 'Unknown doctor', id: doctor._id || doctor.id };
  };

  // Create complete date from slots
  const createAppointmentDate = () => {
    if (apiAppointment.slotDate) {
      return apiAppointment.slotDate;
    }
    // If no specific date, use createdAt as fallback
    return apiAppointment.createdAt || new Date().toISOString();
  };

  return {
    id: apiAppointment._id,
    date: createAppointmentDate(),
    time: apiAppointment.slotStartTime || 'Time not set',
    endTime: apiAppointment.slotEndTime || null,
    duration: apiAppointment.duration || 30,
    
    // Patient and doctor data
    patient: patientData ? formatPatientName(patientData) : formatPatientName(apiAppointment.patient),
    doctor: doctorData ? formatDoctorName(doctorData) : formatDoctorName(apiAppointment.doctor),
    
    // Status and type
    status: transformStatus(apiAppointment.status),
    type: getAppointmentType(apiAppointment.caseDetails, apiAppointment.duration),
    
    // Financial details
    price: apiAppointment.price || 0,
    paymentStatus: apiAppointment.paymentStatus || 'pending',
    
    // Additional information
    caseDetails: apiAppointment.caseDetails || 'Standard consultation',
    sessionLink: apiAppointment.sessionLink || null,
    
    // Technical data
    availability: apiAppointment.availability,
    createdAt: apiAppointment.createdAt,
    updatedAt: apiAppointment.updatedAt,
    
    // Original data for reference
    _originalData: apiAppointment
  };
};

/**
 * Service for appointment management
 */
const appointmentsService = {
  /**
   * Get list of appointments
   * @param {Object} params - Filter and pagination parameters
   * @returns {Promise} - Promise with transformed appointments list
   */
  async getAllAppointments(params = {}) {
    try {
      const response = await api.get('/appointments', { params });
      
      // Transform each appointment
      const transformedAppointments = await Promise.all(
        response.data.map(async (appointment) => {
          // Try to get complete patient and doctor data
          let doctorData = null;
          let patientData = null;
          
          try {
            if (appointment.doctor && typeof appointment.doctor === 'string') {
              const doctorResponse = await api.get(`/doctors/${appointment.doctor}`);
              doctorData = doctorResponse.data;
            }
          } catch (error) {
            console.warn('Unable to fetch doctor data:', error);
          }
          
          try {
            if (appointment.patient && typeof appointment.patient === 'string') {
              const patientResponse = await api.get(`/patients/${appointment.patient}`);
              patientData = patientResponse.data;
            }
          } catch (error) {
            console.warn('Unable to fetch patient data:', error);
          }
          
          return transformAppointmentData(appointment, doctorData, patientData);
        })
      );
      
      console.log('Transformed appointments:', transformedAppointments);
      return transformedAppointments;
    } catch (error) {
      console.error('Appointments service error:', error);
      throw error.response?.data || { message: 'Error fetching appointments' };
    }
  },

  /**
   * Get appointment details
   * @param {string|number} id - Appointment ID
   * @returns {Promise} - Promise with transformed appointment details
   */
  async getAppointmentById(id) {
    try {
      const response = await api.get(`/appointments/${id}`);
      
      // Get complete patient and doctor data
      let doctorData = null;
      let patientData = null;
      
      try {
        if (response.data.doctor && typeof response.data.doctor === 'string') {
          const doctorResponse = await api.get(`/doctors/${response.data.doctor}`);
          doctorData = doctorResponse.data;
        } else if (response.data.doctor && response.data.doctor._id) {
          doctorData = response.data.doctor;
        }
      } catch (error) {
        console.warn('Unable to fetch doctor data:', error);
      }
      
      try {
        if (response.data.patient && typeof response.data.patient === 'string') {
          const patientResponse = await api.get(`/patients/${response.data.patient}`);
          patientData = patientResponse.data;
        } else if (response.data.patient && response.data.patient._id) {
          patientData = response.data.patient;
        }
      } catch (error) {
        console.warn('Unable to fetch patient data:', error);
      }
      
      return transformAppointmentData(response.data, doctorData, patientData);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error.response?.data || { message: 'Error fetching appointment' };
    }
  },

  /**
   * Get appointments for a specific doctor
   * @param {string} doctorId - Doctor ID
   * @param {Object} params - Filter parameters
   * @returns {Promise} - Promise with doctor's appointments
   */
  async getAppointmentsByDoctor(doctorId, params = {}) {
    try {
      const response = await api.get('/appointments', { 
        params: { doctorId, ...params }
      });
      
      const transformedAppointments = response.data.map(appointment => 
        transformAppointmentData(appointment)
      );
      
      return transformedAppointments;
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      throw error.response?.data || { message: 'Error fetching doctor appointments' };
    }
  },

  /**
   * Get appointments for a specific patient
   * @param {string} patientId - Patient ID
   * @param {Object} params - Filter parameters
   * @returns {Promise} - Promise with patient's appointments
   */
  async getAppointmentsByPatient(patientId, params = {}) {
    try {
      const response = await api.get('/appointments', { 
        params: { patientId, ...params }
      });
      
      const transformedAppointments = response.data.map(appointment => 
        transformAppointmentData(appointment)
      );
      
      return transformedAppointments;
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      throw error.response?.data || { message: 'Error fetching patient appointments' };
    }
  },

  /**
   * Create new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise} - Promise with created appointment data
   */
  async createAppointment(appointmentData) {
    try {
      // Transform frontend data to API format
      const apiData = {
        doctor: appointmentData.doctorId || appointmentData.doctor,
        patient: appointmentData.patientId || appointmentData.patient,
        availability: appointmentData.availabilityId || appointmentData.availability,
        slotStartTime: appointmentData.time || appointmentData.slotStartTime,
        slotEndTime: appointmentData.endTime || appointmentData.slotEndTime,
        slotDate: appointmentData.date,
        duration: appointmentData.duration || 30,
        price: appointmentData.price || 0,
        caseDetails: appointmentData.caseDetails || 'Standard consultation',
        status: appointmentData.status || 'confirmed'
      };

      const response = await api.post('/appointments', apiData);
      return transformAppointmentData(response.data);
    } catch (error) {
      throw error.response?.data || { message: 'Error creating appointment' };
    }
  },

  /**
   * Update existing appointment
   * @param {string|number} id - Appointment ID
   * @param {Object} appointmentData - Appointment data to update
   * @returns {Promise} - Promise with updated appointment data
   */
  async updateAppointment(id, appointmentData) {
    try {
      // Transform frontend data to API format
      const apiData = {};
      
      if (appointmentData.time) apiData.slotStartTime = appointmentData.time;
      if (appointmentData.endTime) apiData.slotEndTime = appointmentData.endTime;
      if (appointmentData.date) apiData.slotDate = appointmentData.date;
      if (appointmentData.duration) apiData.duration = appointmentData.duration;
      if (appointmentData.price !== undefined) apiData.price = appointmentData.price;
      if (appointmentData.status) {
        // Map frontend statuses to API if necessary
        const statusMap = {
          'pending': 'reschedule_requested',
          'confirmed': 'confirmed',
          'completed': 'completed',
          'cancelled': 'cancelled'
        };
        apiData.status = statusMap[appointmentData.status] || appointmentData.status;
      }
      if (appointmentData.caseDetails) apiData.caseDetails = appointmentData.caseDetails;
      if (appointmentData.sessionLink) apiData.sessionLink = appointmentData.sessionLink;

      const response = await api.put(`/appointments/${id}`, apiData);
      return transformAppointmentData(response.data);
    } catch (error) {
      throw error.response?.data || { message: 'Error updating appointment' };
    }
  },

  /**
   * Delete appointment
   * @param {string|number} id - Appointment ID
   * @returns {Promise} - Promise with deletion result
   */
  async deleteAppointment(id) {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error deleting appointment' };
    }
  },
  
  /**
   * Get appointment notes
   * @param {string|number} appointmentId - Appointment ID
   * @returns {Promise} - Promise with appointment notes
   */
  async getAppointmentNotes(appointmentId) {
    try {
      const response = await api.get(`/appointment-notes`, { 
        params: { appointmentId } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching appointment notes' };
    }
  },
  
  /**
   * Add note to appointment
   * @param {string|number} appointmentId - Appointment ID
   * @param {string} note - Note content
   * @returns {Promise} - Promise with created note
   */
  async addAppointmentNote(appointmentId, note) {
    try {
      const response = await api.post(`/appointment-notes`, { 
        appointmentId, 
        content: note 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error adding note to appointment' };
    }
  },

  /**
   * Update appointment note
   * @param {string} noteId - Note ID
   * @param {string} content - Updated content
   * @returns {Promise} - Promise with updated note
   */
  async updateAppointmentNote(noteId, content) {
    try {
      const response = await api.put(`/appointment-notes/${noteId}`, { content });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error updating appointment note' };
    }
  },

  /**
   * Delete appointment note
   * @param {string} noteId - Note ID
   * @returns {Promise} - Promise with deletion result
   */
  async deleteAppointmentNote(noteId) {
    try {
      const response = await api.delete(`/appointment-notes/${noteId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error deleting appointment note' };
    }
  },

  /**
   * Change appointment status
   * @param {string|number} id - Appointment ID
   * @param {string} newStatus - New status
   * @returns {Promise} - Promise with updated appointment
   */
  async changeAppointmentStatus(id, newStatus) {
    try {
      // Map frontend statuses to API if necessary
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
      throw error.response?.data || { message: 'Error changing status' };
    }
  }
};

export default appointmentsService;