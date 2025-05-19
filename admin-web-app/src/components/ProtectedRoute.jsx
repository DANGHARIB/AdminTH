import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Composant qui protège les routes nécessitant une authentification
 */
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Afficher un indicateur de chargement pendant la vérification
  if (loading) {
    return <div>Chargement...</div>;
  }

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    // Sauvegarder l'URL actuelle pour rediriger après connexion
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Rendre les routes enfants si authentifié
  return <Outlet />;
};

export default ProtectedRoute;