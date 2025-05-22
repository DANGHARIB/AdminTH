import api from './api';

const paymentsService = {
  /**
   * Get all payments with fallback
   */
  async getAllPayments(params = {}) {
    try {
      console.log('🔍 Fetching payments...');
      const response = await api.get('/payments', { params });
      console.log('✅ Payments fetched:', response.data);
      
      return response.data;
    } catch (error) {
      console.warn('❌ Payments route not available:', error.response?.status);
      
      // If it's a 404, the route doesn't exist
      if (error.response?.status === 404) {
        console.log('💡 Generating mock payment data...');
        return this.generateMockPayments();
      }
      
      // For other errors, propagate them
      throw error.response?.data || { message: 'Error fetching payments' };
    }
  },

  /**
   * Get payment by ID
   */
  async getPaymentById(id) {
    try {
      console.log(`🔍 Fetching payment ${id}...`);
      const response = await api.get(`/payments/${id}`);
      console.log('✅ Payment fetched:', response.data);
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        // Generate mock payment
        return this.generateMockPayment(id);
      }
      
      console.error(`❌ Error fetching payment ${id}:`, error);
      throw error.response?.data || { message: 'Error fetching payment' };
    }
  },

  /**
   * Create new payment
   */
  async createPayment(paymentData) {
    try {
      console.log('🆕 Creating payment:', paymentData);
      const response = await api.post('/payments', paymentData);
      console.log('✅ Payment created:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error creating payment:', error);
      throw error.response?.data || { message: 'Error creating payment' };
    }
  },

  /**
   * Update payment
   */
  async updatePayment(id, paymentData) {
    try {
      console.log(`🔄 Updating payment ${id}:`, paymentData);
      const response = await api.put(`/payments/${id}`, paymentData);
      console.log('✅ Payment updated:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating payment ${id}:`, error);
      throw error.response?.data || { message: 'Error updating payment' };
    }
  },

  /**
   * Delete payment
   */
  async deletePayment(id) {
    try {
      console.log(`🗑️ Deleting payment ${id}...`);
      const response = await api.delete(`/payments/${id}`);
      console.log('✅ Payment deleted');
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting payment ${id}:`, error);
      throw error.response?.data || { message: 'Error deleting payment' };
    }
  },

  /**
   * Get payments by doctor
   */
  async getPaymentsByDoctor(doctorId) {
    try {
      console.log(`🔍 Fetching payments for doctor ${doctorId}...`);
      const response = await api.get(`/payments?doctorId=${doctorId}`);
      console.log('✅ Doctor payments fetched:', response.data);
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return this.generateMockPaymentsForDoctor(doctorId);
      }
      
      console.error(`❌ Error fetching payments for doctor ${doctorId}:`, error);
      throw error.response?.data || { message: 'Error fetching payments' };
    }
  },

  /**
   * Get payments by patient
   */
  async getPaymentsByPatient(patientId) {
    try {
      console.log(`🔍 Fetching payments for patient ${patientId}...`);
      const response = await api.get(`/payments?patientId=${patientId}`);
      console.log('✅ Patient payments fetched:', response.data);
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return this.generateMockPaymentsForPatient(patientId);
      }
      
      console.error(`❌ Error fetching payments for patient ${patientId}:`, error);
      throw error.response?.data || { message: 'Error fetching payments' };
    }
  },

  /**
   * Get payment statistics
   */
  async getPaymentsStats(period = 'month') {
    try {
      console.log(`📊 Fetching payment statistics (${period})...`);
      const response = await api.get(`/payments/stats?period=${period}`);
      console.log('✅ Statistics fetched:', response.data);
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return this.generateMockStats(period);
      }
      
      console.error('❌ Error fetching statistics:', error);
      throw error.response?.data || { message: 'Error fetching statistics' };
    }
  },

  /**
   * Generate mock payment data
   */
  generateMockPayments() {
    const mockPayments = [];
    const now = new Date();
    
    // Generate 15 mock payments
    for (let i = 1; i <= 15; i++) {
      const daysAgo = Math.floor(Math.random() * 30); // 0-30 days
      const paymentDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      mockPayments.push({
        id: i,
        _id: `mock_payment_${i}`,
        amount: Math.floor(Math.random() * 100) + 50, // $50-150
        doctorId: `mock_doctor_${Math.floor(Math.random() * 4) + 1}`,
        patientId: `mock_patient_${Math.floor(Math.random() * 10) + 1}`,
        appointmentId: `mock_appointment_${i}`,
        date: paymentDate.toISOString(),
        status: Math.random() > 0.1 ? 'completed' : 'pending',
        method: ['card', 'bank_transfer', 'cash'][Math.floor(Math.random() * 3)],
        description: [
          'General consultation',
          'Specialized consultation',
          'Individual therapy',
          'Emergency consultation',
          'Therapeutic follow-up'
        ][Math.floor(Math.random() * 5)],
        transactionId: `TXN_${Date.now()}_${i}`,
        createdAt: paymentDate.toISOString(),
        updatedAt: paymentDate.toISOString()
      });
    }
    
    console.log('🎭 Mock payments generated:', mockPayments);
    return mockPayments;
  },

  /**
   * Generate specific mock payment
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
      description: 'General consultation',
      transactionId: `TXN_${Date.now()}_${id}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  /**
   * Generate mock payments for a doctor
   */
  generateMockPaymentsForDoctor(doctorId) {
    const payments = this.generateMockPayments();
    return payments.filter(p => p.doctorId === doctorId || Math.random() > 0.7);
  },

  /**
   * Generate mock payments for a patient
   */
  generateMockPaymentsForPatient(patientId) {
    const payments = this.generateMockPayments();
    return payments.filter(p => p.patientId === patientId || Math.random() > 0.8);
  },

  /**
   * Generate mock statistics
   */
  generateMockStats(period) {
    const baseAmount = 5000;
    const variation = () => Math.floor(Math.random() * 2000) - 1000; // ±$1000
    
    return {
      period: period,
      totalRevenue: baseAmount + variation(),
      totalTransactions: Math.floor(Math.random() * 50) + 30,
      averageTransaction: Math.floor(Math.random() * 40) + 60, // $60-100
      completedPayments: Math.floor(Math.random() * 45) + 25,
      pendingPayments: Math.floor(Math.random() * 5) + 1,
      byMethod: {
        card: Math.floor(Math.random() * 20) + 15,
        bank_transfer: Math.floor(Math.random() * 15) + 10,
        cash: Math.floor(Math.random() * 10) + 5
      },
      trend: {
        revenue: Math.floor(Math.random() * 20) - 10, // -10% to +10%
        transactions: Math.floor(Math.random() * 15) - 5 // -5% to +10%
      },
      generatedAt: new Date().toISOString()
    };
  }
};

export default paymentsService;