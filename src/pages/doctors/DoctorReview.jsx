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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  School as EducationIcon,
  Work as ExperienceIcon,
  EmojiEvents as AwardIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import './DoctorReview.css';

// Données simulées pour un docteur en attente
const MOCK_PENDING_DOCTOR = {
  id: 3,
  name: 'Dr. Thomas Petit',
  email: 'thomas.petit@example.com',
  phone: '+33 6 34 56 78 90',
  gender: 'Masculin',
  birthDate: '1985-03-15',
  address: '123 Avenue des Médecins, 75008 Paris, France',
  nationality: 'Française',
  specialty: 'Généraliste',
  status: 'pending',
  submissionDate: '2025-05-20',
  profilePhoto: null,
  
  // Informations professionnelles
  medicalLicense: 'FR-MED-123456789',
  licenseExpiry: '2028-12-31',
  practiceYears: 8,
  currentHospital: 'Hôpital Saint-Louis',
  
  // Formation
  education: [
    {
      degree: 'Doctorat en Médecine',
      institution: 'Université Paris Descartes',
      year: '2017',
      grade: 'Mention Très Bien'
    },
    {
      degree: 'Diplôme d\'Études Spécialisées en Médecine Générale',
      institution: 'Université Paris Diderot',
      year: '2020',
      grade: 'Mention Bien'
    }
  ],
  
  // Certifications
  certifications: [
    {
      name: 'Certification en Urgances Médicales',
      issuer: 'SAMU de Paris',
      date: '2021-06-15',
      valid: true
    },
    {
      name: 'Formation en Télémédecine',
      issuer: 'Ordre des Médecins',
      date: '2022-03-20',
      valid: true
    }
  ],
  
  // Expérience
  experience: [
    {
      position: 'Médecin Généraliste',
      institution: 'Hôpital Saint-Louis',
      period: '2020 - Présent',
      description: 'Consultations générales, urgences, suivi de patients chroniques'
    },
    {
      position: 'Interne en Médecine Générale',
      institution: 'CHU Pitié-Salpêtrière',
      period: '2017 - 2020',
      description: 'Formation pratique en médecine générale et spécialités'
    }
  ],
  
  // Récompenses et reconnaissances
  awards: [
    {
      title: 'Prix du Jeune Médecin 2022',
      issuer: 'Ordre des Médecins de Paris',
      date: '2022-11-15',
      description: 'Reconnaissance pour l\'excellence en médecine générale'
    }
  ],
  
  // Documents soumis
  documents: [
    { name: 'Diplôme de Médecine', verified: true },
    { name: 'Licence Médicale', verified: true },
    { name: 'Certificat d\'Expérience', verified: false },
    { name: 'Photo d\'Identité', verified: true },
    { name: 'Casier Judiciaire', verified: true }
  ],
  
  // Motivation
  motivation: "Je souhaite rejoindre votre plateforme pour élargir ma pratique médicale et offrir des consultations de qualité à un plus large public. Mon expérience en médecine générale et ma formation continue me permettent d'apporter une expertise solide dans le domaine de la télémédecine."
};

const DoctorReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [emailContent, setEmailContent] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (id === '3' || id === '4') {
          setDoctor(MOCK_PENDING_DOCTOR);
        } else {
          throw new Error('Médecin non trouvé');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const handleAction = (type) => {
    setActionDialog({ open: true, type });
  };

  const handleConfirmAction = async () => {
    try {
      setLoading(true);
      
      switch (actionDialog.type) {
        case 'approve':
          // await doctorsService.approveDoctor(doctor.id);
          break;
        case 'reject':
          // await doctorsService.rejectDoctor(doctor.id, rejectionReason);
          break;
        case 'request-info': {
          // Déplacement des déclarations dans un bloc pour éviter no-case-declarations
          const subject = `Demande d'informations supplémentaires - ${doctor.name}`;
          const body = emailContent || `Bonjour ${doctor.name},\n\nNous avons examiné votre candidature et aurions besoin d'informations supplémentaires...\n\nCordialement,\nL'équipe d'administration`;
          window.location.href = `mailto:${doctor.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          break;
        }
      }
      
      setActionDialog({ open: false, type: null });
      setRejectionReason('');
      setEmailContent('');
      
      // Rediriger vers la liste des médecins après action
      if (actionDialog.type !== 'request-info') {
        navigate('/doctors');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/doctors');
  };

  const renderDocumentStatus = (doc) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2">{doc.name}</Typography>
      <Chip 
        label={doc.verified ? 'Vérifié' : 'En attente'} 
        color={doc.verified ? 'success' : 'warning'}
        size="small"
      />
    </Box>
  );

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
    <Box className="doctor-review-page">
      {/* Header */}
      <Box className="review-header">
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
            <Typography variant="body1" color="text.secondary">
              {doctor.specialty} • Candidature soumise le {new Date(doctor.submissionDate).toLocaleDateString('fr-FR')}
            </Typography>
            <Chip 
              label="En attente de validation" 
              color="warning" 
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
        
        <Button variant="outlined" onClick={handleBack}>
          Retour à la liste
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Informations personnelles */}
        <Grid item xs={12} md={6}>
          <Card className="info-card">
            <CardHeader 
              title="Informations personnelles"
              avatar={<PersonIcon />}
            />
            <CardContent>
              <List disablePadding>
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
                    primary="Date de naissance" 
                    secondary={new Date(doctor.birthDate).toLocaleDateString('fr-FR')}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Genre" 
                    secondary={doctor.gender}
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
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Nationalité" 
                    secondary={doctor.nationality}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Informations professionnelles */}
        <Grid item xs={12} md={6}>
          <Card className="info-card">
            <CardHeader 
              title="Informations professionnelles"
              avatar={<BadgeIcon />}
            />
            <CardContent>
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
                    primary="Licence médicale" 
                    secondary={doctor.medicalLicense}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Expiration licence" 
                    secondary={new Date(doctor.licenseExpiry).toLocaleDateString('fr-FR')}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Années d'expérience" 
                    secondary={`${doctor.practiceYears} ans`}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText 
                    primary="Établissement actuel" 
                    secondary={doctor.currentHospital}
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Formation */}
        <Grid item xs={12} md={6}>
          <Card className="info-card">
            <CardHeader 
              title="Formation"
              avatar={<EducationIcon />}
            />
            <CardContent>
              {doctor.education.map((edu, index) => (
                <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < doctor.education.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {edu.degree}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {edu.institution} • {edu.year}
                  </Typography>
                  <Typography variant="caption" color="primary">
                    {edu.grade}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Expérience */}
        <Grid item xs={12} md={6}>
          <Card className="info-card">
            <CardHeader 
              title="Expérience professionnelle"
              avatar={<ExperienceIcon />}
            />
            <CardContent>
              {doctor.experience.map((exp, index) => (
                <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < doctor.experience.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {exp.position}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {exp.institution} • {exp.period}
                  </Typography>
                  <Typography variant="caption">
                    {exp.description}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Certifications */}
        <Grid item xs={12} md={6}>
          <Card className="info-card">
            <CardHeader 
              title="Certifications"
              avatar={<AwardIcon />}
            />
            <CardContent>
              {doctor.certifications.map((cert, index) => (
                <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < doctor.certifications.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {cert.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cert.issuer} • {new Date(cert.date).toLocaleDateString('fr-FR')}
                  </Typography>
                  <Chip 
                    label={cert.valid ? 'Valide' : 'Expiré'} 
                    color={cert.valid ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Documents */}
        <Grid item xs={12} md={6}>
          <Card className="info-card">
            <CardHeader title="Documents soumis" />
            <CardContent>
              <List disablePadding>
                {doctor.documents.map((doc, index) => (
                  <ListItem key={index} disablePadding sx={{ py: 1 }}>
                    {renderDocumentStatus(doc)}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Récompenses */}
        {doctor.awards.length > 0 && (
          <Grid item xs={12}>
            <Card className="info-card">
              <CardHeader 
                title="Récompenses et reconnaissances"
                avatar={<AwardIcon />}
              />
              <CardContent>
                {doctor.awards.map((award, index) => (
                  <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < doctor.awards.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {award.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {award.issuer} • {new Date(award.date).toLocaleDateString('fr-FR')}
                    </Typography>
                    <Typography variant="caption">
                      {award.description}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Motivation */}
        <Grid item xs={12}>
          <Card className="info-card">
            <CardHeader title="Lettre de motivation" />
            <CardContent>
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                {doctor.motivation}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box className="action-buttons">
        <Button
          variant="contained"
          color="success"
          startIcon={<ApproveIcon />}
          size="large"
          onClick={() => handleAction('approve')}
          className="approve-button"
        >
          Approuver le médecin
        </Button>
        
        <Button
          variant="outlined"
          color="primary"
          startIcon={<EmailIcon />}
          size="large"
          onClick={() => handleAction('request-info')}
        >
          Demander des infos
        </Button>
        
        <Button
          variant="contained"
          color="error"
          startIcon={<RejectIcon />}
          size="large"
          onClick={() => handleAction('reject')}
          className="reject-button"
        >
          Rejeter la candidature
        </Button>
      </Box>

      {/* Action Dialogs */}
      <Dialog 
        open={actionDialog.open} 
        onClose={() => setActionDialog({ open: false, type: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.type === 'approve' && 'Approuver le médecin'}
          {actionDialog.type === 'reject' && 'Rejeter la candidature'}
          {actionDialog.type === 'request-info' && 'Demander des informations'}
        </DialogTitle>
        <DialogContent>
          {actionDialog.type === 'approve' && (
            <Typography>
              Êtes-vous sûr de vouloir approuver ce médecin ? Il pourra alors accéder à la plateforme et commencer à recevoir des patients.
            </Typography>
          )}
          {actionDialog.type === 'reject' && (
            <Box>
              <Typography sx={{ mb: 2 }}>
                Veuillez indiquer la raison du rejet :
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Expliquez pourquoi cette candidature est rejetée..."
              />
            </Box>
          )}
          {actionDialog.type === 'request-info' && (
            <Box>
              <Typography sx={{ mb: 2 }}>
                Personnalisez le message à envoyer au médecin :
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder={`Bonjour ${doctor?.name},\n\nNous avons examiné votre candidature et aurions besoin d'informations supplémentaires...\n\nCordialement,\nL'équipe d'administration`}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: null })}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmAction}
            variant="contained"
            color={actionDialog.type === 'reject' ? 'error' : 'primary'}
            disabled={actionDialog.type === 'reject' && !rejectionReason.trim()}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorReview;