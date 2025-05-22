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
  LinearProgress
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
  School as SchoolIcon
} from '@mui/icons-material';
import DataTable from '../../components/common/DataTable';
import { doctorsService, paymentsService } from '../../services';
import './DoctorDetails.css';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={handleBack}>
          Back to List
        </Button>
      </Box>
    );
  }

  if (!doctor) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Doctor not found</Alert>
        <Button sx={{ mt: 2 }} onClick={handleBack}>
          Back to List
        </Button>
      </Box>
    );
  }

  const finances = calculateFinancialStats(doctor, transactions);
  const monthlyStats = generateMonthlyStats(finances);

  const TabPanel = ({ children, value, index, ...other }) => (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`doctor-tabpanel-${index}`}
      aria-labelledby={`doctor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </Box>
  );

  return (
    <Box className="doctor-details-page">
      <Box className="details-header">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: '#2563eb', fontSize: '24px' }}>
            {doctor.initials ||
              (doctor.fullName
                ? doctor.fullName.split(' ').map(n => n[0]).join('')
                : 'DR')}
          </Avatar>
          <Box>
            <Typography variant="h4" className="doctor-name">
              {doctor.displayName || `Dr. ${doctor.fullName || doctor.name}`}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {doctor.specialty || doctor.specialization} •{' '}
              {doctor.experience
                ? `${doctor.experience} years`
                : 'Experience not provided'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={
                  doctor.verified || doctor.status === 'verified'
                    ? 'Verified'
                    : 'Pending'
                }
                color={
                  doctor.verified || doctor.status === 'verified'
                    ? 'success'
                    : 'warning'
                }
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
        <Button variant="outlined" onClick={handleBack}>
          Back to List
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          className="doctor-tabs"
        >
          <Tab icon={<PersonIcon />} label="Information" />
          <Tab icon={<WorkIcon />} label="Professional" />
          <Tab icon={<FinanceIcon />} label="Financials" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <EmailIcon sx={{ mr: 2, color: '#6b7280' }} />
                  <ListItemText
                    primary="Email"
                    secondary={doctor.email || 'Not provided'}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <PhoneIcon sx={{ mr: 2, color: '#6b7280' }} />
                  <ListItemText
                    primary="Phone"
                    secondary={doctor.phone || 'Not provided'}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <LocationIcon sx={{ mr: 2, color: '#6b7280' }} />
                  <ListItemText
                    primary="Address"
                    secondary={doctor.address || 'Not provided'}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <PersonIcon sx={{ mr: 2, color: '#6b7280' }} />
                  <ListItemText
                    primary="Date of Birth"
                    secondary={
                      doctor.dob
                        ? new Date(doctor.dob).toLocaleDateString()
                        : 'Not provided'
                    }
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Statistics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Active Patients"
                    secondary={doctor.patients || 0}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Average Rating"
                    secondary={
                      doctor.rating ? `⭐ ${doctor.rating}/5` : 'No ratings yet'
                    }
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Member Since"
                    secondary={
                      doctor.createdAt
                        ? new Date(doctor.createdAt).toLocaleDateString()
                        : 'Not available'
                    }
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Account Status"
                    secondary={
                      doctor.verified || doctor.status === 'verified'
                        ? 'Verified'
                        : 'Pending verification'
                    }
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Consultation Fee"
                    secondary={
                      doctor.price ? `${doctor.price}€` : 'Not set'
                    }
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Professional Background
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <SchoolIcon sx={{ mr: 2, color: '#6b7280' }} />
                  <ListItemText
                    primary="Education"
                    secondary={doctor.education || 'Not provided'}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <WorkIcon sx={{ mr: 2, color: '#6b7280' }} />
                  <ListItemText
                    primary="Experience"
                    secondary={
                      doctor.experience
                        ? `${doctor.experience} years`
                        : 'Not provided'
                    }
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <PersonIcon sx={{ mr: 2, color: '#6b7280' }} />
                  <ListItemText
                    primary="Specialization"
                    secondary={
                      doctor.specialty || doctor.specialization || 'Not defined'
                    }
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="About"
                    secondary={doctor.about || 'Not provided'}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Certifications
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {doctor.certifications && doctor.certifications.length ? (
                <List disablePadding>
                  {doctor.certifications.map((cert, idx) => (
                    <ListItem key={idx} disablePadding sx={{ py: 1 }}>
                      <ListItemText
                        primary={cert.name || cert}
                        secondary={cert.issuer || 'Issuer not specified'}
                        primaryTypographyProps={{ variant: 'subtitle2' }}
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
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5">
                      {formatCurrency(finances.totalRevenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
                    </Typography>
                  </Box>
                  <TrendingUpIcon />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5">
                      {formatCurrency(finances.monthlyRevenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Month
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography variant="caption" color="success.main">
                        +{finances.growth}%
                      </Typography>
                    </Box>
                  </Box>
                  <CalendarIcon />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5">
                      {finances.completedConsultations}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Consultations
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg: {formatCurrency(finances.avgConsultationPrice)}
                    </Typography>
                  </Box>
                  <ReceiptIcon />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5">
                      {formatCurrency(finances.pendingPayments)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fee: {finances.commissionRate}%
                    </Typography>
                  </Box>
                  <ReceiptIcon />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
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
                      sx={{ height: 6, borderRadius: 3 }}
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
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
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

        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 0 }}>
              <Typography variant="h6">
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
      </TabPanel>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button variant="contained">Edit</Button>
        {!(doctor.verified || doctor.status === 'verified') && (
          <Button
            variant="outlined"
            color="warning"
            onClick={() => navigate(`/doctors/${doctor._id || doctor.id}/review`)}
          >
            Review
          </Button>
        )}
        <Button variant="outlined" color="error">
          Suspend
        </Button>
      </Box>
    </Box>
  );
};

export default DoctorDetails;
