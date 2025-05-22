import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

/**
 * Composant qui protège les routes nécessitant une authentification admin
 */
const ProtectedRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Afficher un indicateur de chargement pendant la vérification
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Rediriger vers la page de connexion si non authentifié ou non admin
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier le rôle Admin (double sécurité)
  if (!user?.role || user.role !== 'Admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Accès autorisé
  return <Outlet />;
};

export default ProtectedRoute;