import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  LocalHospital as DoctorIcon,
  Verified as VerifiedIcon,
  Schedule as PendingIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import DataTable from '../../components/common/DataTable';
import { doctorsService } from '../../services';
import './DoctorsList.css';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const doctorsData = await doctorsService.getAllDoctors();
        setDoctors(doctorsData);
      } catch (err) {
        console.error('Erreur lors de la récupération des médecins:', err);
        setError(err.message || 'Une erreur s\'est produite lors du chargement des médecins');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Filtrer les médecins selon l'onglet actif
  const filteredDoctors = activeTab === 0 
    ? doctors 
    : activeTab === 1 
      ? doctors.filter(d => d.status === 'verified')
      : doctors.filter(d => d.status === 'pending');

  // Stats calculées
  const stats = {
    total: doctors.length,
    verified: doctors.filter(d => d.status === 'verified').length,
    pending: doctors.filter(d => d.status === 'pending').length,
    totalPatients: doctors.reduce((sum, d) => sum + (d.patients || 0), 0)
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'verified': return 'Vérifié';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Médecin',
      width: 250,
      renderCell: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: '#2563eb' }}>
            {row.firstName && row.lastName 
              ? `${row.firstName.charAt(0)}${row.lastName.charAt(0)}`
              : value ? value.split(' ').map(n => n[0]).join('') : 'DR'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.firstName && row.lastName 
                ? `Dr. ${row.firstName} ${row.lastName}`
                : value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.specialty}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200
    },
    {
      field: 'gender',
      headerName: 'Genre',
      width: 100
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
          icon={value === 'verified' ? <VerifiedIcon /> : <PendingIcon />}
        />
      )
    },
    {
      field: 'patients',
      headerName: 'Patients',
      width: 100,
      align: 'center',
      renderCell: (value) => (
        <Typography variant="body2" fontWeight={500}>
          {value || 0}
        </Typography>
      )
    },
    {
      field: 'rating',
      headerName: 'Note',
      width: 80,
      align: 'center',
      renderCell: (value) => (
        value ? (
          <Typography variant="body2" fontWeight={500}>
            ⭐ {value}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        )
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      align: 'center',
      renderCell: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {row.status === 'pending' ? (
            <Button
              size="small"
              variant="contained"
              color="warning"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/doctors/${row.id}/review`);
              }}
            >
              Réviser
            </Button>
          ) : (
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/doctors/${row.id}`);
              }}
            >
              Voir
            </Button>
          )}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDoctor(row);
              setAnchorEl(e.currentTarget);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRowClick = (doctor) => {
    if (doctor.status === 'pending') {
      navigate(`/doctors/${doctor.id}/review`);
    } else {
      navigate(`/doctors/${doctor.id}`);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddDoctor = () => {
    navigate('/doctors/new');
  };

  const handleVerifyDoctor = async () => {
    if (!selectedDoctor) return;
    
    try {
      const updatedDoctor = { ...selectedDoctor, status: 'verified' };
      await doctorsService.updateDoctor(selectedDoctor.id, updatedDoctor);
      
      // Mettre à jour la liste locale
      setDoctors(doctors.map(doc => 
        doc.id === selectedDoctor.id ? {...doc, status: 'verified'} : doc
      ));
      
      handleMenuClose();
    } catch (err) {
      console.error('Erreur lors de la vérification du médecin:', err);
      setError(err.message || 'Une erreur s\'est produite');
    }
  };

  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return;
    
    try {
      await doctorsService.deleteDoctor(selectedDoctor.id);
      
      // Mettre à jour la liste en retirant le médecin supprimé
      setDoctors(doctors.filter(doc => doc.id !== selectedDoctor.id));
      
      handleMenuClose();
    } catch (err) {
      console.error('Erreur lors de la suppression du médecin:', err);
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
    <Box className="doctors-page">
      <Box className="page-header">
        <Box>
          <Typography variant="h4" className="page-title">
            Médecins
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez les médecins de la plateforme
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="add-button"
          onClick={handleAddDoctor}
        >
          Ajouter un médecin
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
                    Total médecins
                  </Typography>
                </Box>
                <DoctorIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card verified">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {stats.verified}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vérifiés
                  </Typography>
                </Box>
                <VerifiedIcon className="stat-icon" />
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
                <PendingIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card patients">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {stats.totalPatients}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total patients
                  </Typography>
                </Box>
                <PersonIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          className="filter-tabs"
        >
          <Tab label={`Tous (${stats.total})`} />
          <Tab label={`Vérifiés (${stats.verified})`} />
          <Tab label={`En attente (${stats.pending})`} />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <DataTable
        data={filteredDoctors}
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
        <MenuItem onClick={() => { 
          navigate(`/doctors/${selectedDoctor?.id}`);
          handleMenuClose(); 
        }}>
          Voir le profil
        </MenuItem>
        <MenuItem onClick={() => { 
          console.log('Edit doctor'); 
          handleMenuClose(); 
        }}>
          Modifier
        </MenuItem>
        {selectedDoctor?.status === 'pending' && (
          <MenuItem onClick={() => {
            handleVerifyDoctor();
          }}>
            Réviser
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          handleDeleteDoctor();
        }}>
          Supprimer
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DoctorsList;