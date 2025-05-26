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
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  Container,
  useTheme,
  alpha
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  AccountBalance as FinanceIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import DataTable from '../../components/common/DataTable';
import { doctorsService, paymentsService } from '../../services';
import './DoctorDetails.css';

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

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    fetchDoctorData();
  }, [id]);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      console.log(`Fetching data for doctor ${id}...`);

      const doctorData = await doctorsService.getDoctorById(id);
      console.log('Doctor data retrieved:', doctorData);
      setDoctor(doctorData);

      await fetchDoctorTransactions(doctorData._id || doctorData.id);
    } catch (err) {
      console.error('Error fetching doctor:', err);
      setError(err.message || 'Doctor not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorTransactions = async (doctorId) => {
    try {
      setLoadingTransactions(true);
      console.log(`Fetching transactions for doctor ${doctorId}...`);

      const paymentsData = await paymentsService.getPaymentsByDoctor(doctorId);
      console.log('Transactions retrieved:', paymentsData);

      const mappedTransactions = paymentsData.map(payment => ({
        id: payment.id || payment._id,
        date: payment.date || payment.createdAt,
        patient: payment.patient?.name || payment.patientName || 'Unknown patient',
        amount: payment.amount || 0,
        commission: payment.commission != null ? payment.commission : payment.amount * 0.15,
        net: payment.net != null ? payment.net : payment.amount * 0.85,
        status: payment.status || 'completed',
        type: payment.type || payment.description || 'consultation',
        description: payment.description || 'Consultation'
      }));

      setTransactions(mappedTransactions);
    } catch (err) {
      console.warn('Error fetching transactions:', err);
      setTransactions(generateMockTransactions(doctorId));
    } finally {
      setLoadingTransactions(false);
    }
  };

  const generateMockTransactions = (doctorId) => {
    const mock = [];
    const now = new Date();

    for (let i = 1; i <= 5; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date(now.getTime() - daysAgo * 86400000).toISOString();
      const amount = Math.floor(Math.random() * 100) + 50;
      const commission = amount * 0.15;
      const net = amount - commission;

      mock.push({
        id: i,
        date,
        patient: `Patient ${i}`,
        amount,
        commission,
        net,
        status: Math.random() > 0.2 ? 'completed' : 'pending',
        type: ['consultation', 'emergency', 'follow-up'][Math.floor(Math.random() * 3)],
        description: 'Sample consultation'
      });
    }

    return mock;
  };

  const calculateFinancialStats = (doctor, transactions) => {
    const completed = transactions.filter(t => t.status === 'completed');
    const totalRevenue = completed.reduce((sum, t) => sum + t.amount, 0);
    const totalCommission = completed.reduce((sum, t) => sum + t.commission, 0);

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const monthly = completed.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    }).reduce((sum, t) => sum + t.amount, 0);

    const avgPrice = completed.length ? totalRevenue / completed.length : doctor.price || 75;

    return {
      totalRevenue: totalRevenue || (doctor.price * 50) || 5000,
      monthlyRevenue: monthly || (doctor.price * 10) || 1000,
      completedConsultations: completed.length || 25,
      avgConsultationPrice: avgPrice,
      commissionRate: 15,
      pendingPayments: transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0),
      growth: Math.floor(Math.random() * 20) + 5
    };
  };

  const generateMonthlyStats = (finances) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    return months.map(m => ({
      month: m,
      revenue: Math.floor(finances.monthlyRevenue * (0.8 + Math.random() * 0.4)),
      consultations: Math.floor(Math.random() * 10) + 10
    }));
  };

  const handleBack = () => navigate('/doctors');
  const handleTabChange = (_, newValue) => setActiveTab(newValue);

  const formatCurrency = (amt) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amt || 0);

  const getStatusColor = (status) => {
    if (status === 'completed') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'failed') return 'error';
    return 'default';
  };

  const getTypeLabel = (type) => {
    if (type === 'consultation') return 'Consultation';
    if (type === 'emergency') return 'Emergency';
    if (type === 'follow-up') return 'Follow-up';
    return type || 'Consultation';
  };

  const transactionColumns = [
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      renderCell: (value) => new Date(value).toLocaleDateString()
    },
    { field: 'patient', headerName: 'Patient', width: 150 },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      renderCell: (value) => getTypeLabel(value)
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 100,
      align: 'right',
      renderCell: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {formatCurrency(value)}
        </Typography>
      )
    },
    {
      field: 'commission',
      headerName: 'Commission',
      width: 100,
      align: 'right',
      renderCell: (value) => (
        <Typography variant="body2" color="error.main">
          -{formatCurrency(value)}
        </Typography>
      )
    },
    {
      field: 'net',
      headerName: 'Net',
      width: 100,
      align: 'right',
      renderCell: (value) => (
        <Typography variant="body2" fontWeight={600} color="success.main">
          {formatCurrency(value)}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (value) => (
        <Chip
          label={
            value === 'completed' ? 'Completed' :
            value === 'pending'   ? 'Pending'   :
                                    'Failed'
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
          Loading doctor details...
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
          Back to Doctors
        </Button>
      </Box>
    );
  }

  if (!doctor) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Doctor not found</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2, borderRadius: 2 }}
        >
          Back to Doctors
        </Button>
      </Box>
    );
  }

  const finances = calculateFinancialStats(doctor, transactions);
  const monthlyStats = generateMonthlyStats(finances);

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Box className="doctor-details-page">
        {/* Back button and header */}
        <Box className="details-header" sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: COLORS.primary, 
              fontSize: '28px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              {doctor.initials ||
                (doctor.fullName
                  ? doctor.fullName.split(' ').map(n => n[0]).join('')
                  : 'DR')}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.primary, mb: 1 }}>
                {doctor.displayName || `Dr. ${doctor.fullName || doctor.name}`}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5 }}>
                {doctor.specialty || doctor.specialization} •{' '}
                {doctor.experience
                  ? `${doctor.experience} years experience`
                  : 'Experience not provided'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={doctor.verified || doctor.status === 'verified' ? 'Verified' : 'Pending'}
                  color={doctor.verified || doctor.status === 'verified' ? 'success' : 'warning'}
                  sx={{ 
                    fontWeight: 500,
                    py: 0.5
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  ⭐ {doctor.rating || '0'} • {doctor.patients || 0} patients
                </Typography>
              </Box>
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
            Back to Doctors
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
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
            <Tab label="Profile" icon={<PersonIcon sx={{ mr: 1 }} />} iconPosition="start" />
            <Tab label="Financials" icon={<FinanceIcon sx={{ mr: 1 }} />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Profile Tab Content */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, color: COLORS.primary, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1 }} /> Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <EmailIcon sx={{ mr: 2, color: COLORS.secondary }} />
                    <ListItemText
                      primary="Email"
                      secondary={doctor.email || 'Not provided'}
                      primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <PhoneIcon sx={{ mr: 2, color: COLORS.secondary }} />
                    <ListItemText
                      primary="Phone"
                      secondary={doctor.phone || 'Not provided'}
                      primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <LocationIcon sx={{ mr: 2, color: COLORS.secondary }} />
                    <ListItemText
                      primary="Address"
                      secondary={doctor.address || 'Not provided'}
                      primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <PersonIcon sx={{ mr: 2, color: COLORS.secondary }} />
                    <ListItemText
                      primary="Date of Birth"
                      secondary={doctor.dob ? new Date(doctor.dob).toLocaleDateString() : 'Not provided'}
                      primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {/* Professional Background */}
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, color: COLORS.primary, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <WorkIcon sx={{ mr: 1 }} /> Professional Background
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <SchoolIcon sx={{ mr: 2, color: COLORS.secondary }} />
                    <ListItemText
                      primary="Education"
                      secondary={doctor.education || 'Not provided'}
                      primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <WorkIcon sx={{ mr: 2, color: COLORS.secondary }} />
                    <ListItemText
                      primary="Experience"
                      secondary={doctor.experience ? `${doctor.experience} years` : 'Not provided'}
                      primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <PersonIcon sx={{ mr: 2, color: COLORS.secondary }} />
                    <ListItemText
                      primary="Specialization"
                      secondary={doctor.specialty || doctor.specialization || 'Not defined'}
                      primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary="About"
                      secondary={doctor.about || 'Not provided'}
                      primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {/* Stats & Certifications */}
            <Grid item xs={12} md={12} lg={4}>
              <Grid container spacing={3} direction="column" height="100%">
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2, color: COLORS.primary, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ mr: 1 }} /> Statistics
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Active Patients</Typography>
                        <Typography variant="h6" fontWeight={600}>{doctor.patients || 0}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Average Rating</Typography>
                        <Typography variant="h6" fontWeight={600}>{doctor.rating ? `⭐ ${doctor.rating}/5` : 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Member Since</Typography>
                        <Typography variant="h6" fontWeight={600}>
                          {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Consultation Fee</Typography>
                        <Typography variant="h6" fontWeight={600}>{doctor.price ? `${doctor.price}€` : 'Not set'}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12} sx={{ flexGrow: 1 }}>
                  <Paper sx={{ p: 3, borderRadius: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2, color: COLORS.primary, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <SchoolIcon sx={{ mr: 1 }} /> Certifications
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {doctor.certifications && doctor.certifications.length ? (
                      <List disablePadding dense>
                        {doctor.certifications.map((cert, idx) => (
                          <ListItem key={idx} disablePadding sx={{ py: 0.75 }}>
                            <ListItemText
                              primary={cert.name || cert}
                              secondary={cert.issuer || 'Issuer not specified'}
                              primaryTypographyProps={{ fontWeight: 500 }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No certifications listed
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Financial Tab Content */}
        {activeTab === 1 && (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* Financial stats cards */}
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
                          {formatCurrency(finances.totalRevenue)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Revenue
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
                          {formatCurrency(finances.monthlyRevenue)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          This Month
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <TrendingUpIcon sx={{ fontSize: 16, color: '#ffffff' }} />
                          <Typography variant="caption" sx={{ color: '#ffffff !important', fontWeight: 600 }}>
                            +{finances.growth}%
                          </Typography>
                        </Box>
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
                          {finances.completedConsultations}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Consultations
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#ffffff !important', fontWeight: 600 }}>
                          Avg: {formatCurrency(finances.avgConsultationPrice)}
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
                          {formatCurrency(finances.pendingPayments)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Pending
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#ffffff !important', fontWeight: 600 }}>
                          Fee: {finances.commissionRate}%
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
            </Grid>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* Revenue charts */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: COLORS.primary }}>
                      Revenue Over Last 5 Months
                    </Typography>
                    {monthlyStats.map(stat => (
                      <Box key={stat.month} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{stat.month}</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(stat.revenue)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            (stat.revenue /
                              Math.max(...monthlyStats.map(s => s.revenue))) *
                            100
                          }
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
                          {stat.consultations} consultations
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: COLORS.primary }}>
                      Revenue Breakdown
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Gross Revenue</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(finances.totalRevenue)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="error.main">
                          Platform Fee ({finances.commissionRate}%)
                        </Typography>
                        <Typography variant="body2" color="error.main">
                          -{formatCurrency(
                            finances.totalRevenue * (finances.commissionRate / 100)
                          )}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight={600}>
                          Net Revenue
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {formatCurrency(
                            finances.totalRevenue *
                              (1 - finances.commissionRate / 100)
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Transactions table */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, pb: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.primary }}>
                    Recent Transactions
                    {loadingTransactions && (
                      <CircularProgress size={20} sx={{ ml: 2 }} />
                    )}
                  </Typography>
                </Box>
                <DataTable
                  data={transactions}
                  columns={transactionColumns}
                  searchable={false}
                  pagination
                  initialRowsPerPage={10}
                />
              </CardContent>
            </Card>
          </>
        )}

        {/* Action buttons */}
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
          {!(doctor.verified || doctor.status === 'verified') && (
            <Button
              variant="contained"
              onClick={() => navigate(`/doctors/${doctor._id || doctor.id}/review`)}
              sx={{ 
                borderRadius: 2,
                bgcolor: COLORS.tabActive,
                '&:hover': {
                  bgcolor: alpha(COLORS.tabActive, 0.9)
                }
              }}
            >
              Review
            </Button>
          )}
          <Button 
            variant="outlined" 
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Suspend
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default DoctorDetails;
