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
        console.log('🔄 Chargement des médecins...');
        const doctorsData = await doctorsService.getAllDoctors();
        console.log('✅ Médecins chargés:', doctorsData);
        setDoctors(doctorsData);
      } catch (err) {
        console.error('❌ Erreur lors de la récupération des médecins:', err);
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
      ? doctors.filter(d => d.verified || d.status === 'verified')
      : doctors.filter(d => !d.verified && d.status !== 'verified');

  // Stats calculées
  const stats = {
    total: doctors.length,
    verified: doctors.filter(d => d.verified || d.status === 'verified').length,
    pending: doctors.filter(d => !d.verified && d.status !== 'verified').length,
    totalPatients: doctors.reduce((sum, d) => sum + (d.patients || 0), 0)
  };

  const getStatusColor = (doctor) => {
    const isVerified = doctor.verified || doctor.status === 'verified';
    return isVerified ? 'success' : 'warning';
  };

  const getStatusLabel = (doctor) => {
    const isVerified = doctor.verified || doctor.status === 'verified';
    return isVerified ? 'Vérifié' : 'En attente';
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Médecin',
      width: 250,
      renderCell: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: '#2563eb' }}>
            {row.initials || 
             (row.fullName ? row.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) : 'DR')}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.displayName || `Dr. ${row.fullName || row.name || 'Nom non disponible'}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.specialty || row.specialization || 'Spécialité non définie'}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      renderCell: (value, row) => (
        <Typography variant="body2">
          {row.email || 'Non disponible'}
        </Typography>
      )
    },
    {
      field: 'gender',
      headerName: 'Genre',
      width: 100,
      renderCell: (value, row) => (
        <Typography variant="body2">
          {row.gender || 'Non spécifié'}
        </Typography>
      )
    },
    {
      field: 'experience',
      headerName: 'Expérience',
      width: 120,
      renderCell: (value, row) => (
        <Typography variant="body2">
          {row.experience ? `${row.experience} ans` : 'N/A'}
        </Typography>
      )
    },
    {
      field: 'price',
      headerName: 'Prix',
      width: 100,
      align: 'right',
      renderCell: (value, row) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {row.price ? `${row.price}€` : 'N/A'}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Statut',
      width: 120,
      renderCell: (value, row) => (
        <Chip 
          label={getStatusLabel(row)} 
          color={getStatusColor(row)}
          size="small"
          icon={row.verified || row.status === 'verified' ? <VerifiedIcon /> : <PendingIcon />}
        />
      )
    },
    {
      field: 'patients',
      headerName: 'Patients',
      width: 100,
      align: 'center',
      renderCell: (value, row) => (
        <Typography variant="body2" fontWeight={500}>
          {row.patients || 0}
        </Typography>
      )
    },
    {
      field: 'rating',
      headerName: 'Note',
      width: 80,
      align: 'center',
      renderCell: (value, row) => (
        row.rating ? (
          <Typography variant="body2" fontWeight={500}>
            ⭐ {row.rating}
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
          {!(row.verified || row.status === 'verified') ? (
            <Button
              size="small"
              variant="contained"
              color="warning"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/doctors/${row._id || row.id}/review`);
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
                navigate(`/doctors/${row._id || row.id}`);
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
    if (doctor.verified || doctor.status === 'verified') {
      navigate(`/doctors/${doctor._id || doctor.id}`);
    } else {
      navigate(`/doctors/${doctor._id || doctor.id}/review`);
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
      const updatedDoctor = { ...selectedDoctor, verified: true, status: 'verified' };
      await doctorsService.updateDoctor(selectedDoctor._id || selectedDoctor.id, updatedDoctor);
      
      // Mettre à jour la liste locale
      setDoctors(doctors.map(doc => 
        (doc._id || doc.id) === (selectedDoctor._id || selectedDoctor.id) 
          ? {...doc, verified: true, status: 'verified'} 
          : doc
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
      await doctorsService.deleteDoctor(selectedDoctor._id || selectedDoctor.id);
      
      // Mettre à jour la liste en retirant le médecin supprimé
      setDoctors(doctors.filter(doc => (doc._id || doc.id) !== (selectedDoctor._id || selectedDoctor.id)));
      
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
        loading={false}
        exportable={true}
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
          navigate(`/doctors/${selectedDoctor?._id || selectedDoctor?.id}`);
          handleMenuClose(); 
        }}>
          Voir le profil complet
        </MenuItem>
        <MenuItem onClick={() => { 
          console.log('Edit doctor'); 
          handleMenuClose(); 
        }}>
          Modifier les informations
        </MenuItem>
        {selectedDoctor && !(selectedDoctor.verified || selectedDoctor.status === 'verified') && (
          <MenuItem onClick={() => {
            handleVerifyDoctor();
          }}>
            Vérifier
          </MenuItem>
        )}
        {selectedDoctor && !(selectedDoctor.verified || selectedDoctor.status === 'verified') && (
          <MenuItem onClick={() => { 
            navigate(`/doctors/${selectedDoctor._id || selectedDoctor.id}/review`);
            handleMenuClose(); 
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