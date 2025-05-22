import { Box, Typography, Grid, Paper } from '@mui/material';

const Dashboard = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tableau de bord
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column',
              height: 240
            }}
          >
            <Typography variant="h6" gutterBottom>
              Statistiques Médecins
            </Typography>
            <Typography variant="body1">
              Nombre total de médecins : 42
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Ces données sont simulées pour la démonstration.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column',
              height: 240
            }}
          >
            <Typography variant="h6" gutterBottom>
              Statistiques Patients
            </Typography>
            <Typography variant="body1">
              Nombre total de patients : 128
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Ces données sont simulées pour la démonstration.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column',
              height: 240
            }}
          >
            <Typography variant="h6" gutterBottom>
              Activité Récente
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Dr. Martin a mis à jour son profil
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Nouveau patient enregistré: Dubois, Jean
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Ces données sont simulées pour la démonstration.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;