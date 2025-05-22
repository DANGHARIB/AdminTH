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

  const calculateDaysSinceLastConsultation = (lastConsultation) => {
    if (!lastConsultation) return 'None';
    const today = new Date();
    const last = new Date(lastConsultation);
    const diffTime = Math.abs(today - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
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
      headerName: 'Contact',
      width: 200,
      renderCell: (value, row) => (
        <Box>
          <Typography variant="body2">{value || 'Email not available'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.phone || 'Phone not available'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'assignedDoctor',
      headerName: 'Primary Doctor',
      width: 180,
      renderCell: (value) => (
        value ? (
          <Typography variant="body2">{value}</Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            Not assigned
          </Typography>
        )
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
      field: 'lastConsultation',
      headerName: 'Last Consultation',
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
      width: 120,
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
          >
            View
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
    console.log('Row click on patient:', patient.id);
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
          Retry
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
            Manage all patients on the platform
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="add-button"
          onClick={handleAddPatient}
        >
          Add Patient
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
                    Total Patients
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
                    Active Patients
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Average age: {stats.avgAge} years
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
                    Average: {stats.active > 0 ? Math.round(stats.totalConsultations / stats.active) : 0} per patient
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
                    Generated Revenue
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
          <Tab label={`All (${stats.total})`} />
          <Tab label={`Active (${stats.active})`} />
          <Tab label={`Inactive (${stats.inactive})`} />
          <Tab label={`Pending (${stats.pending})`} />
        </Tabs>
      </Box>

      {/* Debug info in development mode */}
      {import.meta.env.DEV && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Debug: {patients.length} patients loaded. First patient ID: {patients[0]?.id}
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
          console.log('Menu navigation to patient:', selectedPatient?.id);
          navigate(`/patients/${selectedPatient?.id}`);
          handleMenuClose(); 
        }}>
          View Full Profile
        </MenuItem>
        <MenuItem onClick={() => { 
          console.log('Edit patient'); 
          handleMenuClose(); 
        }}>
          Edit Information
        </MenuItem>
        <MenuItem onClick={() => { 
          console.log('View medical history'); 
          handleMenuClose(); 
        }}>
          View Medical History
        </MenuItem>
        <MenuItem onClick={() => { 
          console.log('View finances'); 
          handleMenuClose(); 
        }}>
          View Finances
        </MenuItem>
        <MenuItem onClick={() => { 
          console.log('Send message'); 
          handleMenuClose(); 
        }}>
          Send Message
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeletePatient();
        }}>
          Archive Patient
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PatientsList;