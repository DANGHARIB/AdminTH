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
        setError('ID patient manquant');
        setLoading(false);
        return;
      }

      try {
        console.log('Récupération du patient avec ID:', id);
        const fetchedPatient = await patientsService.getPatientById(id);
        console.log('Patient récupéré:', fetchedPatient);
        setPatient(fetchedPatient);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération du patient:', err);
        setError(err.message || 'Patient non trouvé');
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
      case 'consultation': return 'Consultation';
      case 'urgence': return 'Urgence';
      case 'refund': return 'Remboursement';
      default: return type || 'Type inconnu';
    }
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case 'card': return 'Carte bancaire';
      case 'bank_transfer': return 'Virement';
      case 'cash': return 'Espèces';
      default: return method || 'Méthode inconnue';
    }
  };

  const transactionColumns = [
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      renderCell: (value) => {
        if (!value) return 'Date inconnue';
        return new Date(value).toLocaleDateString('fr-FR');
      }
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 200,
      renderCell: (value) => value || 'Description non disponible'
    },
    {
      field: 'doctor',
      headerName: 'Médecin',
      width: 150,
      renderCell: (value) => value || 'Médecin non spécifié'
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
          color={(value || 0) >= 0 ? 'success.main' : 'error.main'}
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
          label={value === 'paid' ? 'Payé' : value === 'pending' ? 'En attente' : value === 'processed' ? 'Traité' : 'Statut inconnu'} 
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

  if (!patient) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="warning">Patient non trouvé</Alert>
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
            {patient.gender === 'Masculin' ? '👨' : patient.gender === 'Féminin' ? '👩' : '👤'}
          </Avatar>
          <Box>
            <Typography variant="h4" className="patient-name">
              {patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Nom non disponible'} {renderStatus(patient.status)}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {patient.age || 0} ans • {patient.gender || 'Genre non spécifié'} • Groupe sanguin {patient.bloodType || 'Non renseigné'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Patient depuis le {patient.joinDate ? new Date(patient.joinDate).toLocaleDateString('fr-FR') : 'Date inconnue'}
            </Typography>
          </Box>
        </Box>
        
        <Button variant="outlined" onClick={handleBack}>
          Retour à la liste
        </Button>
      </Box>

      {/* Debug info en mode développement */}
      {import.meta.env.DEV && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Debug: Patient ID: {patient.id}, Données disponibles: {Object.keys(patient).join(', ')}
        </Alert>
      )}

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
                      secondary={patient.email || 'Email non disponible'} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <PhoneIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Téléphone" 
                      secondary={patient.phone || 'Téléphone non disponible'} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <LocationIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Adresse" 
                      secondary={patient.address || 'Adresse non disponible'} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <EmergencyIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Contact d'urgence" 
                      secondary={patient.emergencyContact || 'Contact d\'urgence non disponible'} 
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
                      secondary={patient.bloodType || 'Non renseigné'} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <MedicalIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Médecin traitant" 
                      secondary={patient.assignedDoctor || 'Aucun médecin assigné'} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <CalendarIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Dernière consultation" 
                      secondary={patient.lastConsultation ? new Date(patient.lastConsultation).toLocaleDateString('fr-FR') : 'Aucune consultation'} 
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
                          : "Aucune allergie connue"
                      } 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <AccountBalanceIcon sx={{ mr: 2, color: '#6b7280' }} />
                    <ListItemText 
                      primary="Assurance" 
                      secondary={patient.insurance || 'Non renseignée'} 
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
                            {item.description || 'Description non disponible'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.date || 'Date inconnue'}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Médecin:</strong> {item.doctor || 'Médecin non spécifié'}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Diagnostic:</strong> {item.diagnosis || 'Diagnostic non disponible'}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Traitement:</strong> {item.treatment || 'Traitement non spécifié'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Notes:</strong> {item.notes || 'Aucune note'}
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
                      {formatCurrency(patient.finances?.totalSpent)}
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
                      {patient.finances?.consultationsCount || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Consultations
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Moy: {formatCurrency(patient.finances?.averageConsultationCost)}
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
                      En attente
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dernier: {patient.finances?.lastPayment || 'Aucun'}
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
                      Remboursements
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Méthode: {patient.finances?.preferredPaymentMethod || 'Non spécifiée'}
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
                    Aucune donnée mensuelle disponible
                  </Typography>
                )}
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
                      secondary={formatCurrency(patient.finances?.totalSpent)} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Coût moyen par consultation" 
                      secondary={formatCurrency(patient.finances?.averageConsultationCost)} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Paiements en attente" 
                      secondary={formatCurrency(patient.finances?.pendingPayments)} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Méthode de paiement préférée" 
                      secondary={patient.finances?.preferredPaymentMethod || 'Non spécifiée'} 
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText 
                      primary="Dernier paiement" 
                      secondary={patient.finances?.lastPayment || 'Aucun paiement'} 
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