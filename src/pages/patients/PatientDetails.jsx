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
import DataTable from '../../components/common/DataTable';
import './PatientDetails.css';

// Données simulées étendues
const MOCK_PATIENTS = {
  1: {
    id: 1,
    name: 'Jean Dupont',
    age: 45,
    birthdate: '15/03/1978',
    email: 'jean.dupont@example.com',
    phone: '06 12 34 56 78',
    address: '25 rue des Lilas, 75013 Paris',
    status: 'active',
    bloodType: 'A+',
    gender: 'Masculin',
    joinDate: '2023-08-15',
    lastConsultation: '2025-01-15',
    assignedDoctor: 'Dr. Martin Dupont',
    insurance: 'CPAM Paris',
    emergencyContact: 'Marie Dupont - 06 98 76 54 32',
    
    allergies: ['Pénicilline', 'Arachides'],
    
    medicalHistory: [
      { 
        date: '15/01/2025', 
        description: 'Consultation pour angine', 
        doctor: 'Dr. Martin Dupont',
        diagnosis: 'Angine virale',
        treatment: 'Repos, paracétamol',
        notes: 'Évolution favorable'
      },
      { 
        date: '10/04/2023', 
        description: 'Consultation pour douleurs lombaires',
        doctor: 'Dr. Martin Dupont', 
        diagnosis: 'Lombalgie commune',
        treatment: 'Anti-inflammatoires, kinésithérapie',
        notes: 'Amélioration progressive'
      },
      { 
        date: '22/08/2022', 
        description: 'Vaccination grippe saisonnière',
        doctor: 'Dr. Sophie Laurent',
        diagnosis: 'Prévention',
        treatment: 'Vaccin Vaxigrip',
        notes: 'Aucun effet secondaire'
      },
    ],
    
    // Données financières
    finances: {
      totalSpent: 847.50,
      pendingPayments: 0,
      lastPayment: '15/01/2025',
      averageConsultationCost: 85.50,
      consultationsCount: 8,
      totalRefunds: 45.00,
      preferredPaymentMethod: 'Carte bancaire'
    },
    
    // Transactions financières
    transactions: [
      {
        id: 1,
        date: '2025-01-15',
        description: 'Consultation angine',
        amount: 85.00,
        type: 'consultation',
        status: 'paid',
        paymentMethod: 'card',
        doctor: 'Dr. Martin Dupont'
      },
      {
        id: 2,
        date: '2024-12-20',
        description: 'Consultation de routine',
        amount: 95.00,
        type: 'consultation',
        status: 'paid',
        paymentMethod: 'card',
        doctor: 'Dr. Martin Dupont'
      },
      {
        id: 3,
        date: '2024-11-15',
        description: 'Remboursement consultation annulée',
        amount: -45.00,
        type: 'refund',
        status: 'processed',
        paymentMethod: 'bank_transfer',
        doctor: 'Dr. Sophie Laurent'
      },
      {
        id: 4,
        date: '2024-10-08',
        description: 'Consultation urgence weekend',
        amount: 120.00,
        type: 'urgence',
        status: 'paid',
        paymentMethod: 'card',
        doctor: 'Dr. Paul Michel'
      }
    ],
    
    // Statistiques mensuelles
    monthlyStats: [
      { month: 'Sep', spent: 95, consultations: 1 },
      { month: 'Oct', spent: 120, consultations: 1 },
      { month: 'Nov', spent: 50, consultations: 1 },
      { month: 'Déc', spent: 95, consultations: 1 },
      { month: 'Jan', spent: 85, consultations: 1 }
    ]
  },
  2: {
    id: 2,
    name: 'Marie Martin',
    age: 32,
    birthdate: '22/07/1991', 
    email: 'marie.martin@example.com',
    phone: '06 98 76 54 32',
    address: '8 avenue Victor Hugo, 75016 Paris',
    status: 'active',
    bloodType: 'O-',
    gender: 'Féminin',
    joinDate: '2023-05-20',
    lastConsultation: '2025-01-10',
    assignedDoctor: 'Dr. Sophie Laurent',
    insurance: 'Mutuelle Générale',
    emergencyContact: 'Paul Martin - 06 11 22 33 44',
    
    allergies: [],
    
    medicalHistory: [
      { 
        date: '10/01/2025', 
        description: 'Consultation pédiatrique pour Lucas',
        doctor: 'Dr. Sophie Laurent',
        diagnosis: 'Consultation de routine enfant',
        treatment: 'Vaccins à jour',
        notes: 'Croissance normale'
      },
      { 
        date: '15/01/2023', 
        description: 'Consultation pour angine',
        doctor: 'Dr. Sophie Laurent',
        diagnosis: 'Angine bactérienne',
        treatment: 'Antibiotiques',
        notes: 'Guérison complète'
      }
    ],
    
    finances: {
      totalSpent: 965.25,
      pendingPayments: 0,
      lastPayment: '10/01/2025',
      averageConsultationCost: 75.00,
      consultationsCount: 12,
      totalRefunds: 0,
      preferredPaymentMethod: 'Virement bancaire'
    },
    
    transactions: [
      {
        id: 5,
        date: '2025-01-10',
        description: 'Consultation pédiatrique',
        amount: 75.00,
        type: 'consultation',
        status: 'paid',
        paymentMethod: 'bank_transfer',
        doctor: 'Dr. Sophie Laurent'
      }
    ],
    
    monthlyStats: [
      { month: 'Sep', spent: 75, consultations: 1 },
      { month: 'Oct', spent: 150, consultations: 2 },
      { month: 'Nov', spent: 75, consultations: 1 },
      { month: 'Déc', spent: 75, consultations: 1 },
      { month: 'Jan', spent: 75, consultations: 1 }
    ]
  }
};

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const fetchedPatient = MOCK_PATIENTS[id];
        
        if (!fetchedPatient) {
          throw new Error('Patient non trouvé');
        }
        
        setPatient(fetchedPatient);
      } catch (err) {
        setError(err.message);
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
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
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
      case 'consultation': return 'Consultation';
      case 'urgence': return 'Urgence';
      case 'refund': return 'Remboursement';
      default: return type;
    }
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case 'card': return 'Carte bancaire';
      case 'bank_transfer': return 'Virement';
      case 'cash': return 'Espèces';
      default: return method;
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
      field: 'description',
      headerName: 'Description',
      width: 200
    },
    {
      field: 'doctor',
      headerName: 'Médecin',
      width: 150
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
      headerName: 'Montant',
      width: 100,
      align: 'right',
      renderCell: (value) => (
        <Typography 
          variant="body2" 
          fontWeight={600}
          color={value >= 0 ? 'success.main' : 'error.main'}
        >
          {formatCurrency(value)}
        </Typography>
      )
    },
    {
      field: 'paymentMethod',
      headerName: 'Méthode',
      width: 120,
      renderCell: (value) => getMethodLabel(value)
    },
    {
      field: 'status',
      headerName: 'Statut',
      width: 100,
      renderCell: (value) => (
        <Chip 
          label={value === 'paid' ? 'Payé' : value === 'pending' ? 'En attente' : value === 'processed' ? 'Traité' : 'Échoué'} 
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

  const renderStatus = (status) => {
    const color = status === 'active' ? 'success' : status === 'inactive' ? 'error' : 'warning';
    const label = status === 'active' ? 'Actif' : status === 'inactive' ? 'Inactif' : 'En attente';
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
            {patient.gender === 'Masculin' ? '👨' : '👩'}
          </Avatar>
          <Box>
            <Typography variant="h4" className="patient-name">
              {patient.name} {renderStatus(patient.status)}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {patient.age} ans • {patient.gender} • Groupe sanguin {patient.bloodType}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Patient depuis le {new Date(patient.joinDate).toLocaleDateString('fr-FR')}
            </Typography>
          </Box>
        </Box>
        
        <Button variant="outlined" onClick={handleBack}>
          Retour à la liste
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} className="patient-tabs">
          <Tab icon={<PersonIcon />} label="Informations personnelles" />
          <Tab icon={<MedicalIcon />} label="Dossier médical" />
          <Tab icon={<AccountBalanceIcon />} label="Finances" />
        </Tabs>
      </Box>

      {/* Onglet Informations personnelles */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card className="info-card">
              <CardHeader 
                title="Coordonnées"
                avatar={<PersonIcon />}
              />
              <CardContent>
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <EmailIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Email" 
                      secondary={patient.email} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <PhoneIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Téléphone" 
                      secondary={patient.phone} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <LocationIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Adresse" 
                      secondary={patient.address} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <EmergencyIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Contact d'urgence" 
                      secondary={patient.emergencyContact} 
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
                title="Informations médicales"
                avatar={<MedicalIcon />}
              />
              <CardContent>
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <BloodIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Groupe sanguin" 
                      secondary={patient.bloodType} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <MedicalIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Médecin traitant" 
                      secondary={patient.assignedDoctor} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <CalendarIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Dernière consultation" 
                      secondary={patient.lastConsultation} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <AllergyIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Allergies" 
                      secondary={
                        patient.allergies.length > 0 
                          ? patient.allergies.map(a => <Chip key={a} label={a} size="small" color="warning" sx={{ mr: 0.5, mb: 0.5 }} />)
                          : "Aucune allergie connue"
                      } 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <AccountBalanceIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Assurance" 
                      secondary={patient.insurance} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Onglet Dossier médical */}
      <TabPanel value={tabValue} index={1}>
        <Card className="medical-card">
          <CardHeader 
            title="Historique médical"
            avatar={<MedicalIcon />}
          />
          <CardContent>
            {patient.medicalHistory.length > 0 ? (
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
                            {item.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.date}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Médecin:</strong> {item.doctor}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Diagnostic:</strong> {item.diagnosis}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Traitement:</strong> {item.treatment}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Notes:</strong> {item.notes}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Aucun historique médical disponible
              </Typography>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Onglet Finances */}
      <TabPanel value={tabValue} index={2}>
        {/* Cartes de statistiques financières */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="finance-card">
              <CardContent>
                <Box className="finance-content">
                  <Box>
                    <Typography variant="h5" className="finance-number">
                      {formatCurrency(patient.finances.totalSpent)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total dépensé
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
                      {patient.finances.consultationsCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Consultations
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Moy: {formatCurrency(patient.finances.averageConsultationCost)}
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
                      {formatCurrency(patient.finances.pendingPayments)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En attente
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dernier: {patient.finances.lastPayment}
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
                      {formatCurrency(patient.finances.totalRefunds)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Remboursements
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Méthode: {patient.finances.preferredPaymentMethod}
                    </Typography>
                  </Box>
                  <AccountBalanceIcon className="finance-icon" />
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
                  Évolution des dépenses (5 derniers mois)
                </Typography>
                {patient.monthlyStats.map((stat) => (
                  <Box key={stat.month} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{stat.month}</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(stat.spent)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stat.spent / 150) * 100} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {stat.consultations} consultation{stat.consultations > 1 ? 's' : ''}
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
                  Résumé financier
                </Typography>
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Total dépensé" 
                      secondary={formatCurrency(patient.finances.totalSpent)} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Coût moyen par consultation" 
                      secondary={formatCurrency(patient.finances.averageConsultationCost)} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Paiements en attente" 
                      secondary={formatCurrency(patient.finances.pendingPayments)} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Méthode de paiement préférée" 
                      secondary={patient.finances.preferredPaymentMethod} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Dernier paiement" 
                      secondary={patient.finances.lastPayment} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Transactions récentes */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 0 }}>
              <Typography variant="h6">
                Historique des transactions
              </Typography>
            </Box>
            
            <DataTable
              data={patient.transactions}
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
        <Button variant="outlined" color="warning">
          Envoyer un message
        </Button>
        <Button variant="outlined" color="error">
          Archiver
        </Button>
      </Box>
    </Box>
  );
};

export default PatientDetails;