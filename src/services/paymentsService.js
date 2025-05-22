import api from './api';

const paymentsService = {
  /**
   * Récupérer tous les paiements avec fallback
   */
  async getAllPayments(params = {}) {
    try {
      console.log('🔍 Récupération des paiements...');
      const response = await api.get('/payments', { params });
      console.log('✅ Paiements récupérés:', response.data);
      
      return response.data;
    } catch (error) {
      console.warn('❌ Route payments non disponible:', error.response?.status);
      
      // Si c'est une 404, la route n'existe pas
      if (error.response?.status === 404) {
        console.log('💡 Génération de données de paiements simulées...');
        return this.generateMockPayments();
      }
      
      // Pour les autres erreurs, les propager
      throw error.response?.data || { message: 'Erreur lors de la récupération des paiements' };
    }
  },

  /**
   * Récupérer un paiement par ID
   */
  async getPaymentById(id) {
    try {
      console.log(`🔍 Récupération du paiement ${id}...`);
      const response = await api.get(`/payments/${id}`);
      console.log('✅ Paiement récupéré:', response.data);
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        // Générer un paiement simulé
        return this.generateMockPayment(id);
      }
      
      console.error(`❌ Erreur lors de la récupération du paiement ${id}:`, error);
      throw error.response?.data || { message: 'Erreur lors de la récupération du paiement' };
    }
  },

  /**
   * Créer un nouveau paiement
   */
  async createPayment(paymentData) {
    try {
      console.log('🆕 Création du paiement:', paymentData);
      const response = await api.post('/payments', paymentData);
      console.log('✅ Paiement créé:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la création du paiement:', error);
      throw error.response?.data || { message: 'Erreur lors de la création du paiement' };
    }
  },

  /**
   * Mettre à jour un paiement
   */
  async updatePayment(id, paymentData) {
    try {
      console.log(`🔄 Mise à jour du paiement ${id}:`, paymentData);
      const response = await api.put(`/payments/${id}`, paymentData);
      console.log('✅ Paiement mis à jour:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour du paiement ${id}:`, error);
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du paiement' };
    }
  },

  /**
   * Supprimer un paiement
   */
  async deletePayment(id) {
    try {
      console.log(`🗑️ Suppression du paiement ${id}...`);
      const response = await api.delete(`/payments/${id}`);
      console.log('✅ Paiement supprimé');
      
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression du paiement ${id}:`, error);
      throw error.response?.data || { message: 'Erreur lors de la suppression du paiement' };
    }
  },

  /**
   * Récupérer les paiements par médecin
   */
  async getPaymentsByDoctor(doctorId) {
    try {
      console.log(`🔍 Récupération des paiements pour le médecin ${doctorId}...`);
      const response = await api.get(`/payments?doctorId=${doctorId}`);
      console.log('✅ Paiements du médecin récupérés:', response.data);
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return this.generateMockPaymentsForDoctor(doctorId);
      }
      
      console.error(`❌ Erreur lors de la récupération des paiements du médecin ${doctorId}:`, error);
      throw error.response?.data || { message: 'Erreur lors de la récupération des paiements' };
    }
  },

  /**
   * Récupérer les paiements par patient
   */
  async getPaymentsByPatient(patientId) {
    try {
      console.log(`🔍 Récupération des paiements pour le patient ${patientId}...`);
      const response = await api.get(`/payments?patientId=${patientId}`);
      console.log('✅ Paiements du patient récupérés:', response.data);
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return this.generateMockPaymentsForPatient(patientId);
      }
      
      console.error(`❌ Erreur lors de la récupération des paiements du patient ${patientId}:`, error);
      throw error.response?.data || { message: 'Erreur lors de la récupération des paiements' };
    }
  },

  /**
   * Récupérer les statistiques de paiements
   */
  async getPaymentsStats(period = 'month') {
    try {
      console.log(`📊 Récupération des statistiques de paiements (${period})...`);
      const response = await api.get(`/payments/stats?period=${period}`);
      console.log('✅ Statistiques récupérées:', response.data);
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return this.generateMockStats(period);
      }
      
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      throw error.response?.data || { message: 'Erreur lors de la récupération des statistiques' };
    }
  },

  /**
   * Générer des données de paiements simulées
   */
  generateMockPayments() {
    const mockPayments = [];
    const now = new Date();
    
    // Générer 15 paiements simulés
    for (let i = 1; i <= 15; i++) {
      const daysAgo = Math.floor(Math.random() * 30); // 0-30 jours
      const paymentDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      mockPayments.push({
        id: i,
        _id: `mock_payment_${i}`,
        amount: Math.floor(Math.random() * 100) + 50, // 50-150€
        doctorId: `mock_doctor_${Math.floor(Math.random() * 4) + 1}`,
        patientId: `mock_patient_${Math.floor(Math.random() * 10) + 1}`,
        appointmentId: `mock_appointment_${i}`,
        date: paymentDate.toISOString(),
        status: Math.random() > 0.1 ? 'completed' : 'pending',
        method: ['card', 'bank_transfer', 'cash'][Math.floor(Math.random() * 3)],
        description: [
          'Consultation générale',
          'Consultation spécialisée',
          'Thérapie individuelle',
          'Consultation urgence',
          'Suivi thérapeutique'
        ][Math.floor(Math.random() * 5)],
        transactionId: `TXN_${Date.now()}_${i}`,
        createdAt: paymentDate.toISOString(),
        updatedAt: paymentDate.toISOString()
      });
    }
    
    console.log('🎭 Paiements simulés générés:', mockPayments);
    return mockPayments;
  },

  /**
   * Générer un paiement simulé spécifique
   */
  generateMockPayment(id) {
    return {
      id: id,
      _id: `mock_payment_${id}`,
      amount: Math.floor(Math.random() * 100) + 50,
      doctorId: `mock_doctor_${Math.floor(Math.random() * 4) + 1}`,
      patientId: `mock_patient_${Math.floor(Math.random() * 10) + 1}`,
      appointmentId: `mock_appointment_${id}`,
      date: new Date().toISOString(),
      status: 'completed',
      method: 'card',
      description: 'Consultation générale',
      transactionId: `TXN_${Date.now()}_${id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  /**
   * Générer des paiements simulés pour un médecin
   */
  generateMockPaymentsForDoctor(doctorId) {
    const payments = this.generateMockPayments();
    return payments.filter(p => p.doctorId === doctorId || Math.random() > 0.7);
  },

  /**
   * Générer des paiements simulés pour un patient
   */
  generateMockPaymentsForPatient(patientId) {
    const payments = this.generateMockPayments();
    return payments.filter(p => p.patientId === patientId || Math.random() > 0.8);
  },

  /**
   * Générer des statistiques simulées
   */
  generateMockStats(period) {
    const baseAmount = 5000;
    const variation = () => Math.floor(Math.random() * 2000) - 1000; // ±1000€
    
    return {
      period: period,
      totalRevenue: baseAmount + variation(),
      totalTransactions: Math.floor(Math.random() * 50) + 30,
      averageTransaction: Math.floor(Math.random() * 40) + 60, // 60-100€
      completedPayments: Math.floor(Math.random() * 45) + 25,
      pendingPayments: Math.floor(Math.random() * 5) + 1,
      byMethod: {
        card: Math.floor(Math.random() * 20) + 15,
        bank_transfer: Math.floor(Math.random() * 15) + 10,
        cash: Math.floor(Math.random() * 10) + 5
      },
      trend: {
        revenue: Math.floor(Math.random() * 20) - 10, // -10% à +10%
        transactions: Math.floor(Math.random() * 15) - 5 // -5% à +10%
      },
      generatedAt: new Date().toISOString()
    };
  }
};

export default paymentsService;