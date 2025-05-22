import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

/**
 * Component that protects routes requiring admin authentication
 */
const ProtectedRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator during verification
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login page if not authenticated or not admin
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check Admin role (double security)
  if (!user?.role || user.role !== 'Admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Access authorized
  return <Outlet />;
};

export default ProtectedRoute;