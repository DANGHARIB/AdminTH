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
  Tabs,
  Tab
} from '@mui/material';

// Données simulées
const MOCK_PATIENTS = {
  1: {
    id: 1,
    name: 'Jean Dupont',
    age: 45,
    birthdate: '15/03/1978',
    email: 'jean.dupont@example.com',
    phone: '06 12 34 56 78',
    address: '25 rue des Lilas, 75013 Paris',
    status: 'Actif',
    bloodType: 'A+',
    allergies: ['Pénicilline', 'Arachides'],
    medicalHistory: [
      { date: '10/04/2023', description: 'Consultation pour douleurs lombaires' },
      { date: '22/08/2022', description: 'Vaccination grippe saisonnière' },
    ],
    assignedDoctor: 'Dr. Martin Dupont'
  },
  2: {
    id: 2,
    name: 'Marie Martin',
    age: 32,
    birthdate: '22/07/1991', 
    email: 'marie.martin@example.com',
    phone: '06 98 76 54 32',
    address: '8 avenue Victor Hugo, 75016 Paris',
    status: 'Actif',
    bloodType: 'O-',
    allergies: [],
    medicalHistory: [
      { date: '15/01/2023', description: 'Consultation pour angine' },
      { date: '03/05/2022', description: 'Examen de routine' },
    ],
    assignedDoctor: 'Dr. Sophie Laurent'
  },
  // Les autres patients peuvent être ajoutés ici
};

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Simulation d'un chargement de données
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        // Simuler un délai réseau
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

  // Rendu du statut avec une couleur différente
  const renderStatus = (status) => {
    const color = status === 'Actif' ? 'success' : 'error';
    return <Chip label={status} color={color} size="small" />;
  };

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

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {patient.name} {renderStatus(patient.status)}
        </Typography>
        <Button variant="outlined" onClick={handleBack}>
          Retour à la liste
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Informations personnelles" />
        <Tab label="Dossier médical" />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Coordonnées
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Âge" 
                    secondary={`${patient.age} ans (${patient.birthdate})`} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Email" 
                    secondary={patient.email} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Téléphone" 
                    secondary={patient.phone} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Adresse" 
                    secondary={patient.address} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informations médicales
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Groupe sanguin" 
                    secondary={patient.bloodType} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Médecin traitant" 
                    secondary={patient.assignedDoctor} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Allergies" 
                    secondary={
                      patient.allergies.length > 0 
                        ? patient.allergies.map(a => <Chip key={a} label={a} size="small" sx={{ mr: 0.5, mb: 0.5 }} />)
                        : "Aucune allergie connue"
                    } 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Historique médical
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {patient.medicalHistory.length > 0 ? (
            <List>
              {patient.medicalHistory.map((item, index) => (
                <ListItem key={index} divider={index < patient.medicalHistory.length - 1}>
                  <ListItemText 
                    primary={item.description}
                    secondary={`Date: ${item.date}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Aucun historique médical disponible
            </Typography>
          )}
        </Paper>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button variant="contained" color="primary" sx={{ mr: 2 }}>
          Modifier
        </Button>
        <Button variant="outlined" color="error">
          Supprimer
        </Button>
      </Box>
    </Box>
  );
};

export default PatientDetails;