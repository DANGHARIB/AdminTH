import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocalHospital as DoctorIcon,
  Event as EventIcon,
  AccountBalance as FinanceIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import './Sidebar.css';

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: DashboardIcon,
    category: 'main'
  },
  {
    id: 'doctors',
    label: 'Médecins',
    path: '/doctors',
    icon: DoctorIcon,
    category: 'main',
    badge: 'pending'
  },
  {
    id: 'patients',
    label: 'Patients',
    path: '/patients',
    icon: PeopleIcon,
    category: 'main'
  },
  {
    id: 'appointments',
    label: 'Rendez-vous',
    path: '/appointments',
    icon: EventIcon,
    category: 'main'
  },
  {
    id: 'finances',
    label: 'Finances',
    path: '/finances',
    icon: FinanceIcon,
    category: 'management'
  },
  {
    id: 'reports',
    label: 'Rapports',
    path: '/reports',
    icon: ReportsIcon,
    category: 'management'
  },
  {
    id: 'settings',
    label: 'Paramètres',
    path: '/settings',
    icon: SettingsIcon,
    category: 'system'
  }
];

const Sidebar = ({ onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    if (onItemClick) onItemClick();
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderNavItems = (category) => {
    return navigationItems
      .filter(item => item.category === category)
      .map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        
        return (
          <ListItem key={item.id} disablePadding className="nav-item">
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              className={`nav-button ${active ? 'active' : ''}`}
              sx={{
                borderRadius: '12px',
                margin: '2px 12px',
                minHeight: '48px',
                '&.active': {
                  backgroundColor: '#2563eb',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white'
                  }
                },
                '&:hover:not(.active)': {
                  backgroundColor: '#f1f5f9'
                }
              }}
            >
              <ListItemIcon className="nav-icon">
                <Icon sx={{ fontSize: '20px' }} />
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '14px',
                  fontWeight: active ? 600 : 500,
                  letterSpacing: '-0.025em'
                }}
              />
              {item.badge === 'pending' && (
                <Chip 
                  label="3" 
                  size="small" 
                  color="warning"
                  sx={{ 
                    height: '20px',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        );
      });
  };

  return (
    <Box className="sidebar">
      {/* Logo */}
      <Box className="sidebar-header">
        <Box className="logo">
          <DoctorIcon sx={{ fontSize: '32px', color: '#2563eb' }} />
          <Typography variant="h6" className="logo-text">
            MedAdmin
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 2, my: 1, borderColor: '#e2e8f0' }} />

      {/* Navigation principale */}
      <Box className="nav-section">
        <Typography variant="overline" className="section-title">
          Principal
        </Typography>
        <List disablePadding>
          {renderNavItems('main')}
        </List>
      </Box>

      {/* Navigation gestion */}
      <Box className="nav-section">
        <Typography variant="overline" className="section-title">
          Gestion
        </Typography>
        <List disablePadding>
          {renderNavItems('management')}
        </List>
      </Box>

      {/* Navigation système */}
      <Box className="nav-section">
        <Typography variant="overline" className="section-title">
          Système
        </Typography>
        <List disablePadding>
          {renderNavItems('system')}
        </List>
      </Box>

      {/* Footer */}
      <Box className="sidebar-footer">
        <Typography variant="caption" color="text.secondary">
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;