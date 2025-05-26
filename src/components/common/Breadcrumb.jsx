import { useLocation, Link as RouterLink } from 'react-router-dom';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import './Breadcrumb.css';

const pathNameMap = {
  '/dashboard': 'Dashboard',
  '/doctors': 'Doctors',
  '/patients': 'Patients',
  '/appointments': 'Appointments',
  '/finances': 'Finances'
};

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumb on dashboard
  if (location.pathname === '/dashboard') {
    return null;
  }

  const breadcrumbItems = pathnames.map((name, index) => {
    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
    const isLast = index === pathnames.length - 1;
    
    // Get display name from map or use the path segment
    let displayName = pathNameMap[routeTo] || name;
    
    // If it's a number (like an ID), show it as is
    if (!isNaN(name)) {
      displayName = `#${name}`;
    }

    return isLast ? (
      <Typography 
        key={routeTo} 
        color="text.primary" 
        className="breadcrumb-current"
        sx={{ 
          fontSize: '14px',
          fontWeight: 500,
          textTransform: 'capitalize'
        }}
      >
        {displayName}
      </Typography>
    ) : (
      <Link
        key={routeTo}
        component={RouterLink}
        to={routeTo}
        className="breadcrumb-link"
        sx={{
          fontSize: '14px',
          fontWeight: 400,
          textDecoration: 'none',
          color: '#6b7280',
          textTransform: 'capitalize',
          '&:hover': {
            color: '#2563eb',
            textDecoration: 'underline'
          }
        }}
      >
        {displayName}
      </Link>
    );
  });

  return (
    <Box className="breadcrumb-container">
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: '#d1d5db' }} />}
        aria-label="breadcrumb"
        className="breadcrumb"
      >
        <Link
          component={RouterLink}
          to="/dashboard"
          className="breadcrumb-home"
          sx={{
            fontSize: '14px',
            fontWeight: 400,
            textDecoration: 'none',
            color: '#6b7280',
            '&:hover': {
              color: '#2563eb',
              textDecoration: 'underline'
            }
          }}
        >
          Dashboard
        </Link>
        {breadcrumbItems}
      </Breadcrumbs>
    </Box>
  );
};

export default Breadcrumb;