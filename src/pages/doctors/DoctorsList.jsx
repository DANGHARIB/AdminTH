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
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Snackbar
} from '@mui/material';
import {
  LocalHospital as DoctorIcon,
  Verified as VerifiedIcon,
  Schedule as PendingIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import DataTable from '../../components/common/DataTable';
import { doctorsService } from '../../services';
import './DoctorsList.css';

// Color palette consistent with dashboard
const COLORS = {
  primary: '#325A80',
  secondary: '#4A6F94', 
  tertiary: '#2A4A6B',
  lightBlue: '#5D8CAF',
  accent: '#4773A8',
  tabActive: '#4169E1',
  success: '#2E7D32',
  warning: '#ED6C02'
};

const DoctorsList = () => {
  // eslint-disable-next-line no-unused-vars
  const theme = useTheme();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  // États pour la vérification/rejet des médecins
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        console.log('Loading doctors...');
        const doctorsData = await doctorsService.getAllDoctorsWithPatientCount();
        console.log('Doctors loaded:', doctorsData);
        setDoctors(doctorsData);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError(err.message || 'An error occurred while loading doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Filter doctors based on active tab
  const filteredDoctors =
    activeTab === 0
      ? doctors
      : activeTab === 1
      ? doctors.filter(d => d.verified || d.status === 'verified')
      : doctors.filter(d => !d.verified && d.status !== 'verified');

  // Calculated stats
  const stats = {
    total: doctors.length,
    verified: doctors.filter(d => d.verified || d.status === 'verified').length,
    pending: doctors.filter(d => !d.verified && d.status !== 'verified').length,
    totalPatients: doctors.reduce((sum, d) => sum + (d.patientCount || 0), 0)
  };

  // StatCard component consistent with Dashboard
  // eslint-disable-next-line no-unused-vars
  const StatCard = ({ title, value, icon: Icon, secondaryText, onClick, color }) => {
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
                {value.toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500, mb: 1, fontSize: '1rem' }}>
                {title}
              </Typography>
              {secondaryText && (
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.85rem' }}>
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

  const getStatusColor = doctor => {
    const isVerified = doctor.verified || doctor.status === 'verified';
    return isVerified ? 'success' : 'warning';
  };

  const getStatusLabel = doctor => {
    const isVerified = doctor.verified || doctor.status === 'verified';
    return isVerified ? 'Verified' : 'Pending';
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Doctor',
      width: 250,
      renderCell: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: COLORS.primary }}>
            {row.initials ||
              (row.fullName
                ? row.fullName
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)
                : 'DR')}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.displayName || `Dr. ${row.fullName || row.name || 'Unknown'}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.specialty || row.specialization || 'No specialty defined'}
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
          {row.email || 'Not available'}
        </Typography>
      )
    },
    {
      field: 'experience',
      headerName: 'Experience',
      width: 120,
      renderCell: (value, row) => (
        <Typography variant="body2">
          {row.experience ? `${row.experience} yrs` : 'N/A'}
        </Typography>
      )
    },
    {
      field: 'price',
      headerName: 'Fee',
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
      headerName: 'Status',
      width: 120,
      renderCell: (value, row) => (
        <Chip
          label={getStatusLabel(row)}
          color={getStatusColor(row)}
          size="small"
          icon={
            row.verified || row.status === 'verified' ? (
              <VerifiedIcon />
            ) : (
              <PendingIcon />
            )
          }
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
          {row.patientCount || 0}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 220,
      align: 'center',
      renderCell: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!(row.verified || row.status === 'verified') ? (
            <>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
                onClick={e => {
                  e.stopPropagation();
                  handleVerifyDoctor(row);
                }}
                disabled={processingAction}
                sx={{
                  borderRadius: 2,
                  color: '#fff',
                }}
              >
                Verify
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<CloseIcon />}
                onClick={e => {
                  e.stopPropagation();
                  handleOpenRejectDialog(row);
                }}
                disabled={processingAction}
                sx={{
                  borderRadius: 2,
                  color: '#fff',
                }}
              >
                Reject
              </Button>
            </>
          ) : (
            <Button
              size="small"
              variant="outlined"
              onClick={e => {
                e.stopPropagation();
                navigate(`/doctors/${row._id || row.id}`);
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
          )}
        </Box>
      )
    }
  ];

  // Assurez-vous que les données ont un identifiant valide pour React
  const doctorsWithValidId = filteredDoctors.map(doctor => {
    // Assurez-vous que l'objet doctor a un id valide
    if (!doctor.id && doctor._id) {
      return { 
        ...doctor, 
        id: doctor._id,
        // S'assurer que toutes les propriétés qui pourraient être des objets sont convertis en chaînes
        name: typeof doctor.name === 'object' ? (doctor.name._id ? doctor.name._id.toString() : JSON.stringify(doctor.name)) : doctor.name,
        fullName: typeof doctor.fullName === 'object' ? (doctor.fullName._id ? doctor.fullName._id.toString() : JSON.stringify(doctor.fullName)) : doctor.fullName,
        displayName: typeof doctor.displayName === 'object' ? (doctor.displayName._id ? doctor.displayName._id.toString() : JSON.stringify(doctor.displayName)) : doctor.displayName
      };
    }
    // S'assurer que les propriétés des docteurs existants sont aussi des chaînes si nécessaire
    return {
      ...doctor,
      name: typeof doctor.name === 'object' ? (doctor.name._id ? doctor.name._id.toString() : JSON.stringify(doctor.name)) : doctor.name,
      fullName: typeof doctor.fullName === 'object' ? (doctor.fullName._id ? doctor.fullName._id.toString() : JSON.stringify(doctor.fullName)) : doctor.fullName,
      displayName: typeof doctor.displayName === 'object' ? (doctor.displayName._id ? doctor.displayName._id.toString() : JSON.stringify(doctor.displayName)) : doctor.displayName
    };
  });

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRowClick = doctor => {
    navigate(`/doctors/${doctor._id || doctor.id}`);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Fonctions pour la vérification/rejet des médecins
  const handleOpenRejectDialog = (doctor) => {
    setSelectedDoctor(doctor);
    setRejectionReason('');
    setOpenRejectDialog(true);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
  };

  const handleVerifyDoctor = async (doctor) => {
    try {
      setProcessingAction(true);
      const doctorId = doctor._id || doctor.id;
      console.log(`Vérification du médecin ${doctorId}...`);
      
      await doctorsService.verifyDoctor(doctorId);
      
      // Mettre à jour la liste des médecins
      setDoctors(prevDoctors => 
        prevDoctors.map(d => 
          (d._id || d.id) === doctorId 
            ? { ...d, verified: true, status: 'verified' } 
            : d
        )
      );
      
      setSnackbar({
        open: true,
        message: `Dr. ${doctor.fullName || 'Le médecin'} a été vérifié avec succès.`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Erreur lors de la vérification du médecin:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Une erreur est survenue lors de la vérification du médecin.',
        severity: 'error'
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectDoctor = async () => {
    if (!rejectionReason.trim()) {
      setSnackbar({
        open: true,
        message: 'Veuillez fournir une raison pour le rejet.',
        severity: 'warning'
      });
      return;
    }
    
    try {
      setProcessingAction(true);
      const doctorId = selectedDoctor._id || selectedDoctor.id;
      console.log(`Rejet du médecin ${doctorId} avec raison: ${rejectionReason}`);
      
      await doctorsService.rejectDoctor(doctorId, rejectionReason);
      
      // Mettre à jour la liste des médecins
      setDoctors(prevDoctors => 
        prevDoctors.map(d => 
          (d._id || d.id) === doctorId 
            ? { ...d, verified: false, status: 'rejected', rejectionReason } 
            : d
        )
      );
      
      setSnackbar({
        open: true,
        message: `Dr. ${selectedDoctor.fullName || 'Le médecin'} a été rejeté avec succès.`,
        severity: 'success'
      });
      
      handleCloseRejectDialog();
    } catch (err) {
      console.error('Erreur lors du rejet du médecin:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Une erreur est survenue lors du rejet du médecin.',
        severity: 'error'
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeleteDoctor = async (doctor) => {
    if (!doctor) return;
    
    try {
      setProcessingAction(true);
      const doctorId = doctor._id || doctor.id;
      console.log(`Suppression du médecin ${doctorId}...`);
      
      await doctorsService.deleteDoctor(doctorId);
      
      // Supprimer le médecin de la liste
      setDoctors(prevDoctors => 
        prevDoctors.filter(d => (d._id || d.id) !== doctorId)
      );
      
      setSnackbar({
        open: true,
        message: `Dr. ${doctor.fullName || 'Le médecin'} a été supprimé avec succès.`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Erreur lors de la suppression du médecin:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Une erreur est survenue lors de la suppression du médecin.',
        severity: 'error'
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
          Loading doctors data...
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
      <Box className="doctors-page" sx={{ py: 2 }}>
        <Box className="page-header" sx={{ mb: 6 }}>
          <Typography variant="h4" className="page-title" sx={{ fontWeight: 700, mb: 1.5, color: COLORS.primary }}>
            Doctors
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage the platform's doctors
          </Typography>
      </Box>

      {/* Statistics Cards */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total Doctors"
              value={stats.total}
              icon={DoctorIcon}
              color={COLORS.primary}
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Verified"
              value={stats.verified}
              icon={VerifiedIcon}
              color={COLORS.secondary}
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Pending"
              value={stats.pending}
              icon={PendingIcon}
              color={COLORS.accent}
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Total Patients"
              value={stats.totalPatients}
              icon={PersonIcon}
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
          <Tab label={`Verified (${stats.verified})`} />
          <Tab label={`Pending (${stats.pending})`} />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <DataTable
        data={doctorsWithValidId}
        columns={columns}
        searchable
        searchPlaceholder="Search..."
        onRowClick={handleRowClick}
        loading={false}
        exportable={false}
      />

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
        severity={snackbar.severity}
      />

      {/* Boîte de dialogue pour le rejet d'un médecin */}
      <Dialog
        open={openRejectDialog}
        onClose={handleCloseRejectDialog}
        aria-labelledby="reject-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="reject-dialog-title">
          Rejeter Dr. {selectedDoctor?.fullName || selectedDoctor?.name || 'ce médecin'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Veuillez fournir une raison pour le rejet. Cette raison sera incluse dans l'email envoyé au médecin.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="rejection-reason"
            label="Raison du rejet"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog} disabled={processingAction}>
            Annuler
          </Button>
          <Button 
            onClick={handleRejectDoctor} 
            color="error" 
            variant="contained"
            disabled={processingAction || !rejectionReason.trim()}
          >
            {processingAction ? 'Traitement en cours...' : 'Rejeter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            navigate(`/doctors/${selectedDoctor?._id || selectedDoctor?.id}`);
            handleMenuClose();
          }}
        >
          View Full Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            console.log('Edit doctor');
            handleMenuClose();
          }}
        >
          Edit Details
        </MenuItem>
        {selectedDoctor && !(selectedDoctor.verified || selectedDoctor.status === 'verified') && (
          <MenuItem onClick={() => {
            handleVerifyDoctor(selectedDoctor);
            handleMenuClose();
          }}>
            Verify
          </MenuItem>
        )}
        {selectedDoctor && !(selectedDoctor.verified || selectedDoctor.status === 'verified') && (
          <MenuItem
            onClick={() => {
              navigate(`/doctors/${selectedDoctor._id || selectedDoctor.id}/review`);
              handleMenuClose();
            }}
          >
            Review
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          handleDeleteDoctor(selectedDoctor);
          handleMenuClose();
        }}>
          Delete
        </MenuItem>
      </Menu>
    </Box>
    </Container>
  );
};

export default DoctorsList;
