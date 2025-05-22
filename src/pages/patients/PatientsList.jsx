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
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  LocalHospital as DoctorIcon,
  AccountBalance as FinanceIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { patientsService } from '../../services';
import DataTable from '../../components/common/DataTable';
import './PatientsList.css';

const PatientsList = () => {
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
        console.log('Récupération des patients...');
        const patientsData = await patientsService.getAllPatients();
        console.log('Patients reçus:', patientsData);
        setPatients(patientsData);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des patients:', err);
        setError(err.message || 'Une erreur s\'est produite lors du chargement des patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filtrer les patients selon l'onglet actif
  const filteredPatients = activeTab === 0 
    ? patients 
    : activeTab === 1 
      ? patients.filter(p => p.status === 'active')
      : activeTab === 2
        ? patients.filter(p => p.status === 'inactive')
        : patients.filter(p => p.status === 'pending');

  // Stats calculées avec vérification des données
  const stats = {
    total: patients.length,
    active: patients.filter(p => p.status === 'active').length,
    inactive: patients.filter(p => p.status === 'inactive').length,
    pending: patients.filter(p => p.status === 'pending').length,
    totalRevenue: patients.reduce((sum, p) => sum + (p.totalSpent || 0), 0),
    avgAge: patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + (p.age || 0), 0) / patients.length) : 0,
    totalConsultations: patients.reduce((sum, p) => sum + (p.consultationsCount || 0), 0)
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
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'pending': return 'En attente';
      default: return status || 'Inconnu';
    }
  };

  const getGenderIcon = (gender) => {
    if (!gender) return '👤';
    return gender === 'Masculin' ? '👨' : '👩';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const calculateDaysSinceLastConsultation = (lastConsultation) => {
    if (!lastConsultation) return 'Aucune';
    const today = new Date();
    const last = new Date(lastConsultation);
    const diffTime = Math.abs(today - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 30) return `Il y a ${diffDays} jours`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return `Il y a ${Math.floor(diffDays / 365)} ans`;
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Patient',
      width: 250,
      renderCell: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: '#2563eb' }}>
            {getGenderIcon(row.gender)} 
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.name || `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Nom non disponible'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.age || 0} ans • {row.gender || 'Non spécifié'}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'email',
      headerName: 'Contact',
      width: 200,
      renderCell: (value, row) => (
        <Box>
          <Typography variant="body2">{value || 'Email non disponible'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.phone || 'Téléphone non disponible'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'assignedDoctor',
      headerName: 'Médecin traitant',
      width: 180,
      renderCell: (value) => (
        value ? (
          <Typography variant="body2">{value}</Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            Non assigné
          </Typography>
        )
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
      field: 'lastConsultation',
      headerName: 'Dernière consultation',
      width: 160,
      renderCell: (value) => (
        <Typography variant="body2" color={value ? 'inherit' : 'text.secondary'}>
          {calculateDaysSinceLastConsultation(value)}
        </Typography>
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
      headerName: 'Total dépensé',
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
      width: 120,
      align: 'center',
      renderCell: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Navigation vers patient:', row.id);
              navigate(`/patients/${row.id}`);
            }}
          >
            Voir
          </Button>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleMenuOpen(e, row);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  const handleMenuOpen = (event, patient) => {
    setAnchorEl(event.currentTarget);
    setSelectedPatient(patient);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPatient(null);
  };

  const handleRowClick = (patient) => {
    console.log('Clic sur la ligne patient:', patient.id);
    navigate(`/patients/${patient.id}`);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddPatient = () => {
    navigate('/patients/new');
  };

  const handleDeletePatient = async () => {
    if (!selectedPatient) return;
    
    try {
      await patientsService.deletePatient(selectedPatient.id);
      // Mettre à jour la liste en retirant le patient supprimé
      setPatients(patients.filter(p => p.id !== selectedPatient.id));
      handleMenuClose();
    } catch (err) {
      console.error('Erreur lors de la suppression du patient:', err);
      setError('Erreur lors de la suppression du patient');
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
    <Box className="patients-page">
      <Box className="page-header">
        <Box>
          <Typography variant="h4" className="page-title">
            Patients
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez tous les patients de la plateforme
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="add-button"
          onClick={handleAddPatient}
        >
          Ajouter un patient
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
                    Total patients
                  </Typography>
                </Box>
                <PeopleIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card active">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {stats.active}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Patients actifs
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Âge moyen: {stats.avgAge} ans
                  </Typography>
                </Box>
                <PersonAddIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card consultations">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {stats.totalConsultations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Consultations
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Moyenne: {stats.active > 0 ? Math.round(stats.totalConsultations / stats.active) : 0} par patient
                  </Typography>
                </Box>
                <DoctorIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card revenue">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {formatCurrency(stats.totalRevenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revenus générés
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" color="success.main">
                      +18.7%
                    </Typography>
                  </Box>
                </Box>
                <FinanceIcon className="stat-icon" />
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
          <Tab label={`Actifs (${stats.active})`} />
          <Tab label={`Inactifs (${stats.inactive})`} />
          <Tab label={`En attente (${stats.pending})`} />
        </Tabs>
      </Box>

      {/* Debug info en mode développement */}
      {import.meta.env.DEV && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Debug: {patients.length} patients chargés. Premier patient ID: {patients[0]?.id}
        </Alert>
      )}

      <DataTable
        data={filteredPatients}
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
          console.log('Navigation menu vers patient:', selectedPatient?.id);
          navigate(`/patients/${selectedPatient?.id}`);
          handleMenuClose(); 
        }}>
          Voir le profil complet
        </MenuItem>
        <MenuItem onClick={() => { 
          console.log('Edit patient'); 
          handleMenuClose(); 
        }}>
          Modifier les informations
        </MenuItem>
        <MenuItem onClick={() => { 
          console.log('View medical history'); 
          handleMenuClose(); 
        }}>
          Consulter l'historique médical
        </MenuItem>
        <MenuItem onClick={() => { 
          console.log('View finances'); 
          handleMenuClose(); 
        }}>
          Voir les finances
        </MenuItem>
        <MenuItem onClick={() => { 
          console.log('Send message'); 
          handleMenuClose(); 
        }}>
          Envoyer un message
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeletePatient();
        }}>
          Archiver le patient
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PatientsList;