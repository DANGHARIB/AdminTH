import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, AdminLayout } from './components';
import {
  Login,
  Dashboard,
  DoctorsList,
  DoctorDetails,
  DoctorReview,
  PatientsList,
  PatientDetails,
  AppointmentsList,
  FinancesOverview,
  Settings
} from './pages';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      
      {/* Routes protégées avec layout admin */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Gestion des médecins */}
          <Route path="/doctors" element={<DoctorsList />} />
          <Route path="/doctors/:id" element={<DoctorDetails />} />
          <Route path="/doctors/:id/review" element={<DoctorReview />} />
          
          {/* Gestion des patients */}
          <Route path="/patients" element={<PatientsList />} />
          <Route path="/patients/:id" element={<PatientDetails />} />
          
          {/* Gestion des rendez-vous */}
          <Route path="/appointments" element={<AppointmentsList />} />
          
          {/* Module financier */}
          <Route path="/finances" element={<FinancesOverview />} />
          
          {/* Paramètres */}
          <Route path="/settings" element={<Settings />} />
          
          {/* Routes futures (placeholders) */}
          <Route path="/reports" element={
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>Rapports - En développement</h2>
              <p>Cette fonctionnalité sera disponible dans une prochaine version.</p>
            </div>
          } />
        </Route>
      </Route>
      
      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      
      {/* Route de fallback pour les erreurs */}
      <Route path="/error" element={
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h1>Erreur de chargement</h1>
          <p>Une erreur est survenue lors du chargement de la page.</p>
          <button 
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
            onClick={() => window.location.href = '/dashboard'}
          >
            Retour au tableau de bord
          </button>
        </div>
      } />
    </Routes>
  );
};

export default AppRoutes;