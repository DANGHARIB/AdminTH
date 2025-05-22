import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  LinearProgress,
  Divider,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  LocalHospital as DoctorIcon,
  People as PeopleIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as PendingIcon,
  CheckCircle as CompletedIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import { doctorsService, patientsService, appointmentsService, paymentsService } from '../../services';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      doctors: {
        total: 0,
        verified: 0,
        pending: 0,
        growth: 0,
        newThisMonth: 0
      },
      patients: {
        total: 0,
        active: 0,
        newThisMonth: 0,
        growth: 0
      },
      appointments: {
        total: 0,
        today: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0
      },
      revenue: {
        total: 0,
        thisMonth: 0,
        growth: 0,
        avgPerConsultation: 0
      }
    },
    recentActivity: [],
    topPerformers: [],
    alerts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Récupérer les statistiques des médecins
        const doctorsData = await doctorsService.getAllDoctors();
        const verifiedDoctors = doctorsData.filter(doctor => doctor.isVerified);
        const pendingDoctors = doctorsData.filter(doctor => !doctor.isVerified);
        
        // Récupérer les statistiques des patients
        const patientsData = await patientsService.getAllPatients();
        const activePatients = patientsData.filter(patient => patient.isActive);
        
        // Récupérer les rendez-vous
        const appointmentsData = await appointmentsService.getAllAppointments();
        const todayAppointments = appointmentsData.filter(
          appt => new Date(appt.date).toDateString() === new Date().toDateString()
        );
        const completedAppointments = appointmentsData.filter(appt => appt.status === 'completed');
        const upcomingAppointments = appointmentsData.filter(appt => appt.status === 'scheduled');
        const cancelledAppointments = appointmentsData.filter(appt => appt.status === 'cancelled');
        
        // Récupérer les paiements
        const paymentsData = await paymentsService.getAllPayments();
        const totalRevenue = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
        
        // Calculer le mois en cours
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Filtrer les paiements du mois en cours
        const currentMonthPayments = paymentsData.filter(payment => {
          const paymentDate = new Date(payment.date);
          return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
        });
        
        const thisMonthRevenue = currentMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);
        
        // Calculer les médecins les plus performants (par revenus générés)
        const doctorPaymentsMap = new Map();
        paymentsData.forEach(payment => {
          if (payment.doctorId) {
            const currentTotal = doctorPaymentsMap.get(payment.doctorId) || 0;
            doctorPaymentsMap.set(payment.doctorId, currentTotal + payment.amount);
          }
        });
        
        // Trouver les 3 médecins avec le plus de revenus
        const topDoctorIds = [...doctorPaymentsMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(entry => entry[0]);
          
        const topPerformersDoctors = doctorsData
          .filter(doctor => topDoctorIds.includes(doctor.id))
          .map(doctor => {
            const revenue = doctorPaymentsMap.get(doctor.id) || 0;
            return {
              id: doctor.id,
              name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
              specialty: doctor.specialty,
              patients: doctor.patientCount || 0,
              rating: doctor.rating || 0,
              revenue: revenue,
              avatar: `${doctor.firstName.charAt(0)}${doctor.lastName.charAt(0)}`
            };
          });
          
        // Générer des alertes basées sur les données
        const alerts = [];
        
        if (pendingDoctors.length > 0) {
          alerts.push({
            id: 1,
            type: 'warning',
            message: `${pendingDoctors.length} médecins en attente de validation`,
            action: 'Voir les candidatures',
            link: '/doctors'
          });
        }
        
        // Mettre à jour les données du tableau de bord
        setDashboardData({
          stats: {
            doctors: {
              total: doctorsData.length,
              verified: verifiedDoctors.length,
              pending: pendingDoctors.length,
              growth: 0, // À calculer à partir des données historiques
              newThisMonth: 0 // À calculer à partir des dates d'inscription
            },
            patients: {
              total: patientsData.length,
              active: activePatients.length,
              newThisMonth: 0, // À calculer à partir des dates d'inscription
              growth: 0 // À calculer à partir des données historiques
            },
            appointments: {
              total: appointmentsData.length,
              today: todayAppointments.length,
              upcoming: upcomingAppointments.length,
              completed: completedAppointments.length,
              cancelled: cancelledAppointments.length
            },
            revenue: {
              total: totalRevenue,
              thisMonth: thisMonthRevenue,
              growth: 0, // À calculer à partir des données historiques
              avgPerConsultation: totalRevenue / completedAppointments.length || 0
            }
          },
          recentActivity: [], // À implémenter avec un service d'activité
          topPerformers: topPerformersDoctors,
          alerts: alerts
        });
      } catch (err) {
        console.error('Erreur lors de la récupération des données du tableau de bord:', err);
        setError(err.message || 'Une erreur s\'est produite lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'scheduled': return 'info';
      default: return 'default';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return <WarningIcon />;
      case 'success': return <CompletedIcon />;
      case 'info': return <NotificationIcon />;
      default: return <NotificationIcon />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning': return 'warning';
      case 'success': return 'success';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 2, backgroundColor: 'error.light' }}>
          <Typography color="error" variant="h6">
            Erreur: {error}
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="dashboard-page">
      <Box className="page-header">
        <Typography variant="h4" className="page-title">
          Tableau de bord
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vue d'ensemble de la plateforme médicale
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card doctors" onClick={() => navigate('/doctors')}>
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {dashboardData.stats.doctors.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Médecins
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" color="success.main">
                      +{dashboardData.stats.doctors.growth}%
                    </Typography>
                  </Box>
                </Box>
                <DoctorIcon className="stat-icon" />
              </Box>
              {dashboardData.stats.doctors.pending > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={`${dashboardData.stats.doctors.pending} en attente`} 
                    color="warning" 
                    size="small"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card patients" onClick={() => navigate('/patients')}>
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {dashboardData.stats.patients.total.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Patients
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" color="success.main">
                      +{dashboardData.stats.patients.growth}%
                    </Typography>
                  </Box>
                </Box>
                <PeopleIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card appointments" onClick={() => navigate('/appointments')}>
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {dashboardData.stats.appointments.total.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rendez-vous
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dashboardData.stats.appointments.today} aujourd'hui
                  </Typography>
                </Box>
                <EventIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card revenue" onClick={() => navigate('/finances')}>
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {formatCurrency(dashboardData.stats.revenue.thisMonth)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revenus mensuels
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" color="success.main">
                      +{dashboardData.stats.revenue.growth}%
                    </Typography>
                  </Box>
                </Box>
                <MoneyIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Alertes */}
        <Grid item xs={12} lg={4}>
          <Card className="alerts-card">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon />
                Alertes importantes
              </Typography>
              <List disablePadding>
                {dashboardData.alerts.map((alert, index) => (
                  <ListItem 
                    key={alert.id} 
                    disablePadding 
                    sx={{ 
                      py: 1.5,
                      borderBottom: index < dashboardData.alerts.length - 1 ? 1 : 0,
                      borderColor: 'divider'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32,
                          bgcolor: `${getAlertColor(alert.type)}.main`
                        }}
                      >
                        {getAlertIcon(alert.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={alert.message}
                      secondary={
                        <Button 
                          size="small" 
                          onClick={() => navigate(alert.link)}
                          sx={{ mt: 0.5, p: 0, minWidth: 'auto' }}
                        >
                          {alert.action} <ArrowIcon sx={{ fontSize: 16, ml: 0.5 }} />
                        </Button>
                      }
                      primaryTypographyProps={{ fontSize: '14px' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Activité récente */}
        <Grid item xs={12} lg={4}>
          <Card className="activity-card">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationIcon />
                Activité récente
              </Typography>
              <List disablePadding>
                {dashboardData.recentActivity.map((activity, index) => (
                  <ListItem 
                    key={activity.id} 
                    disablePadding 
                    sx={{ 
                      py: 1.5,
                      borderBottom: index < dashboardData.recentActivity.length - 1 ? 1 : 0,
                      borderColor: 'divider'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '12px' }}>
                        {activity.avatar}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.message}
                      secondary={`Il y a ${activity.time}`}
                      primaryTypographyProps={{ fontSize: '14px' }}
                      secondaryTypographyProps={{ fontSize: '12px' }}
                    />
                    <Chip 
                      label={activity.status} 
                      color={getActivityColor(activity.status)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top performers */}
        <Grid item xs={12} lg={4}>
          <Card className="performers-card">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon />
                Meilleurs médecins
              </Typography>
              <List disablePadding>
                {dashboardData.topPerformers.map((doctor, index) => (
                  <ListItem 
                    key={doctor.id} 
                    disablePadding 
                    sx={{ 
                      py: 1.5,
                      borderBottom: index < dashboardData.topPerformers.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/doctors/${doctor.id}`)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: '#2563eb' }}>
                        {doctor.avatar}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight={500}>
                            {doctor.name}
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            {formatCurrency(doctor.revenue)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {doctor.specialty} • {doctor.patients} patients
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="caption">⭐ {doctor.rating}</Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/doctors')}
              >
                Voir tous les médecins
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;