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
  CardHeader,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  LocalHospital as MedicalIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Bloodtype as BloodIcon,
  Warning as AllergyIcon,
  ContactEmergency as EmergencyIcon
} from '@mui/icons-material';
import { patientsService } from '../../services';
import DataTable from '../../components/common/DataTable';
import './PatientDetails.css';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={handleBack}>
          Back to list
        </Button>
      </Box>
    );
  }

  if (!patient) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="warning">Patient not found</Alert>
        <Button sx={{ mt: 2 }} onClick={handleBack}>
          Back to list
        </Button>
      </Box>
    );
  }

  const renderStatus = (status) => {
    const color = status === 'active' ? 'success' : status === 'inactive' ? 'error' : 'warning';
    const label = status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : 'Pending';
    return <Chip label={label} color={color} size="small" />;
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </Box>
  );

  return (
    <Box className="patient-details-page">
      {/* Header */}
      <Box className="details-header">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              bgcolor: '#10b981',
              fontSize: '24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            {patient.gender === 'Male' || patient.gender === 'Masculin' ? '👨' : patient.gender === 'Female' || patient.gender === 'Féminin' ? '👩' : '👤'}
          </Avatar>
          <Box>
            <Typography variant="h4" className="patient-name">
              {patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Name not available'} {renderStatus(patient.status)}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {patient.age || 0} years old • {patient.gender || 'Gender not specified'} • Blood type {patient.bloodType || 'Not specified'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Patient since {patient.joinDate ? new Date(patient.joinDate).toLocaleDateString('en-US') : 'Unknown date'}
            </Typography>
          </Box>
        </Box>
        
        <Button variant="outlined" onClick={handleBack}>
          Back to list
        </Button>
      </Box>

      {/* Debug info in development mode */}
      {import.meta.env.DEV && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Debug: Patient ID: {patient.id}, Available data: {Object.keys(patient).join(', ')}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} className="patient-tabs">
          <Tab icon={<PersonIcon />} label="Personal Information" />
          <Tab icon={<MedicalIcon />} label="Medical Record" />
          <Tab icon={<AccountBalanceIcon />} label="Finances" />
        </Tabs>
      </Box>

      {/* Personal Information Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card className="info-card">
              <CardHeader 
                title="Contact Information"
                avatar={<PersonIcon />}
              />
              <CardContent>
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <EmailIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Email" 
                      secondary={patient.email || 'Email not available'} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <PhoneIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Phone" 
                      secondary={patient.phone || 'Phone not available'} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <LocationIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Address" 
                      secondary={patient.address || 'Address not available'} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <EmergencyIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Emergency Contact" 
                      secondary={patient.emergencyContact || 'Emergency contact not available'} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card className="info-card">
              <CardHeader 
                title="Medical Information"
                avatar={<MedicalIcon />}
              />
              <CardContent>
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <BloodIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Blood Type" 
                      secondary={patient.bloodType || 'Not specified'} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <MedicalIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Primary Doctor" 
                      secondary={patient.assignedDoctor || 'No doctor assigned'} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <CalendarIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Last Consultation" 
                      secondary={patient.lastConsultation ? new Date(patient.lastConsultation).toLocaleDateString('en-US') : 'No consultation'} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <AllergyIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Allergies" 
                      secondary={
                        patient.allergies && patient.allergies.length > 0 
                          ? patient.allergies.map(a => <Chip key={a} label={a} size="small" color="warning" sx={{ mr: 0.5, mb: 0.5 }} />)
                          : "No known allergies"
                      } 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <AccountBalanceIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Insurance" 
                      secondary={patient.insurance || 'Not specified'} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Medical Record Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card className="medical-card">
          <CardHeader 
            title="Medical History"
            avatar={<MedicalIcon />}
          />
          <CardContent>
            {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
              <List>
                {patient.medicalHistory.map((item, index) => (
                  <ListItem 
                    key={index} 
                    divider={index < patient.medicalHistory.length - 1}
                    sx={{ alignItems: 'flex-start', py: 2 }}
                  >
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {item.description || 'Description not available'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.date || 'Unknown date'}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Doctor:</strong> {item.doctor || 'Doctor not specified'}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Diagnosis:</strong> {item.diagnosis || 'Diagnosis not available'}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Treatment:</strong> {item.treatment || 'Treatment not specified'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Notes:</strong> {item.notes || 'No notes'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No medical history available
              </Typography>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Finances Tab */}
      <TabPanel value={tabValue} index={2}>
        {/* Financial statistics cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="finance-card">
              <CardContent>
                <Box className="finance-content">
                  <Box>
                    <Typography variant="h5" className="finance-number">
                      {formatCurrency(patient.finances?.totalSpent)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Spent
                    </Typography>
                  </Box>
                  <TrendingUpIcon className="finance-icon" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="finance-card">
              <CardContent>
                <Box className="finance-content">
                  <Box>
                    <Typography variant="h5" className="finance-number">
                      {patient.finances?.consultationsCount || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Consultations
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg: {formatCurrency(patient.finances?.averageConsultationCost)}
                    </Typography>
                  </Box>
                  <CalendarIcon className="finance-icon" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="finance-card">
              <CardContent>
                <Box className="finance-content">
                  <Box>
                    <Typography variant="h5" className="finance-number">
                      {formatCurrency(patient.finances?.pendingPayments)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last: {patient.finances?.lastPayment || 'None'}
                    </Typography>
                  </Box>
                  <ReceiptIcon className="finance-icon" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="finance-card">
              <CardContent>
                <Box className="finance-content">
                  <Box>
                    <Typography variant="h5" className="finance-number">
                      {formatCurrency(patient.finances?.totalRefunds)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Refunds
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Method: {patient.finances?.preferredPaymentMethod || 'Not specified'}
                    </Typography>
                  </Box>
                  <AccountBalanceIcon className="finance-icon" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Monthly evolution */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
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
                        sx={{ height: 6, borderRadius: 3 }}
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
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Financial Summary
                </Typography>
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Total spent" 
                      secondary={formatCurrency(patient.finances?.totalSpent)} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Average cost per consultation" 
                      secondary={formatCurrency(patient.finances?.averageConsultationCost)} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Pending payments" 
                      secondary={formatCurrency(patient.finances?.pendingPayments)} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Preferred payment method" 
                      secondary={patient.finances?.preferredPaymentMethod || 'Not specified'} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Last payment" 
                      secondary={patient.finances?.lastPayment || 'No payment'} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent transactions */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 0 }}>
              <Typography variant="h6">
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
      </TabPanel>
      
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button variant="contained" color="primary">
          Edit
        </Button>
        <Button variant="outlined" color="warning">
          Send Message
        </Button>
        <Button variant="outlined" color="error">
          Archive
        </Button>
      </Box>
    </Box>
  );
};

export default PatientDetails;