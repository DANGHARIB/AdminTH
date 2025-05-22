import api from './api';

const doctorsService = {
  /**
   * Mapper les données du backend vers le format frontend
   */
  mapDoctorData(backendDoctor) {
    return {
      id: backendDoctor._id,
      _id: backendDoctor._id, // Garder aussi l'ID original
      firstName: backendDoctor.first_name || '',
      lastName: backendDoctor.last_name || '',
      name: backendDoctor.full_name || `${backendDoctor.first_name || ''} ${backendDoctor.last_name || ''}`.trim(),
      fullName: backendDoctor.full_name || `${backendDoctor.first_name || ''} ${backendDoctor.last_name || ''}`.trim(),
      email: backendDoctor.email || backendDoctor.user?.email || 'Non disponible',
      specialty: backendDoctor.specialization || backendDoctor.specialty || '',
      specialization: backendDoctor.specialization || '', // Garder aussi le champ original
      status: backendDoctor.verified ? 'verified' : 'pending',
      verified: backendDoctor.verified || false,
      isVerified: backendDoctor.verified || false,
      gender: backendDoctor.gender || backendDoctor.user?.gender || 'Non spécifié',
      experience: backendDoctor.experience || 0,
      price: backendDoctor.price || 0,
      patients: backendDoctor.patients || 0,
      rating: backendDoctor.rating || 0,
      joinDate: backendDoctor.createdAt,
      createdAt: backendDoctor.createdAt,
      updatedAt: backendDoctor.updatedAt,
      // Champs supplémentaires
      about: backendDoctor.about || '',
      education: backendDoctor.education || '',
      certifications: backendDoctor.certifications || [],
      specializations: backendDoctor.specializations || [],
      doctor_image: backendDoctor.doctor_image || null,
      dob: backendDoctor.dob || null,
      user: backendDoctor.user || null,
      // Champs calculés
      displayName: `Dr. ${backendDoctor.full_name || `${backendDoctor.first_name || ''} ${backendDoctor.last_name || ''}`.trim()}`,
      initials: this.getInitials(backendDoctor.full_name || `${backendDoctor.first_name || ''} ${backendDoctor.last_name || ''}`)
    };
  },

  /**
   * Générer les initiales à partir du nom
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
   * Récupérer tous les médecins
   */
  async getAllDoctors(params = {}) {
    try {
      console.log('🔍 Récupération des médecins...');
      const response = await api.get('/doctors', { params });
      console.log('📦 Données brutes doctors:', response.data);
      
      // Mapper chaque médecin
      const mappedDoctors = response.data.map(doctor => this.mapDoctorData(doctor));
      console.log('✅ Données mappées doctors:', mappedDoctors);
      
      return mappedDoctors;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des médecins:', error);
      throw error.response?.data || { message: 'Erreur lors de la récupération des médecins' };
    }
  },

  /**
   * Récupérer un médecin par ID
   */
  async getDoctorById(id) {
    try {
      console.log(`🔍 Récupération du médecin ${id}...`);
      const response = await api.get(`/doctors/${id}`);
      console.log('📦 Données brutes doctor:', response.data);
      
      const mappedDoctor = this.mapDoctorData(response.data);
      console.log('✅ Données mappées doctor:', mappedDoctor);
      
      return mappedDoctor;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération du médecin ${id}:`, error);
      throw error.response?.data || { message: 'Erreur lors de la récupération du médecin' };
    }
  },

  /**
   * Créer un nouveau médecin
   */
  async createDoctor(doctorData) {
    try {
      console.log('🆕 Création du médecin:', doctorData);
      const response = await api.post('/doctors', doctorData);
      console.log('✅ Médecin créé:', response.data);
      
      return this.mapDoctorData(response.data);
    } catch (error) {
      console.error('❌ Erreur lors de la création du médecin:', error);
      throw error.response?.data || { message: 'Erreur lors de la création du médecin' };
    }
  },

  /**
   * Mettre à jour un médecin
   */
  async updateDoctor(id, doctorData) {
    try {
      console.log(`🔄 Mise à jour du médecin ${id}:`, doctorData);
      const response = await api.put(`/doctors/${id}`, doctorData);
      console.log('✅ Médecin mis à jour:', response.data);
      
      return this.mapDoctorData(response.data);
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour du médecin ${id}:`, error);
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du médecin' };
    }
  },

  /**
   * Supprimer un médecin
   */
  async deleteDoctor(id) {
    try {
      console.log(`🗑️ Suppression du médecin ${id}...`);
      const response = await api.delete(`/doctors/${id}`);
      console.log('✅ Médecin supprimé');
      
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression du médecin ${id}:`, error);
      throw error.response?.data || { message: 'Erreur lors de la suppression du médecin' };
    }
  },

  /**
   * Vérifier un médecin
   */
  async verifyDoctor(id) {
    try {
      console.log(`✅ Vérification du médecin ${id}...`);
      const response = await api.patch(`/doctors/${id}/verify`);
      console.log('✅ Médecin vérifié:', response.data);
      
      return this.mapDoctorData(response.data);
    } catch (error) {
      console.error(`❌ Erreur lors de la vérification du médecin ${id}:`, error);
      throw error.response?.data || { message: 'Erreur lors de la vérification du médecin' };
    }
  },

  /**
   * Rejeter un médecin
   */
  async rejectDoctor(id, reason = '') {
    try {
      console.log(`❌ Rejet du médecin ${id}...`);
      const response = await api.patch(`/doctors/${id}/reject`, { reason });
      console.log('✅ Médecin rejeté:', response.data);
      
      return this.mapDoctorData(response.data);
    } catch (error) {
      console.error(`❌ Erreur lors du rejet du médecin ${id}:`, error);
      throw error.response?.data || { message: 'Erreur lors du rejet du médecin' };
    }
  },

  /**
   * Rechercher des médecins
   */
  async searchDoctors(query, filters = {}) {
    try {
      console.log('🔍 Recherche de médecins:', { query, filters });
      const params = {
        search: query,
        ...filters
      };
      
      const response = await api.get('/doctors/search', { params });
      console.log('📦 Résultats de recherche:', response.data);
      
      const mappedResults = response.data.map(doctor => this.mapDoctorData(doctor));
      console.log('✅ Résultats mappés:', mappedResults);
      
      return mappedResults;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      throw error.response?.data || { message: 'Erreur lors de la recherche' };
    }
  },

  /**
   * Obtenir les statistiques des médecins
   */
  async getDoctorsStats() {
    try {
      console.log('📊 Récupération des statistiques des médecins...');
      const response = await api.get('/doctors/stats');
      console.log('✅ Statistiques reçues:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      throw error.response?.data || { message: 'Erreur lors de la récupération des statistiques' };
    }
  }
};

export default doctorsService;