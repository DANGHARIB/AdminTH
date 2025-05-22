import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as ThemeIcon,
  Storage as DataIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import './Settings.css';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
  
  // États des paramètres
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Administrateur',
    email: user?.email || 'admin@medadmin.com',
    phone: '+33 1 23 45 67 89',
    role: 'Administrateur principal'
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newDoctorRegistration: true,
    paymentAlerts: true,
    systemMaintenance: true,
    weeklyReports: true
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAlerts: true,
    passwordExpiry: 90
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Profil mis à jour avec succès');
      setEditMode(false);
    } catch {
      setError('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (setting) => (event) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handleSecurityChange = (setting) => (event) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: typeof event.target.value !== 'undefined' ? event.target.value : event.target.checked
    }));
  };

  const handleConfirmAction = async () => {
    setLoading(true);
    try {
      switch (confirmDialog.action) {
        case 'export':
          // Simuler l'export des données
          await new Promise(resolve => setTimeout(resolve, 2000));
          setSuccess('Export des données initié. Vous recevrez un email avec le fichier.');
          break;
        case 'reset':
          // Simuler la réinitialisation
          await new Promise(resolve => setTimeout(resolve, 1000));
          setSuccess('Paramètres réinitialisés aux valeurs par défaut.');
          break;
        case 'backup':
          // Simuler la sauvegarde
          await new Promise(resolve => setTimeout(resolve, 1500));
          setSuccess('Sauvegarde créée avec succès.');
          break;
      }
    } catch {
      setError('Une erreur est survenue lors de l\'opération.');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: null });
    }
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </Box>
  );

  return (
    <Box className="settings-page">
      <Box className="page-header">
        <Typography variant="h4" className="page-title">
          Paramètres
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gérez les paramètres de votre compte et de la plateforme
        </Typography>
      </Box>

      {(success || error) && (
        <Alert 
          severity={success ? 'success' : 'error'} 
          sx={{ mb: 3 }}
          onClose={() => {
            setSuccess('');
            setError('');
          }}
        >
          {success || error}
        </Alert>
      )}

      <Card className="settings-card">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} className="settings-tabs">
            <Tab icon={<PersonIcon />} label="Profil" />
            <Tab icon={<SecurityIcon />} label="Sécurité" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
            <Tab icon={<DataIcon />} label="Données" />
          </Tabs>
        </Box>

        {/* Onglet Profil */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card className="profile-card">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      mb: 2,
                      bgcolor: '#2563eb',
                      fontSize: '2rem'
                    }}
                  >
                    {profileData.name.charAt(0)}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {profileData.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {profileData.role}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(!editMode)}
                    size="small"
                  >
                    {editMode ? 'Annuler' : 'Modifier'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader title="Informations personnelles" />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nom complet"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Téléphone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Rôle"
                        value={profileData.role}
                        disabled
                      />
                    </Grid>
                  </Grid>
                  
                  {editMode && (
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleProfileSave}
                        disabled={loading}
                      >
                        Enregistrer
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={() => setEditMode(false)}
                      >
                        Annuler
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Onglet Sécurité */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Authentification" />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Authentification à deux facteurs"
                        secondary="Ajoutez une couche de sécurité supplémentaire"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={securitySettings.twoFactorAuth}
                          onChange={handleSecurityChange('twoFactorAuth')}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Alertes de connexion"
                        secondary="Recevoir une notification lors de nouvelles connexions"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={securitySettings.loginAlerts}
                          onChange={handleSecurityChange('loginAlerts')}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Session et mots de passe" />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Timeout de session (minutes)"
                        value={securitySettings.sessionTimeout}
                        onChange={handleSecurityChange('sessionTimeout')}
                        inputProps={{ min: 5, max: 480 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Expiration mot de passe (jours)"
                        value={securitySettings.passwordExpiry}
                        onChange={handleSecurityChange('passwordExpiry')}
                        inputProps={{ min: 30, max: 365 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant="outlined" fullWidth>
                        Changer le mot de passe
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Onglet Notifications */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Préférences de notification" />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Notifications email"
                        secondary="Recevoir les notifications par email"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onChange={handleNotificationChange('emailNotifications')}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Notifications SMS"
                        secondary="Recevoir les notifications par SMS"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.smsNotifications}
                          onChange={handleNotificationChange('smsNotifications')}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Types de notifications" />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Nouveaux médecins"
                        secondary="Notifications lors d'inscriptions"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.newDoctorRegistration}
                          onChange={handleNotificationChange('newDoctorRegistration')}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Alertes de paiement"
                        secondary="Notifications pour les paiements"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.paymentAlerts}
                          onChange={handleNotificationChange('paymentAlerts')}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Maintenance système"
                        secondary="Alertes de maintenance"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.systemMaintenance}
                          onChange={handleNotificationChange('systemMaintenance')}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Rapports hebdomadaires"
                        secondary="Recevoir un résumé chaque semaine"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.weeklyReports}
                          onChange={handleNotificationChange('weeklyReports')}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Onglet Données */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Export de données" />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Exportez toutes vos données dans un format portable.
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setConfirmDialog({ open: true, action: 'export' })}
                  >
                    Exporter mes données
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Sauvegarde" />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Créez une sauvegarde de la configuration de la plateforme.
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setConfirmDialog({ open: true, action: 'backup' })}
                  >
                    Créer une sauvegarde
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Réinitialisation" />
                <CardContent>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Cette action remettra tous les paramètres à leur valeur par défaut.
                  </Alert>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setConfirmDialog({ open: true, action: 'reset' })}
                  >
                    Réinitialiser les paramètres
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Dialog de confirmation */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={() => setConfirmDialog({ open: false, action: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirmer l'action
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.action === 'export' && 'Êtes-vous sûr de vouloir exporter toutes vos données ? Cette opération peut prendre plusieurs minutes.'}
            {confirmDialog.action === 'backup' && 'Êtes-vous sûr de vouloir créer une sauvegarde de la configuration ?'}
            {confirmDialog.action === 'reset' && 'Êtes-vous sûr de vouloir réinitialiser tous les paramètres ? Cette action est irréversible.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: null })}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmAction}
            variant="contained"
            color={confirmDialog.action === 'reset' ? 'error' : 'primary'}
            disabled={loading}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;