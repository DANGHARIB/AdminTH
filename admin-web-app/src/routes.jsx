import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import DoctorsList from './pages/doctors/DoctorsList';
import DoctorDetails from './pages/doctors/DoctorDetails';
import PatientsList from './pages/patients/PatientsList';
import PatientDetails from './pages/patients/PatientDetails';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      
      {/* Routes protégées */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/doctors" element={<DoctorsList />} />
        <Route path="/doctors/:id" element={<DoctorDetails />} />
        <Route path="/patients" element={<PatientsList />} />
        <Route path="/patients/:id" element={<PatientDetails />} />
      </Route>
      
      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;