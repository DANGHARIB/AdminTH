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
        console.log('Loading doctors...');
        const doctorsData = await doctorsService.getAllDoctors();
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
    totalPatients: doctors.reduce((sum, d) => sum + (d.patients || 0), 0)
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
          <Avatar sx={{ width: 40, height: 40, bgcolor: '#2563eb' }}>
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
      field: 'gender',
      headerName: 'Gender',
      width: 100,
      renderCell: (value, row) => (
        <Typography variant="body2">
          {row.gender || 'Unspecified'}
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
          {row.patients || 0}
        </Typography>
      )
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 80,
      align: 'center',
      renderCell: (value, row) =>
        row.rating ? (
          <Typography variant="body2" fontWeight={500}>
            ⭐ {row.rating}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
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
          {!(row.verified || row.status === 'verified') ? (
            <Button
              size="small"
              variant="contained"
              color="warning"
              onClick={e => {
                e.stopPropagation();
                navigate(`/doctors/${row._id || row.id}/review`);
              }}
            >
              Review
            </Button>
          ) : (
            <Button
              size="small"
              variant="outlined"
              onClick={e => {
                e.stopPropagation();
                navigate(`/doctors/${row._id || row.id}`);
              }}
            >
              View
            </Button>
          )}
          <IconButton
            size="small"
            onClick={e => {
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

  const handleRowClick = doctor => {
    navigate(`/doctors/${doctor._id || doctor.id}`);
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
      const updated = { ...selectedDoctor, verified: true, status: 'verified' };
      await doctorsService.updateDoctor(
        selectedDoctor._id || selectedDoctor.id,
        updated
      );
      setDoctors(doctors.map(doc =>
        (doc._id || doc.id) === (selectedDoctor._id || selectedDoctor.id)
          ? updated
          : doc
      ));
      handleMenuClose();
    } catch (err) {
      console.error('Error verifying doctor:', err);
      setError(err.message || 'An error occurred');
    }
  };

  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return;
    try {
      await doctorsService.deleteDoctor(
        selectedDoctor._id || selectedDoctor.id
      );
      setDoctors(doctors.filter(
        doc => (doc._id || doc.id) !== (selectedDoctor._id || selectedDoctor.id)
      ));
      handleMenuClose();
    } catch (err) {
      console.error('Error deleting doctor:', err);
      setError(err.message || 'An error occurred');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
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
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box className="doctors-page">
      <Box className="page-header">
        <Box>
          <Typography variant="h4" className="page-title">
            Doctors
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage the platform’s doctors
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="add-button"
          onClick={handleAddDoctor}
        >
          Add Doctor
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
                    Total Doctors
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
                    Verified
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
                    Pending
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
                    Total Patients
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
        <Tabs value={activeTab} onChange={handleTabChange} className="filter-tabs">
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
        data={filteredDoctors}
        columns={columns}
        searchable
        onRowClick={handleRowClick}
        loading={false}
        exportable
      />

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
          <MenuItem onClick={handleVerifyDoctor}>
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
        <MenuItem onClick={handleDeleteDoctor}>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DoctorsList;
