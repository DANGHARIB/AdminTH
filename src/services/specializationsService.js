import api from './api';

/**
 * Transform specialization data from API to frontend format
 */
const transformSpecializationData = (apiSpecialization) => {
  return {
    id: apiSpecialization._id,
    name: apiSpecialization.name,
    description: apiSpecialization.description || '',
    createdAt: apiSpecialization.createdAt,
    updatedAt: apiSpecialization.updatedAt,
    // Original data for reference
    _originalData: apiSpecialization
  };
};

/**
 * Service for specialization management
 */
const specializationsService = {
  /**
   * Get list of specializations
   * @param {Object} params - Filter parameters
   * @returns {Promise} - Promise with transformed specialization list
   */
  async getAllSpecializations(params = {}) {
    try {
      console.log('🔍 Fetching specializations...');
      const response = await api.get('/specializations', { params });
      
      const transformedSpecializations = response.data.map(
        specialization => transformSpecializationData(specialization)
      );
      
      console.log('✅ Specializations fetched:', transformedSpecializations);
      return transformedSpecializations;
    } catch (error) {
      console.error('❌ Error fetching specializations:', error);
      throw error.response?.data || { message: 'Error fetching specializations' };
    }
  },

  /**
   * Get specialization details
   * @param {string} id - Specialization ID
   * @returns {Promise} - Promise with transformed specialization details
   */
  async getSpecializationById(id) {
    try {
      console.log(`🔍 Fetching specialization ${id}...`);
      const response = await api.get(`/specializations/${id}`);
      
      const transformedSpecialization = transformSpecializationData(response.data);
      
      console.log('✅ Specialization fetched:', transformedSpecialization);
      return transformedSpecialization;
    } catch (error) {
      console.error(`❌ Error fetching specialization ${id}:`, error);
      throw error.response?.data || { message: 'Error fetching specialization' };
    }
  },

  /**
   * Create new specialization
   * @param {Object} specializationData - Specialization data
   * @returns {Promise} - Promise with created specialization data
   */
  async createSpecialization(specializationData) {
    try {
      console.log('🆕 Creating specialization:', specializationData);
      const response = await api.post('/specializations', specializationData);
      
      const transformedSpecialization = transformSpecializationData(response.data);
      
      console.log('✅ Specialization created:', transformedSpecialization);
      return transformedSpecialization;
    } catch (error) {
      console.error('❌ Error creating specialization:', error);
      throw error.response?.data || { message: 'Error creating specialization' };
    }
  },

  /**
   * Update existing specialization
   * @param {string} id - Specialization ID
   * @param {Object} specializationData - Specialization data to update
   * @returns {Promise} - Promise with updated specialization data
   */
  async updateSpecialization(id, specializationData) {
    try {
      console.log(`🔄 Updating specialization ${id}:`, specializationData);
      const response = await api.put(`/specializations/${id}`, specializationData);
      
      const transformedSpecialization = transformSpecializationData(response.data);
      
      console.log('✅ Specialization updated:', transformedSpecialization);
      return transformedSpecialization;
    } catch (error) {
      console.error(`❌ Error updating specialization ${id}:`, error);
      throw error.response?.data || { message: 'Error updating specialization' };
    }
  },

  /**
   * Delete specialization
   * @param {string} id - Specialization ID
   * @returns {Promise} - Promise with deletion result
   */
  async deleteSpecialization(id) {
    try {
      console.log(`🗑️ Deleting specialization ${id}...`);
      const response = await api.delete(`/specializations/${id}`);
      
      console.log('✅ Specialization deleted');
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting specialization ${id}:`, error);
      throw error.response?.data || { message: 'Error deleting specialization' };
    }
  }
};

export default specializationsService; 