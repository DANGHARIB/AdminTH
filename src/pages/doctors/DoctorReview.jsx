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

// Mock data for a pending doctor
const MOCK_PENDING_DOCTOR = {
  id: 3,
  name: 'Dr. Thomas Petit',
  email: 'thomas.petit@example.com',
  phone: '+33 6 34 56 78 90',
  gender: 'Male',
  birthDate: '1985-03-15',
  address: '123 Avenue des Médecins, 75008 Paris, France',
  nationality: 'French',
  specialty: 'General Practitioner',
  status: 'pending',
  submissionDate: '2025-05-20',
  profilePhoto: null,

  // Professional details
  medicalLicense: 'FR-MED-123456789',
  licenseExpiry: '2028-12-31',
  practiceYears: 8,
  currentHospital: 'Hôpital Saint-Louis',

  // Education
  education: [
    {
      degree: 'MD in Medicine',
      institution: 'Université Paris Descartes',
      year: '2017',
      grade: 'High Honors'
    },
    {
      degree: 'Specialty Diploma in General Medicine',
      institution: 'Université Paris Diderot',
      year: '2020',
      grade: 'Honors'
    }
  ],

  // Certifications
  certifications: [
    {
      name: 'Emergency Medicine Certification',
      issuer: 'SAMU de Paris',
      date: '2021-06-15',
      valid: true
    },
    {
      name: 'Telemedicine Training',
      issuer: 'Ordre des Médecins',
      date: '2022-03-20',
      valid: true
    }
  ],

  // Experience
  experience: [
    {
      position: 'General Practitioner',
      institution: 'Hôpital Saint-Louis',
      period: '2020 - Present',
      description: 'General consultations, emergencies, chronic patient follow-up'
    },
    {
      position: 'Medical Intern',
      institution: 'CHU Pitié-Salpêtrière',
      period: '2017 - 2020',
      description: 'Practical training in general medicine and specialties'
    }
  ],

  // Awards
  awards: [
    {
      title: 'Young Physician Award 2022',
      issuer: 'Ordre des Médecins de Paris',
      date: '2022-11-15',
      description: 'Recognition for excellence in general medicine'
    }
  ],

  // Submitted documents
  documents: [
    { name: 'Medical Diploma', verified: true },
    { name: 'Medical License', verified: true },
    { name: 'Experience Certificate', verified: false },
    { name: 'ID Photo', verified: true },
    { name: 'Criminal Record Check', verified: true }
  ],

  // Motivation letter
  motivation: "I want to join your platform to expand my medical practice and provide quality consultations to a wider audience. My experience in general medicine and continuous training allow me to bring solid expertise to telemedicine."
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (id === '3' || id === '4') {
          setDoctor(MOCK_PENDING_DOCTOR);
        } else {
          throw new Error('Doctor not found');
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
          const subject = `Additional Information Request - ${doctor.name}`;
          const body = emailContent || `Hello ${doctor.name},\n\nWe have reviewed your application and need some additional details.\n\nBest regards,\nAdmin Team`;
          window.location.href = `mailto:${doctor.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          break;
        }
      }
      setActionDialog({ open: false, type: null });
      setRejectionReason('');
      setEmailContent('');
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
        label={doc.verified ? 'Verified' : 'Pending'} 
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
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={handleBack}>
          Back to list
        </Button>
      </Box>
    );
  }

  return (
    <Box className="doctor-review-page">
      <Box className="review-header">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: '#2563eb', fontSize: '24px' }}>
            {doctor.name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Box>
            <Typography variant="h4">{doctor.name}</Typography>
            <Typography variant="body1" color="text.secondary">
              {doctor.specialty} • Submitted on {new Date(doctor.submissionDate).toLocaleDateString()}
            </Typography>
            <Chip 
              label="Pending review" 
              color="warning" 
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
        <Button variant="outlined" onClick={handleBack}>
          Back to list
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Personal Information" avatar={<PersonIcon />} />
            <CardContent>
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <EmailIcon sx={{ mr: 2 }} />
                  <ListItemText primary="Email" secondary={doctor.email} primaryTypographyProps={{ variant: 'subtitle2' }} />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <PhoneIcon sx={{ mr: 2 }} />
                  <ListItemText primary="Phone" secondary={doctor.phone} primaryTypographyProps={{ variant: 'subtitle2' }} />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText primary="Date of Birth" secondary={new Date(doctor.birthDate).toLocaleDateString()} primaryTypographyProps={{ variant: 'subtitle2' }} />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText primary="Gender" secondary={doctor.gender} primaryTypographyProps={{ variant: 'subtitle2' }} />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <LocationIcon sx={{ mr: 2 }} />
                  <ListItemText primary="Address" secondary={doctor.address} primaryTypographyProps={{ variant: 'subtitle2' }} />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText primary="Nationality" secondary={doctor.nationality} primaryTypographyProps={{ variant: 'subtitle2' }} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Professional Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Professional Information" avatar={<BadgeIcon />} />
            <CardContent>
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText primary="Specialty" secondary={doctor.specialty} primaryTypographyProps={{ variant: 'subtitle2' }} />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText primary="Medical License" secondary={doctor.medicalLicense} primaryTypographyProps={{ variant: 'subtitle2' }} />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText primary="License Expiry" secondary={new Date(doctor.licenseExpiry).toLocaleDateString()} primaryTypographyProps={{ variant: 'subtitle2' }} />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText primary="Years of Practice" secondary={`${doctor.practiceYears} years`} primaryTypographyProps={{ variant: 'subtitle2' }} />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText primary="Current Hospital" secondary={doctor.currentHospital} primaryTypographyProps={{ variant: 'subtitle2' }} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Education */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Education" avatar={<EducationIcon />} />
            <CardContent>
              {doctor.education.map((edu, idx) => (
                <Box key={idx} sx={{ mb: 2, pb: 2, borderBottom: idx < doctor.education.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight={600}>{edu.degree}</Typography>
                  <Typography variant="body2" color="text.secondary">{edu.institution} • {edu.year}</Typography>
                  <Typography variant="caption" color="primary">{edu.grade}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Work Experience */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Work Experience" avatar={<ExperienceIcon />} />
            <CardContent>
              {doctor.experience.map((exp, idx) => (
                <Box key={idx} sx={{ mb: 2, pb: 2, borderBottom: idx < doctor.experience.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight={600}>{exp.position}</Typography>
                  <Typography variant="body2" color="text.secondary">{exp.institution} • {exp.period}</Typography>
                  <Typography variant="caption">{exp.description}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Certifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Certifications" avatar={<AwardIcon />} />
            <CardContent>
              {doctor.certifications.map((cert, idx) => (
                <Box key={idx} sx={{ mb: 2, pb: 2, borderBottom: idx < doctor.certifications.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight={600}>{cert.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{cert.issuer} • {new Date(cert.date).toLocaleDateString()}</Typography>
                  <Chip label={cert.valid ? 'Valid' : 'Expired'} color={cert.valid ? 'success' : 'error'} size="small" />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Submitted Documents */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Submitted Documents" />
            <CardContent>
              <List disablePadding>
                {doctor.documents.map((doc, idx) => (
                  <ListItem key={idx} disablePadding sx={{ py: 1 }}>
                    {renderDocumentStatus(doc)}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Awards */}
        {doctor.awards.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Awards and Recognitions" avatar={<AwardIcon />} />
              <CardContent>
                {doctor.awards.map((award, idx) => (
                  <Box key={idx} sx={{ mb: 2, pb: 2, borderBottom: idx < doctor.awards.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight={600}>{award.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{award.issuer} • {new Date(award.date).toLocaleDateString()}</Typography>
                    <Typography variant="caption">{award.description}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Motivation Letter */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Motivation Letter" />
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
        >
          Approve Doctor
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<EmailIcon />}
          size="large"
          onClick={() => handleAction('request-info')}
        >
          Request More Info
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<RejectIcon />}
          size="large"
          onClick={() => handleAction('reject')}
        >
          Reject Application
        </Button>
      </Box>

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, type: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.type === 'approve' && 'Approve Doctor'}
          {actionDialog.type === 'reject' && 'Reject Application'}
          {actionDialog.type === 'request-info' && 'Request Additional Information'}
        </DialogTitle>
        <DialogContent>
          {actionDialog.type === 'approve' && (
            <Typography>
              Are you sure you want to approve this doctor? They will gain platform access and start receiving patients.
            </Typography>
          )}
          {actionDialog.type === 'reject' && (
            <Box>
              <Typography sx={{ mb: 2 }}>
                Please provide a reason for rejection:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this application is rejected..."
              />
            </Box>
          )}
          {actionDialog.type === 'request-info' && (
            <Box>
              <Typography sx={{ mb: 2 }}>
                Customize the message to send to the doctor:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder={`Hello ${doctor?.name},\n\nWe have reviewed your application and need some additional information...\n\nBest regards,\nAdmin Team`}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={actionDialog.type === 'reject' ? 'error' : 'primary'}
            disabled={actionDialog.type === 'reject' && !rejectionReason.trim()}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorReview;
