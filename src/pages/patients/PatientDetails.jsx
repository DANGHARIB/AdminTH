import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Card,
  CardContent,
  Container,
  Tabs,
  Tab,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Person as PersonIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Cake as CakeIcon,
  Wc as GenderIcon
} from '@mui/icons-material';
import { patientsService } from '../../services';
import DataTable from '../../components/common/DataTable';
import './PatientDetails.css';

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

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) {
        setError('Missing patient ID');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching patient with ID:', id);
        const fetchedPatient = await patientsService.getPatientById(id);
        console.log('Patient fetched:', fetchedPatient);
        setPatient(fetchedPatient);
        setError(null);
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError(err.message || 'Patient not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  const handleBack = () => {
    navigate('/patients');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'processed': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'consultation':
      case 'Consultation': return 'Consultation';
      case 'urgence':
      case 'Emergency': return 'Emergency';
      case 'refund':
      case 'Remboursement': return 'Refund';
      default: return type || 'Unknown type';
    }
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case 'card':
      case 'Carte bancaire': return 'Credit Card';
      case 'bank_transfer':
      case 'Virement': return 'Bank Transfer';
      case 'cash':
      case 'Espèces': return 'Cash';
      default: return method || 'Unknown method';
    }
  };

  const transactionColumns = [
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      renderCell: (value) => {
        if (!value) return 'Unknown date';
        return new Date(value).toLocaleDateString('en-US');
      }
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 200,
      renderCell: (value) => value || 'Description not available'
    },
    {
      field: 'doctor',
      headerName: 'Doctor',
      width: 150,
      renderCell: (value) => value || 'Doctor not specified'
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (value) => (
        <Chip 
          label={getTypeLabel(value)} 
          color={value === 'refund' ? 'info' : 'primary'}
          size="small"
        />
      )
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 100,
      align: 'right',
      renderCell: (value) => (
        <Typography 
          variant="body2" 
          fontWeight={600}
          color={(value || 0) >= 0 ? 'success.main' : 'error.main'}
        >
          {formatCurrency(value)}
        </Typography>
      )
    },
    {
      field: 'paymentMethod',
      headerName: 'Method',
      width: 120,
      renderCell: (value) => getMethodLabel(value)
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (value) => (
        <Chip 
          label={
            value === 'paid' || value === 'Payé' ? 'Paid' : 
            value === 'pending' || value === 'En attente' ? 'Pending' : 
            value === 'processed' || value === 'Traité' ? 'Processed' : 
            'Unknown status'
          } 
          color={getStatusColor(value)}
          size="small"
        />
      )
    }
  ];

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
          Loading patient details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2, borderRadius: 2 }}
        >
          Back to Patients
        </Button>
      </Box>
    );
  }

  if (!patient) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Patient not found</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2, borderRadius: 2 }}
        >
          Back to Patients
        </Button>
      </Box>
    );
  }

  const renderStatus = (status) => {
    const color = status === 'active' ? 'success' : status === 'inactive' ? 'error' : 'warning';
    const label = status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : 'Pending';
    return <Chip label={label} color={color} size="small" sx={{ ml: 1, fontWeight: 500, py: 0.5 }} />;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Box className="patient-details-page">
        {/* Header */}
        <Box className="details-header" sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: COLORS.primary,
                fontSize: '28px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              {patient.gender === 'Male' || patient.gender === 'Masculin' ? '👨' : patient.gender === 'Female' || patient.gender === 'Féminin' ? '👩' : '👤'}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.primary, mb: 1 }}>
                {patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Name not available'} {renderStatus(patient.status)}
              </Typography>
            </Box>
          </Box>
          
          <Button 
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
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
            Back to Patients
          </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            TabIndicatorProps={{ style: { display: 'none' } }}
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
            <Tab label="Personal Info" icon={<PersonIcon sx={{ mr: 1 }} />} iconPosition="start" />
            <Tab label="Finances" icon={<AccountBalanceIcon sx={{ mr: 1 }} />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Personal Information Tab */}
        {tabValue === 0 && (
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={8} lg={6}>
              <Paper sx={{ p: 4, borderRadius: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, color: COLORS.primary, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1.5 }} /> Personal Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: alpha(COLORS.primary, 0.04),
                      mb: 2
                    }}>
                      <Typography variant="subtitle2" color={COLORS.secondary} gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CakeIcon sx={{ mr: 1, fontSize: 20 }} /> Age
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {`${patient.age || 0} years old`}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: alpha(COLORS.primary, 0.04),
                      mb: 2
                    }}>
                      <Typography variant="subtitle2" color={COLORS.secondary} gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <GenderIcon sx={{ mr: 1, fontSize: 20 }} /> Gender
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {patient.gender || 'Not specified'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: alpha(COLORS.primary, 0.04),
                      mb: 2
                    }}>
                      <Typography variant="subtitle2" color={COLORS.secondary} gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EmailIcon sx={{ mr: 1, fontSize: 20 }} /> Email
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {patient.email || 'Email not available'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: alpha(COLORS.primary, 0.04)
                    }}>
                      <Typography variant="subtitle2" color={COLORS.secondary} gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarIcon sx={{ mr: 1, fontSize: 20 }} /> Patient Since
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {patient.joinDate ? new Date(patient.joinDate).toLocaleDateString('en-US') : 'Unknown date'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Finances Tab */}
        {tabValue === 1 && (
          <>
            {/* Financial statistics cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  borderRadius: 3, 
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${alpha(COLORS.primary, 0.8)} 100%)`,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.07)',
                  height: '100%',
                  color: '#fff'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h5" fontWeight={700}>
                          {formatCurrency(patient.finances?.totalSpent)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Spent
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '50%', 
                        bgcolor: alpha('#fff', 0.15),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center' 
                      }}>
                        <TrendingUpIcon sx={{ fontSize: 24, color: '#fff' }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  borderRadius: 3, 
                  background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${alpha(COLORS.secondary, 0.8)} 100%)`,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.07)',
                  height: '100%',
                  color: '#fff'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h5" fontWeight={700}>
                          {patient.finances?.consultationsCount || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Consultations
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#ffffff !important', fontWeight: 600 }}>
                          Avg: {formatCurrency(patient.finances?.averageConsultationCost)}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '50%', 
                        bgcolor: alpha('#fff', 0.15),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center' 
                      }}>
                        <CalendarIcon sx={{ fontSize: 24, color: '#fff' }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  borderRadius: 3, 
                  background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${alpha(COLORS.accent, 0.8)} 100%)`,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.07)',
                  height: '100%',
                  color: '#fff'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h5" fontWeight={700}>
                          {formatCurrency(patient.finances?.pendingPayments)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Pending
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#ffffff !important', fontWeight: 600 }}>
                          Last: {patient.finances?.lastPayment || 'None'}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '50%', 
                        bgcolor: alpha('#fff', 0.15),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center' 
                      }}>
                        <ReceiptIcon sx={{ fontSize: 24, color: '#fff' }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  borderRadius: 3, 
                  background: `linear-gradient(135deg, ${COLORS.tertiary} 0%, ${alpha(COLORS.tertiary, 0.8)} 100%)`,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.07)',
                  height: '100%',
                  color: '#fff'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h5" fontWeight={700}>
                          {formatCurrency(patient.finances?.totalRefunds)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Refunds
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#ffffff !important', fontWeight: 600 }}>
                          Method: {patient.finances?.preferredPaymentMethod || 'Not specified'}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '50%', 
                        bgcolor: alpha('#fff', 0.15),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center' 
                      }}>
                        <AccountBalanceIcon sx={{ fontSize: 24, color: '#fff' }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Monthly evolution */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: COLORS.primary }}>
                      Spending Evolution (Last 5 months)
                    </Typography>
                    {patient.monthlyStats && patient.monthlyStats.length > 0 ? (
                      patient.monthlyStats.map((stat) => (
                        <Box key={stat.month} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">{stat.month}</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatCurrency(stat.spent)}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={((stat.spent || 0) / 150) * 100} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: alpha(COLORS.primary, 0.1),
                              '.MuiLinearProgress-bar': {
                                bgcolor: COLORS.primary
                              }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {stat.consultations || 0} consultation{(stat.consultations || 0) > 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No monthly data available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: COLORS.primary }}>
                      Financial Summary
                    </Typography>
                    <List disablePadding>
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemText 
                          primary="Total spent" 
                          secondary={formatCurrency(patient.finances?.totalSpent)} 
                          primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemText 
                          primary="Average cost per consultation" 
                          secondary={formatCurrency(patient.finances?.averageConsultationCost)} 
                          primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemText 
                          primary="Pending payments" 
                          secondary={formatCurrency(patient.finances?.pendingPayments)} 
                          primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemText 
                          primary="Preferred payment method" 
                          secondary={patient.finances?.preferredPaymentMethod || 'Not specified'} 
                          primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemText 
                          primary="Last payment" 
                          secondary={patient.finances?.lastPayment || 'No payment'} 
                          primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                          secondaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Recent transactions */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, pb: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.primary }}>
                    Transaction History
                  </Typography>
                </Box>
                
                <DataTable
                  data={patient.transactions || []}
                  columns={transactionColumns}
                  searchable={false}
                  pagination={true}
                  initialRowsPerPage={10}
                />
              </CardContent>
            </Card>
          </>
        )}
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          <Button 
            variant="contained" 
            sx={{ 
              borderRadius: 2,
              bgcolor: COLORS.primary,
              '&:hover': {
                bgcolor: alpha(COLORS.primary, 0.9)
              }
            }}
          >
            Edit
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Archive
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default PatientDetails;