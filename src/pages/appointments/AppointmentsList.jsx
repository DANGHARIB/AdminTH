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
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocalHospital as DoctorIcon
} from '@mui/icons-material';
import { appointmentsService } from '../../services';
import DataTable from '../../components/common/DataTable';
import './AppointmentsList.css';

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const appointmentsData = await appointmentsService.getAllAppointments();
        setAppointments(appointmentsData);
      } catch (err) {
        console.error('Erreur lors de la récupération des rendez-vous:', err);
        setError(err.message || 'Une erreur s\'est produite lors du chargement des rendez-vous');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Stats calculées
  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
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
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'urgence': return 'error';
      case 'controle': return 'info';
      case 'consultation': return 'primary';
      default: return 'default';
    }
  };

  const columns = [
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      renderCell: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarIcon sx={{ fontSize: 16, color: '#6b7280' }} />
          <Typography variant="body2">
            {new Date(value).toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: '2-digit' 
            })}
          </Typography>
        </Box>
      )
    },
    {
      field: 'time',
      headerName: 'Heure',
      width: 100,
      renderCell: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimeIcon sx={{ fontSize: 16, color: '#6b7280' }} />
          <Typography variant="body2">{value}</Typography>
        </Box>
      )
    },
    {
      field: 'patient',
      headerName: 'Patient',
      width: 200,
      renderCell: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>
            {value && value.name ? value.name.charAt(0) : 'P'}
          </Avatar>
          <Typography variant="body2">{value && value.name ? value.name : 'Patient inconnu'}</Typography>
        </Box>
      )
    },
    {
      field: 'doctor',
      headerName: 'Médecin',
      width: 220,
      renderCell: (value) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {value && value.name ? value.name : 'Médecin inconnu'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {value && value.specialty ? value.specialty : ''}
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
          label={value || 'N/A'} 
          color={getTypeColor(value)}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'status',
      headerName: 'Statut',
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
      headerName: 'Durée',
      width: 80,
      renderCell: (value) => `${value || 0}min`
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      align: 'center',
      renderCell: (value, row) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedAppointment(row);
            setAnchorEl(e.currentTarget);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      )
    }
  ];

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRowClick = (appointment) => {
    console.log('Appointment clicked:', appointment);
    // Naviguer vers les détails du rendez-vous si nécessaire
  };

  const handleAddAppointment = () => {
    console.log('Add appointment clicked');
    // Naviguer vers la page de création de rendez-vous
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      await appointmentsService.deleteAppointment(selectedAppointment.id);
      setAppointments(appointments.filter(appt => appt.id !== selectedAppointment.id));
      handleMenuClose();
    } catch (err) {
      console.error('Erreur lors de la suppression du rendez-vous:', err);
      setError(err.message || 'Une erreur s\'est produite');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
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
        >
          Réessayer
        </Button>
      </Box>
    );
  }

  return (
    <Box className="appointments-page">
      <Box className="page-header">
        <Box>
          <Typography variant="h4" className="page-title">
            Rendez-vous
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez tous les rendez-vous de la plateforme
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="add-button"
          onClick={handleAddAppointment}
        >
          Nouveau RDV
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total
                  </Typography>
                </Box>
                <CalendarIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card confirmed">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {stats.confirmed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Confirmés
                  </Typography>
                </Box>
                <CalendarIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card pending">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    En attente
                  </Typography>
                </Box>
                <TimeIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card completed">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {stats.completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Terminés
                  </Typography>
                </Box>
                <CalendarIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <DataTable
        data={appointments}
        columns={columns}
        searchable={true}
        onRowClick={handleRowClick}
        loading={loading}
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>
          Voir les détails
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Modifier
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Changer le statut
        </MenuItem>
        <MenuItem onClick={handleDeleteAppointment}>
          Supprimer
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AppointmentsList;