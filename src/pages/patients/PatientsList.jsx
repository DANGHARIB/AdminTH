import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  useTheme,
  alpha,
  Container
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  LocalHospital as DoctorIcon,
  AccountBalance as FinanceIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { patientsService } from '../../services';
import DataTable from '../../components/common/DataTable';
import './PatientsList.css';

// Color palette consistent with dashboard
const COLORS = {
  primary: '#325A80',
  secondary: '#4A6F94', 
  tertiary: '#2A4A6B',
  lightBlue: '#5D8CAF',
  accent: '#4773A8',
  tabActive: '#4169E1',
  success: '#2E7D32',
  warning: '#ED6C02',
  error: '#D32F2F'
};

const PatientsList = () => {
  const theme = useTheme();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        console.log('Fetching patients...');
        const patientsData = await patientsService.getAllPatients();
        console.log('Patients received:', patientsData);
        setPatients(patientsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError(err.message || 'An error occurred while loading patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filter patients according to active tab
  const filteredPatients = activeTab === 0 
    ? patients 
    : activeTab === 1 
      ? patients.filter(p => p.status === 'active')
      : activeTab === 2
        ? patients.filter(p => p.status === 'inactive')
        : patients.filter(p => p.status === 'pending');

  // Calculated stats with data verification
  const stats = {
    total: patients.length,
    active: patients.filter(p => p.status === 'active').length,
    inactive: patients.filter(p => p.status === 'inactive').length,
    pending: patients.filter(p => p.status === 'pending').length,
    totalRevenue: patients.reduce((sum, p) => sum + (p.totalSpent || 0), 0),
    avgAge: patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + (p.age || 0), 0) / patients.length) : 0,
    totalConsultations: patients.reduce((sum, p) => sum + (p.consultationsCount || 0), 0)
  };

  // StatCard component consistent with Dashboard
  const StatCard = ({ title, value, icon: Icon, color, secondaryText, secondaryInfo, onClick }) => {
    return (
      <Card 
        onClick={onClick}
        sx={{
          height: '100%',
          borderRadius: 3,
          boxShadow: '0 8px 20px rgba(0,0,0,0.07)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
            '& .arrow-icon': {
              transform: 'translateX(5px)',
              opacity: 1,
            }
          },
          background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
          color: '#fff',
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: -15,
            right: -15,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: alpha('#fff', 0.1),
          }}
        />
        <CardContent sx={{ position: 'relative', zIndex: 1, py: 3, px: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '2.2rem' }}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500, mb: 1, fontSize: '1rem' }}>
                {title}
              </Typography>
              {secondaryText && (
                <Typography variant="caption" sx={{ 
                  color: '#ffffff !important', 
                  fontSize: '0.85rem', 
                  display: 'block', 
                  fontWeight: 600,
                  textShadow: '0px 1px 2px rgba(0,0,0,0.1)'
                }}>
                  {secondaryText}
                </Typography>
              )}
              {secondaryInfo && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: '#ffffff !important' }} />
                  <Typography variant="caption" sx={{ 
                    color: '#ffffff !important', 
                    fontWeight: 600, 
                    fontSize: '0.85rem',
                    textShadow: '0px 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    {secondaryInfo}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderRadius: '50%', 
                  bgcolor: alpha('#fff', 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center' 
                }}
              >
                <Icon sx={{ fontSize: 24, color: '#fff' }} />
              </Box>
              <ArrowForwardIcon 
                className="arrow-icon" 
                sx={{ 
                  color: '#fff', 
                  mt: 'auto', 
                  mb: 0.5, 
                  opacity: 0.5,
                  transition: 'all 0.3s ease',
                  fontSize: '1.2rem'
                }} 
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': 
      case 'Actif': return 'Active';
      case 'inactive': 
      case 'Inactif': return 'Inactive';
      case 'pending': 
      case 'En attente': return 'Pending';
      default: return status || 'Unknown';
    }
  };

  const getGenderIcon = (gender) => {
    if (!gender) return '👤';
    return gender === 'Male' || gender === 'Masculin' ? '👨' : '👩';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Patient',
      width: 250,
      renderCell: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: COLORS.primary }}>
            {getGenderIcon(row.gender)} 
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.name || `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Name not available'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.age || 0} years old • {row.gender === 'Masculin' ? 'Male' : row.gender === 'Féminin' ? 'Female' : row.gender || 'Not specified'}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      renderCell: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmailIcon sx={{ mr: 1, color: COLORS.secondary, fontSize: '1rem' }} />
          <Typography variant="body2">{value || 'Email not available'}</Typography>
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (value) => (
        <Chip 
          label={getStatusLabel(value)} 
          color={getStatusColor(value)}
          size="small"
        />
      )
    },
    {
      field: 'consultationsCount',
      headerName: 'Consultations',
      width: 100,
      align: 'center',
      renderCell: (value) => (
        <Typography variant="body2" fontWeight={500}>
          {value || 0}
        </Typography>
      )
    },
    {
      field: 'totalSpent',
      headerName: 'Total Spent',
      width: 120,
      align: 'right',
      renderCell: (value) => (
        <Typography variant="body2" fontWeight={600} color="success.main">
          {formatCurrency(value)}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      align: 'center',
      renderCell: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Navigating to patient:', row.id);
              navigate(`/patients/${row.id}`);
            }}
            sx={{
              borderRadius: 2,
              borderColor: COLORS.primary,
              color: COLORS.primary,
              '&:hover': {
                borderColor: COLORS.primary,
                bgcolor: alpha(COLORS.primary, 0.1)
              }
            }}
          >
            View
          </Button>
        </Box>
      )
    }
  ];

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPatient(null);
  };

  const handleRowClick = (patient) => {
    console.log('Row click on patient:', patient.id);
    navigate(`/patients/${patient.id}`);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDeletePatient = async () => {
    if (!selectedPatient) return;
    
    try {
      await patientsService.deletePatient(selectedPatient.id);
      // Update list by removing deleted patient
      setPatients(patients.filter(p => p.id !== selectedPatient.id));
      handleMenuClose();
    } catch (err) {
      console.error('Error deleting patient:', err);
      setError('Error deleting patient');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={50} color="primary" />
        <Typography variant="body1" color="text.secondary">
          Loading patients data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ borderRadius: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Box className="patients-page" sx={{ py: 2 }}>
        <Box className="page-header" sx={{ mb: 6 }}>
          <Typography variant="h4" className="page-title" sx={{ fontWeight: 700, mb: 1.5, color: COLORS.primary }}>
            Patients
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all patients on the platform
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total Patients"
              value={stats.total}
              icon={PeopleIcon}
              color={COLORS.primary}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Active Patients"
              value={stats.active}
              icon={PersonAddIcon}
              color={COLORS.secondary}
              secondaryText={`Average age: ${stats.avgAge} years`}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Consultations"
              value={stats.totalConsultations}
              icon={DoctorIcon}
              color={COLORS.accent}
              secondaryText={`Average: ${stats.active > 0 ? Math.round(stats.totalConsultations / stats.active) : 0} per patient`}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Generated Revenue"
              value={formatCurrency(stats.totalRevenue)}
              icon={FinanceIcon}
              color={COLORS.tertiary}
              secondaryText="+18.7%"
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            className="filter-tabs"
            TabIndicatorProps={{
              style: { display: 'none' }
            }}
            sx={{ 
              '& .MuiTab-root': {
                color: '#555',
                borderRadius: 1.5,
                mx: 0.5,
                textTransform: 'none',
                fontWeight: 500,
                minHeight: '36px',
                padding: '8px 16px',
                '&.Mui-selected': {
                  color: '#fff',
                  backgroundColor: COLORS.tabActive,
                }
              }
            }}
          >
            <Tab label={`All (${stats.total})`} />
            <Tab label={`Active (${stats.active})`} />
            <Tab label={`Inactive (${stats.inactive})`} />
            <Tab label={`Pending (${stats.pending})`} />
          </Tabs>
        </Box>

        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <DataTable
            data={filteredPatients}
            columns={columns}
            searchable={true}
            searchPlaceholder="Search patients..."
            onRowClick={handleRowClick}
            loading={false}
            exportable={false}
          />
        </Card>

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => { 
            navigate(`/patients/${selectedPatient?.id}`);
            handleMenuClose(); 
          }}>
            View Full Profile
          </MenuItem>
          <MenuItem onClick={() => { 
            handleMenuClose(); 
          }}>
            Edit Information
          </MenuItem>
          <MenuItem onClick={() => { 
            handleMenuClose(); 
          }}>
            View Finances
          </MenuItem>
          <MenuItem onClick={() => {
            handleDeletePatient();
          }}>
            Archive Patient
          </MenuItem>
        </Menu>
      </Box>
    </Container>
  );
};

export default PatientsList;