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
  AccountBalance as FinanceIcon
} from '@mui/icons-material';
import './Sidebar.css';
import logoImg from '../../assets/images/logo.png';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',     path: '/dashboard',    icon: DashboardIcon },
  { id: 'doctors',      label: 'Doctors',       path: '/doctors',      icon: DoctorIcon },
  { id: 'patients',     label: 'Patients',      path: '/patients',     icon: PeopleIcon },
  { id: 'appointments', label: 'Appointments',  path: '/appointments', icon: EventIcon },
  { id: 'finances',     label: 'Finances',      path: '/finances',     icon: FinanceIcon }
];

const Sidebar = ({ onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    onItemClick?.();
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <Box
      sx={{
        width: 280,
        bgcolor: '#fff',
        borderRight: '1px solid #e2e8f0',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Box 
          component="img"
          src={logoImg}
          alt="Tabeebou Logo"
          sx={{ 
            width: 50, 
            height: 50, 
            filter: 'invert(65%) sepia(15%) saturate(1060%) hue-rotate(167deg) brightness(92%) contrast(90%)',
          }}
        />
        <Typography variant="h6" sx={{ mt: 1, color: '#7AA7CC', fontWeight: 700 }}>
          Tabeebou.com
        </Typography>
      </Box>

      <Divider sx={{ borderColor: '#e2e8f0' }} />

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, mt: 2 }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                onClick={() => handleNav(item.path)}
                sx={{
                  px: 3,
                  py: 1.25,
                  mx: 1,
                  borderRadius: 2,
                  bgcolor: active ? '#7AA7CC' : 'transparent',
                  color: active ? '#fff' : '#090F47',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    bgcolor: active ? '#7AA7CC' : 'rgba(122,167,204,0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: active ? '#fff' : '#7AA7CC', minWidth: 36 }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '15px',
                    fontWeight: active ? 600 : 500,
                    letterSpacing: '-0.02em'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      
    </Box>
  );
};

export default Sidebar;
