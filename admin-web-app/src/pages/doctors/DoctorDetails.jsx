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
  Alert
} from '@mui/material';

// Données simulées
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
    patients: 42
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
    patients: 56
  },
  // Les autres médecins peuvent être ajoutés ici
};

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulation d'un chargement de données
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        // Simuler un délai réseau
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
          {doctor.name}
        </Typography>
        <Button variant="outlined" onClick={handleBack}>
          Retour à la liste
        </Button>
      </Box>

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
                  primary="Nombre de patients" 
                  secondary={doctor.patients} 
                  primaryTypographyProps={{ variant: 'subtitle2' }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
      
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

export default DoctorDetails;