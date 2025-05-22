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
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import DataTable from '../../components/common/DataTable';
import './DoctorDetails.css';

// Données simulées étendues
const MOCK_DOCTORS = {
  1: {
    id: 1,
    name: 'Dr. Martin Dupont',
    specialty: 'Cardiologue',
    email: 'martin.dupont@example.com',
    phone: '06 12 34 56 78',
    address: '15 rue du Coeur, 75001 Paris',
    education: 'Université Paris Descartes',
    experience: '15 ans',
    patients: 42,
    status: 'verified',
    rating: 4.8,
    joinDate: '2024-01-15',
    
    // Données financières
    finances: {
      totalRevenue: 8420.50,
      monthlyRevenue: 1250.75,
      completedConsultations: 127,
      avgConsultationPrice: 85.00,
      commission: 15, // Pourcentage
      pendingPayments: 245.00,
      growth: 15.2
    },
    
    // Transactions récentes
    transactions: [
      {
        id: 1,
        date: '2025-05-22',
        patient: 'Jean Dupont',
        amount: 85.00,
        commission: 12.75,
        net: 72.25,
        status: 'completed',
        type: 'consultation'
      },
      {
        id: 2,
        date: '2025-05-21',
        patient: 'Pierre Durand',
        amount: 120.00,
        commission: 18.00,
        net: 102.00,
        status: 'completed',
        type: 'consultation_examens'
      },
      {
        id: 3,
        date: '2025-05-20',
        patient: 'Marie Leblanc',
        amount: 95.00,
        commission: 14.25,
        net: 80.75,
        status: 'pending',
        type: 'urgence'
      }
    ],
    
    // Statistiques mensuelles
    monthlyStats: [
      { month: 'Jan', revenue: 1100, consultations: 13 },
      { month: 'Fév', revenue: 1200, consultations: 15 },
      { month: 'Mar', revenue: 980, consultations: 12 },
      { month: 'Avr', revenue: 1350, consultations: 16 },
      { month: 'Mai', revenue: 1250, consultations: 14 }
    ]
  },
  2: {
    id: 2,
    name: 'Dr. Sophie Laurent',
    specialty: 'Pédiatre',
    email: 'sophie.laurent@example.com',
    phone: '06 23 45 67 89',
    address: '8 avenue des Enfants, 75015 Paris',
    education: 'Université Lyon Est',
    experience: '8 ans',
    patients: 56,
    status: 'verified',
    rating: 4.9,
    joinDate: '2024-02-20',
    
    finances: {
      totalRevenue: 6850.25,
      monthlyRevenue: 1125.50,
      completedConsultations: 156,
      avgConsultationPrice: 75.00,
      commission: 15,
      pendingPayments: 150.00,
      growth: 8.7
    },
    
    transactions: [
      {
        id: 4,
        date: '2025-05-22',
        patient: 'Lucas Martin',
        amount: 75.00,
        commission: 11.25,
        net: 63.75,
        status: 'completed',
        type: 'consultation'
      }
    ],
    
    monthlyStats: [
      { month: 'Jan', revenue: 950, consultations: 18 },
      { month: 'Fév', revenue: 1050, consultations: 20 },
      { month: 'Mar', revenue: 900, consultations: 16 },
      { month: 'Avr', revenue: 1200, consultations: 22 },
      { month: 'Mai', revenue: 1125, consultations: 19 }
    ]
  }
};

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const fetchedDoctor = MOCK_DOCTORS[id];
        
        if (!fetchedDoctor) {
          throw new Error('Médecin non trouvé');
        }
        
        setDoctor(fetchedDoctor);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const handleBack = () => {
    navigate('/doctors');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'consultation': return 'Consultation';
      case 'consultation_examens': return 'Consultation + Examens';
      case 'urgence': return 'Urgence';
      default: return type;
    }
  };

  const transactionColumns = [
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      renderCell: (value) => new Date(value).toLocaleDateString('fr-FR')
    },
    {
      field: 'patient',
      headerName: 'Patient',
      width: 150
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      renderCell: (value) => getTypeLabel(value)
    },
    {
      field: 'amount',
      headerName: 'Montant',
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
      headerName: 'Statut',
      width: 120,
      renderCell: (value) => (
        <Chip 
          label={value === 'completed' ? 'Terminé' : value === 'pending' ? 'En attente' : 'Échoué'} 
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
          Retour à la liste
        </Button>
      </Box>
    );
  }

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
      {/* Header */}
      <Box className="details-header">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ width: 64, height: 64, bgcolor: '#2563eb', fontSize: '24px' }}
          >
            {doctor.name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Box>
            <Typography variant="h4" className="doctor-name">
              {doctor.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {doctor.specialty} • {doctor.experience} d'expérience
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip 
                label={doctor.status === 'verified' ? 'Vérifié' : 'En attente'} 
                color={doctor.status === 'verified' ? 'success' : 'warning'} 
              />
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                ⭐ {doctor.rating} • {doctor.patients} patients
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Button variant="outlined" onClick={handleBack}>
          Retour à la liste
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} className="doctor-tabs">
          <Tab icon={<PersonIcon />} label="Informations" />
          <Tab icon={<WorkIcon />} label="Professionnel" />
          <Tab icon={<FinanceIcon />} label="Finances" />
        </Tabs>
      </Box>

      {/* Onglet Informations */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informations personnelles
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Spécialité" 
                    secondary={doctor.specialty} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Email" 
                    secondary={doctor.email} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Téléphone" 
                    secondary={doctor.phone} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Adresse" 
                    secondary={doctor.address} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Statistiques
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Patients actifs" 
                    secondary={doctor.patients} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Note moyenne" 
                    secondary={`⭐ ${doctor.rating}/5`} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Membre depuis" 
                    secondary={new Date(doctor.joinDate).toLocaleDateString('fr-FR')} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Statut" 
                    secondary={doctor.status === 'verified' ? 'Compte vérifié' : 'En attente de validation'} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Onglet Professionnel */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Parcours professionnel
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Formation" 
                    secondary={doctor.education} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Expérience" 
                    secondary={doctor.experience} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Spécialisation" 
                    secondary={doctor.specialty} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Onglet Finances */}
      <TabPanel value={activeTab} index={2}>
        {/* Cartes de statistiques financières */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="finance-card">
              <CardContent>
                <Box className="finance-content">
                  <Box>
                    <Typography variant="h5" className="finance-number">
                      {formatCurrency(doctor.finances.totalRevenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Revenus totaux
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
                      {formatCurrency(doctor.finances.monthlyRevenue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ce mois-ci
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography variant="caption" color="success.main">
                        +{doctor.finances.growth}%
                      </Typography>
                    </Box>
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
                      {doctor.finances.completedConsultations}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Consultations
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Moy: {formatCurrency(doctor.finances.avgConsultationPrice)}
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
                      {formatCurrency(doctor.finances.pendingPayments)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En attente
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Commission: {doctor.finances.commission}%
                    </Typography>
                  </Box>
                  <ReceiptIcon className="finance-icon" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Évolution mensuelle */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Évolution des revenus (5 derniers mois)
                </Typography>
                {doctor.monthlyStats.map((stat, ) => (
                  <Box key={stat.month} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{stat.month}</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(stat.revenue)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stat.revenue / 1400) * 100} 
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
                  Répartition des revenus
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Revenus bruts</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(doctor.finances.totalRevenue)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="error.main">
                      Commission plateforme ({doctor.finances.commission}%)
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      -{formatCurrency(doctor.finances.totalRevenue * (doctor.finances.commission / 100))}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>
                      Revenus nets
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      {formatCurrency(doctor.finances.totalRevenue * (1 - doctor.finances.commission / 100))}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Transactions récentes */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 0 }}>
              <Typography variant="h6">
                Transactions récentes
              </Typography>
            </Box>
            
            <DataTable
              data={doctor.transactions}
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
          Modifier
        </Button>
        <Button variant="outlined" color="error">
          Suspendre
        </Button>
      </Box>
    </Box>
  );
};

export default DoctorDetails;