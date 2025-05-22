import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocalHospital as DoctorIcon,
  Event as EventIcon,
  AccountBalance as FinanceIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import Breadcrumb from '../common/Breadcrumb';
import './AdminLayout.css';

const DRAWER_WIDTH = 280;

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
//   const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  return (
    <Box className="admin-layout">
      {/* Header */}
      <AppBar 
        position="fixed" 
        className="header"
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar className="toolbar">
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" className="header-title">
            Admin Dashboard
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Breadcrumb */}
          <Box sx={{ mr: 3, display: { xs: 'none', sm: 'block' } }}>
            <Breadcrumb />
          </Box>
          
          {/* Profile Menu */}
          <IconButton
            onClick={handleProfileMenuOpen}
            className="profile-button"
          >
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36,
                backgroundColor: '#2563eb',
                fontSize: '14px'
              }}
            >
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            className="profile-menu"
          >
            <MenuItem onClick={handleProfileMenuClose}>
              <SettingsIcon sx={{ mr: 2, fontSize: '20px' }} />
              Paramètres
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 2, fontSize: '20px' }} />
              Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" className="sidebar-container">
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              backgroundColor: '#fafafa',
              borderRight: '1px solid #e5e7eb',
              paddingTop: '64px', // Espace pour l'AppBar
            }
          }}
        >
          <Sidebar onItemClick={() => isMobile && setMobileOpen(false)} />
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        className="main-content"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          marginLeft: { sm: 0, md: `${DRAWER_WIDTH}px` },
          paddingTop: '64px', // Hauteur de l'AppBar
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          paddingX: { xs: 0, sm: 0 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;