import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Container,
  alpha,
  useTheme,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocalHospital as DoctorIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassIcon,
  Cancel as CancelIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { appointmentsService } from '../../services';
import DataTable from '../../components/common/DataTable';
import './AppointmentsList.css';

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

const AppointmentsList = () => {
  const theme = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        console.log('Fetching appointments...');
        const appointmentsData = await appointmentsService.getAllAppointments();
        console.log('Appointments received:', appointmentsData);
        setAppointments(appointmentsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(err.message || 'An error occurred while loading appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Filtered appointments based on active tab
  const filteredAppointments = activeTab === 0 
    ? appointments 
    : activeTab === 1
      ? appointments.filter(a => a.status === 'confirmed')
      : activeTab === 2
        ? appointments.filter(a => a.status === 'pending')
        : activeTab === 3
          ? appointments.filter(a => a.status === 'completed')
          : appointments.filter(a => a.status === 'cancelled');

  // Calculated stats with data verification
  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  // StatCard component consistent with Dashboard
  const StatCard = ({ title, value, icon: Icon, color, secondaryText, onClick }) => {
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
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed': 
      case 'Confirmé': return 'Confirmed';
      case 'pending': 
      case 'En attente': return 'Pending';
      case 'completed': 
      case 'Terminé': return 'Completed';
      case 'cancelled': 
      case 'Annulé': return 'Cancelled';
      default: return status || 'Unknown status';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'urgence': 
      case 'emergency': return 'error';
      case 'controle': 
      case 'checkup': return 'info';
      case 'consultation': return 'primary';
      default: return 'default';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'consultation': 
      case 'Consultation': return 'Consultation';
      case 'urgence': 
      case 'emergency': return 'Emergency';
      case 'controle': 
      case 'checkup': return 'Check-up';
      default: return type || 'N/A';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: '2-digit',
        year: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const columns = [
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      renderCell: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarIcon sx={{ fontSize: 16, color: COLORS.secondary }} />
          <Typography variant="body2">
            {formatDate(value)}
          </Typography>
        </Box>
      )
    },
    {
      field: 'time',
      headerName: 'Time',
      width: 100,
      renderCell: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimeIcon sx={{ fontSize: 16, color: COLORS.secondary }} />
          <Typography variant="body2">{value || 'Time not set'}</Typography>
        </Box>
      )
    },
    {
      field: 'patient',
      headerName: 'Patient',
      width: 200,
      renderCell: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.primary }}>
            {value?.name ? value.name.charAt(0) : 'P'}
          </Avatar>
          <Typography variant="body2" fontWeight={500}>
            {value?.name || 'Unknown patient'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'doctor',
      headerName: 'Doctor',
      width: 220,
      renderCell: (value) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {value?.name || 'Unknown doctor'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {value?.specialty || ''}
          </Typography>
        </Box>
      )
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (value) => (
        <Chip 
          label={getTypeLabel(value)} 
          color={getTypeColor(value)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
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
      field: 'duration',
      headerName: 'Duration',
      width: 80,
      renderCell: (value) => (
        <Typography variant="body2">
          {value || 0} min
        </Typography>
      )
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 90,
      align: 'right',
      renderCell: (value) => (
        <Typography variant="body2" fontWeight={600} color={COLORS.primary}>
          {value ? `$${value}` : 'Free'}
        </Typography>
      )
    }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAppointment(null);
  };

  const handleRowClick = (appointment) => {
    console.log('Appointment clicked:', appointment);
    // Navigate to appointment details if needed
  };

  const handleAddAppointment = () => {
    console.log('Add appointment clicked');
    // Navigate to appointment creation page
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      await appointmentsService.deleteAppointment(selectedAppointment.id);
      setAppointments(appointments.filter(appt => appt.id !== selectedAppointment.id));
      handleMenuClose();
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError('Error deleting appointment');
    }
  };

  const handleChangeStatus = async (newStatus) => {
    if (!selectedAppointment) return;
    
    try {
      const updatedAppointment = await appointmentsService.changeAppointmentStatus(
        selectedAppointment.id, 
        newStatus
      );
      
      // Update local list
      setAppointments(appointments.map(appt => 
        appt.id === selectedAppointment.id ? updatedAppointment : appt
      ));
      
      handleMenuClose();
    } catch (err) {
      console.error('Error changing status:', err);
      setError('Error changing status');
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
          Loading appointments data...
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
      <Box className="appointments-page" sx={{ py: 2 }}>
        <Box className="page-header" sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" className="page-title" sx={{ fontWeight: 700, mb: 1.5, color: COLORS.primary }}>
                Appointments
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage all appointments on the platform
              </Typography>
            </Box>
            
           
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total Appointments"
              value={stats.total}
              icon={CalendarIcon}
              color={COLORS.primary}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Confirmed"
              value={stats.confirmed}
              icon={CheckCircleIcon}
              color={COLORS.secondary}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Pending"
              value={stats.pending}
              icon={HourglassIcon}
              color={COLORS.accent}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Completed"
              value={stats.completed}
              icon={DoctorIcon}
              color={COLORS.tertiary}
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
            <Tab label={`Confirmed (${stats.confirmed})`} />
            <Tab label={`Pending (${stats.pending})`} />
            <Tab label={`Completed (${stats.completed})`} />
            <Tab label={`Cancelled (${stats.cancelled})`} />
          </Tabs>
        </Box>

        

        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <DataTable
            data={filteredAppointments}
            columns={columns}
            searchable={true}
            searchPlaceholder="Search appointments..."
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
          PaperProps={{
            sx: { borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }
          }}
        >
          <MenuItem onClick={() => {
            console.log('View appointment details:', selectedAppointment?.id);
            handleMenuClose();
          }}>
            View Details
          </MenuItem>
          
          <MenuItem onClick={() => {
            console.log('Edit appointment:', selectedAppointment?.id);
            handleMenuClose();
          }}>
            Edit
          </MenuItem>
          
          {/* Status change submenu */}
          {selectedAppointment?.status === 'pending' && (
            <MenuItem onClick={() => handleChangeStatus('confirmed')}>
              Confirm
            </MenuItem>
          )}
          
          {selectedAppointment?.status === 'confirmed' && (
            <MenuItem onClick={() => handleChangeStatus('completed')}>
              Mark as Completed
            </MenuItem>
          )}
          
          {(selectedAppointment?.status === 'pending' || selectedAppointment?.status === 'confirmed') && (
            <MenuItem onClick={() => handleChangeStatus('cancelled')}>
              Cancel
            </MenuItem>
          )}
          
          <MenuItem 
            onClick={handleDeleteAppointment}
            sx={{ color: 'error.main' }}
          >
            Delete
          </MenuItem>
        </Menu>
      </Box>
    </Container>
  );
};

export default AppointmentsList;