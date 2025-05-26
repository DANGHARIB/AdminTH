import api from './api';

/**
 * Transform availability data from API to frontend format
 */
const transformAvailabilityData = (apiAvailability) => {
  return {
    id: apiAvailability._id,
    doctorId: apiAvailability.doctor || apiAvailability.doctorId,
    date: apiAvailability.date,
    slots: apiAvailability.slots || [],
    createdAt: apiAvailability.createdAt,
    updatedAt: apiAvailability.updatedAt,
    // Original data for reference
    _originalData: apiAvailability
  };
};

/**
 * Service for availability management
 */
const availabilityService = {
  /**
   * Get list of availabilities
   * @param {Object} params - Filter parameters (doctorId, startDate, endDate)
   * @returns {Promise} - Promise with transformed availability list
   */
  async getAllAvailabilities(params = {}) {
    try {
      console.log('🔍 Fetching availabilities...');
      const response = await api.get('/availability', { params });
      
      const transformedAvailabilities = response.data.map(
        availability => transformAvailabilityData(availability)
      );
      
      console.log('✅ Availabilities fetched:', transformedAvailabilities);
      return transformedAvailabilities;
    } catch (error) {
      console.error('❌ Error fetching availabilities:', error);
      throw error.response?.data || { message: 'Error fetching availabilities' };
    }
  },

  /**
   * Get availability details
   * @param {string} id - Availability ID
   * @returns {Promise} - Promise with transformed availability details
   */
  async getAvailabilityById(id) {
    try {
      console.log(`🔍 Fetching availability ${id}...`);
      const response = await api.get(`/availability/${id}`);
      
      const transformedAvailability = transformAvailabilityData(response.data);
      
      console.log('✅ Availability fetched:', transformedAvailability);
      return transformedAvailability;
    } catch (error) {
      console.error(`❌ Error fetching availability ${id}:`, error);
      throw error.response?.data || { message: 'Error fetching availability' };
    }
  },

  /**
   * Get availabilities for a doctor
   * @param {string} doctorId - Doctor ID
   * @param {Object} params - Filter parameters (startDate, endDate)
   * @returns {Promise} - Promise with transformed availability list
   */
  async getDoctorAvailabilities(doctorId, params = {}) {
    try {
      console.log(`🔍 Fetching availabilities for doctor ${doctorId}...`);
      const response = await api.get('/availability', { 
        params: { 
          doctorId,
          ...params
        } 
      });
      
      const transformedAvailabilities = response.data.map(
        availability => transformAvailabilityData(availability)
      );
      
      console.log('✅ Doctor availabilities fetched:', transformedAvailabilities);
      return transformedAvailabilities;
    } catch (error) {
      console.error(`❌ Error fetching doctor availabilities:`, error);
      throw error.response?.data || { message: 'Error fetching doctor availabilities' };
    }
  },

  /**
   * Create new availability
   * @param {Object} availabilityData - Availability data
   * @returns {Promise} - Promise with created availability data
   */
  async createAvailability(availabilityData) {
    try {
      console.log('🆕 Creating availability:', availabilityData);
      
      // Ensure the data is in the correct format
      const apiData = {
        doctor: availabilityData.doctorId || availabilityData.doctor,
        date: availabilityData.date,
        slots: availabilityData.slots || []
      };
      
      const response = await api.post('/availability', apiData);
      
      const transformedAvailability = transformAvailabilityData(response.data);
      
      console.log('✅ Availability created:', transformedAvailability);
      return transformedAvailability;
    } catch (error) {
      console.error('❌ Error creating availability:', error);
      throw error.response?.data || { message: 'Error creating availability' };
    }
  },

  /**
   * Update existing availability
   * @param {string} id - Availability ID
   * @param {Object} availabilityData - Availability data to update
   * @returns {Promise} - Promise with updated availability data
   */
  async updateAvailability(id, availabilityData) {
    try {
      console.log(`🔄 Updating availability ${id}:`, availabilityData);
      const response = await api.put(`/availability/${id}`, availabilityData);
      
      const transformedAvailability = transformAvailabilityData(response.data);
      
      console.log('✅ Availability updated:', transformedAvailability);
      return transformedAvailability;
    } catch (error) {
      console.error(`❌ Error updating availability ${id}:`, error);
      throw error.response?.data || { message: 'Error updating availability' };
    }
  },

  /**
   * Delete availability
   * @param {string} id - Availability ID
   * @returns {Promise} - Promise with deletion result
   */
  async deleteAvailability(id) {
    try {
      console.log(`🗑️ Deleting availability ${id}...`);
      const response = await api.delete(`/availability/${id}`);
      
      console.log('✅ Availability deleted');
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting availability ${id}:`, error);
      throw error.response?.data || { message: 'Error deleting availability' };
    }
  }
};

export default availabilityService; 