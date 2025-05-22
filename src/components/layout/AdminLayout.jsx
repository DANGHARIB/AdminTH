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
          bgcolor: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar className="toolbar">
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon sx={{ color: '#7AA7CC' }} />
          </IconButton>

          <Typography
            variant="h6"
            className="header-title"
            sx={{ color: '#7AA7CC', fontWeight: 600 }}
          >
            Admin Dashboard
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Breadcrumb */}
          <Box sx={{ mr: 3, display: { xs: 'none', sm: 'block' } }}>
            <Breadcrumb />
          </Box>

          {/* Profile Menu */}
          <IconButton onClick={handleProfileMenuOpen} className="profile-button">
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#7AA7CC',
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
            <MenuItem onClick={handleProfileMenuClose} sx={{ color: '#090F47' }}>
              <SettingsIcon sx={{ mr: 2, fontSize: 20, color: '#7AA7CC' }} />
              Settings
            </MenuItem>
            <Divider sx={{ mx: 2, borderColor: '#e2e8f0' }} />
            <MenuItem onClick={handleLogout} sx={{ color: '#090F47' }}>
              <LogoutIcon sx={{ mr: 2, fontSize: 20, color: '#7AA7CC' }} />
              Logout
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
              bgcolor: '#fff',
              borderRight: '1px solid #e5e7eb',
              pt: '64px'
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
          ml: { sm: 0, md: `${DRAWER_WIDTH}px` },
          pt: '64px',
          minHeight: '100vh',
          bgcolor: '#f8fafc',
          px: { xs: 0, sm: 0 }
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
