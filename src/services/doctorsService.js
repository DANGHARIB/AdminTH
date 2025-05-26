import api from './api';

const doctorsService = {
  /**
   * Map backend data to frontend format
   */
  mapDoctorData(backendDoctor) {
    return {
      id: backendDoctor._id,
      _id: backendDoctor._id, // Keep original ID as well
      firstName: backendDoctor.first_name || '',
      lastName: backendDoctor.last_name || '',
      name: backendDoctor.full_name || `${backendDoctor.first_name || ''} ${backendDoctor.last_name || ''}`.trim(),
      fullName: backendDoctor.full_name || `${backendDoctor.first_name || ''} ${backendDoctor.last_name || ''}`.trim(),
      email: backendDoctor.email || backendDoctor.user?.email || 'Not available',
      // Gérer à la fois specialization (objet unique) et le champ texte legacy
      specialty: backendDoctor.specialization?.name || backendDoctor.specialization || backendDoctor.specialty || '',
      // Conserve le champ original
      specialization: backendDoctor.specialization || '', 
      // Pour accéder aux spécialisations multiples si disponibles
      specializations: (backendDoctor.specializations || []).map(spec => ({
        id: spec._id || spec,
        name: spec.name || ''
      })),
      status: backendDoctor.verified ? 'verified' : 'pending',
      verified: backendDoctor.verified || false,
      isVerified: backendDoctor.verified || false,
      gender: backendDoctor.gender || backendDoctor.user?.gender || 'Not specified',
      experience: backendDoctor.experience || 0,
      price: backendDoctor.price || 0,
      patients: backendDoctor.patients || 0,
      rating: backendDoctor.rating || 0,
      joinDate: backendDoctor.createdAt,
      createdAt: backendDoctor.createdAt,
      updatedAt: backendDoctor.updatedAt,
      // Additional fields
      about: backendDoctor.about || '',
      education: backendDoctor.education || '',
      certifications: backendDoctor.certifications || [],
      doctor_image: backendDoctor.doctor_image || null,
      dob: backendDoctor.dob || null,
      user: backendDoctor.user || null,
      // Calculated fields
      displayName: `Dr. ${backendDoctor.full_name || `${backendDoctor.first_name || ''} ${backendDoctor.last_name || ''}`.trim()}`,
      initials: this.getInitials(backendDoctor.full_name || `${backendDoctor.first_name || ''} ${backendDoctor.last_name || ''}`)
    };
  },

  /**
   * Generate initials from name
   */
  getInitials(fullName) {
    if (!fullName) return 'DR';
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  },

  /**
   * Get all doctors
   */
  async getAllDoctors(params = {}) {
    try {
      console.log('🔍 Fetching doctors...');
      const response = await api.get('/doctors', { params });
      console.log('📦 Raw doctors data:', response.data);
      
      // Map each doctor
      const mappedDoctors = response.data.map(doctor => this.mapDoctorData(doctor));
      console.log('✅ Mapped doctors data:', mappedDoctors);
      
      return mappedDoctors;
    } catch (error) {
      console.error('❌ Error fetching doctors:', error);
      throw error.response?.data || { message: 'Error fetching doctors' };
    }
  },

  /**
   * Récupère le nombre de patients associés à un médecin
   * @param {string} doctorId - ID du médecin
   * @returns {Promise<number>} - Nombre de patients
   */
  async getDoctorPatientCount(doctorId) {
    try {
      console.log(`🔢 Récupération du nombre de patients pour le médecin ${doctorId}...`);
      const response = await api.get(`/doctors/${doctorId}/patients/count`);
      console.log('✅ Nombre de patients récupéré:', response.data);
      
      return response.data.patientCount;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération du nombre de patients: ${error}`);
      return 0; // Valeur par défaut en cas d'erreur
    }
  },

  /**
   * Version enrichie de mapDoctorData pour inclure le nombre de patients
   * @param {Object} backendDoctor - Données du médecin depuis l'API
   * @param {number} patientCount - Nombre de patients (optionnel)
   * @returns {Object} - Données du médecin formatées pour le frontend
   */
  async mapDoctorDataWithPatients(backendDoctor) {
    // Récupérer le nombre de patients si disponible
    let patientCount = 0;
    try {
      patientCount = await this.getDoctorPatientCount(backendDoctor._id);
    } catch (error) {
      console.warn(`Impossible de récupérer le nombre de patients: ${error.message}`);
    }

    // Utiliser mapDoctorData existant et ajouter patientCount
    const doctorData = this.mapDoctorData(backendDoctor);
    return {
      ...doctorData,
      patientCount
    };
  },

  /**
   * Version enrichie de getAllDoctors pour inclure le nombre de patients
   */
  async getAllDoctorsWithPatientCount(params = {}) {
    try {
      console.log('🔍 Fetching doctors with patient counts...');
      const response = await api.get('/doctors', { params });
      
      // Transformer chaque médecin et ajouter le nombre de patients
      const doctorsWithPatients = await Promise.all(
        response.data.map(async doctor => {
          return await this.mapDoctorDataWithPatients(doctor);
        })
      );
      
      return doctorsWithPatients;
    } catch (error) {
      console.error('❌ Error fetching doctors with patient counts:', error);
      throw error.response?.data || { message: 'Error fetching doctors' };
    }
  },

  /**
   * Get doctor by ID
   */
  async getDoctorById(id) {
    try {
      console.log(`🔍 Fetching doctor ${id}...`);
      const response = await api.get(`/doctors/${id}`);
      console.log('📦 Raw doctor data:', response.data);
      
      const mappedDoctor = this.mapDoctorData(response.data);
      console.log('✅ Mapped doctor data:', mappedDoctor);
      
      return mappedDoctor;
    } catch (error) {
      console.error(`❌ Error fetching doctor ${id}:`, error);
      throw error.response?.data || { message: 'Error fetching doctor' };
    }
  },

  /**
   * Get doctor by ID with patient count
   */
  async getDoctorByIdWithPatientCount(id) {
    try {
      console.log(`🔍 Fetching doctor ${id} with patient count...`);
      const response = await api.get(`/doctors/${id}`);
      
      const doctorWithPatients = await this.mapDoctorDataWithPatients(response.data);
      console.log('✅ Mapped doctor data with patient count:', doctorWithPatients);
      
      return doctorWithPatients;
    } catch (error) {
      console.error(`❌ Error fetching doctor with patient count:`, error);
      throw error.response?.data || { message: 'Error fetching doctor' };
    }
  },

  /**
   * Create new doctor
   */
  async createDoctor(doctorData) {
    try {
      console.log('🆕 Creating doctor:', doctorData);
      const response = await api.post('/doctors', doctorData);
      console.log('✅ Doctor created:', response.data);
      
      return this.mapDoctorData(response.data);
    } catch (error) {
      console.error('❌ Error creating doctor:', error);
      throw error.response?.data || { message: 'Error creating doctor' };
    }
  },

  /**
   * Update doctor
   */
  async updateDoctor(id, doctorData) {
    try {
      console.log(`🔄 Updating doctor ${id}:`, doctorData);
      const response = await api.put(`/doctors/${id}`, doctorData);
      console.log('✅ Doctor updated:', response.data);
      
      return this.mapDoctorData(response.data);
    } catch (error) {
      console.error(`❌ Error updating doctor ${id}:`, error);
      throw error.response?.data || { message: 'Error updating doctor' };
    }
  },

  /**
   * Delete doctor
   */
  async deleteDoctor(id) {
    try {
      console.log(`🗑️ Deleting doctor ${id}...`);
      const response = await api.delete(`/doctors/${id}`);
      console.log('✅ Doctor deleted');
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting doctor ${id}:`, error);
      throw error.response?.data || { message: 'Error deleting doctor' };
    }
  },

  /**
   * Verify doctor
   */
  async verifyDoctor(id) {
    try {
      console.log(`✅ Verifying doctor ${id}...`);
      // L'endpoint n'accepte que la méthode PATCH
      const response = await api.patch(`/doctors/${id}/verify`);
      console.log('✅ Doctor verified:', response.data);
      
      return this.mapDoctorData(response.data);
    } catch (error) {
      console.error(`❌ Error verifying doctor ${id}:`, error);
      throw error.response?.data || { message: 'Error verifying doctor' };
    }
  },

  /**
   * Reject doctor
   */
  async rejectDoctor(id, reason = '') {
    try {
      console.log(`❌ Rejecting doctor ${id}...`);
      // L'endpoint n'accepte que la méthode PATCH
      const response = await api.patch(`/doctors/${id}/reject`, { reason });
      console.log('✅ Doctor rejected:', response.data);
      
      return this.mapDoctorData(response.data);
    } catch (error) {
      console.error(`❌ Error rejecting doctor ${id}:`, error);
      throw error.response?.data || { message: 'Error rejecting doctor' };
    }
  },

  /**
   * Get doctor verification status
   */
  async getDoctorVerificationStatus(id) {
    try {
      console.log(`🔍 Fetching verification status for doctor ${id}...`);
      const response = await api.get(`/doctors/${id}/verification-status`);
      console.log('✅ Verification status received:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching verification status for doctor ${id}:`, error);
      throw error.response?.data || { message: 'Error fetching verification status' };
    }
  },

  /**
   * Search doctors
   */
  async searchDoctors(query, filters = {}) {
    try {
      console.log('🔍 Searching doctors:', { query, filters });
      const params = {
        search: query,
        ...filters
      };
      
      const response = await api.get('/doctors/search', { params });
      console.log('📦 Search results:', response.data);
      
      const mappedResults = response.data.map(doctor => this.mapDoctorData(doctor));
      console.log('✅ Mapped results:', mappedResults);
      
      return mappedResults;
    } catch (error) {
      console.error('❌ Search error:', error);
      throw error.response?.data || { message: 'Search error' };
    }
  },

  /**
   * Get doctors statistics
   */
  async getDoctorsStats() {
    try {
      console.log('📊 Fetching doctors statistics...');
      const response = await api.get('/doctors/stats');
      console.log('✅ Statistics received:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      throw error.response?.data || { message: 'Error fetching statistics' };
    }
  },

  /**
   * Get doctor finances
   */
  async getDoctorFinances(id) {
    try {
      console.log(`💰 Fetching finances for doctor ${id}...`);
      const response = await api.get(`/doctors/${id}/finances`);
      console.log('✅ Finances data received:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching finances for doctor ${id}:`, error);
      throw error.response?.data || { message: 'Error fetching doctor finances' };
    }
  }
};

export default doctorsService;