import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  useTheme,
  alpha,
  Container
} from '@mui/material';
import {
  LocalHospital as DoctorIcon,
  People as PeopleIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { doctorsService, patientsService, appointmentsService } from '../../services';
import './Dashboard.css';

// Lighter blue color palette
const COLORS = {
  primary: '#325A80',
  secondary: '#4A6F94',
  tertiary: '#2A4A6B'
};

const Dashboard = () => {
  const theme = useTheme();
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
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch doctors statistics with pagination and sorting
        const doctorsData = await doctorsService.getAllDoctors({
          page: 1,
          limit: 100,
          sort: 'createdAt',
          order: 'desc'
        });
        
        const verifiedDoctors = Array.isArray(doctorsData) 
          ? doctorsData.filter(doctor => doctor.isVerified)
          : [];
          
        const pendingDoctors = Array.isArray(doctorsData)
          ? doctorsData.filter(doctor => !doctor.isVerified)
          : [];
        
        // Fetch patients statistics with pagination and sorting
        const patientsData = await patientsService.getAllPatients({
          page: 1,
          limit: 100,
          sort: 'createdAt',
          order: 'desc'
        });
        
        const activePatients = Array.isArray(patientsData)
          ? patientsData.filter(patient => patient.isActive)
          : [];
        
        // Fetch appointments sorted by date
        const appointmentsData = await appointmentsService.getAllAppointments({
          page: 1,
          limit: 100,
          sort: 'scheduledDate',
          order: 'desc'
        });
        
        const todayAppointments = Array.isArray(appointmentsData)
          ? appointmentsData.filter(
              appt => new Date(appt.date).toDateString() === new Date().toDateString()
            )
          : [];
          
        const completedAppointments = Array.isArray(appointmentsData)
          ? appointmentsData.filter(appt => appt.status === 'completed')
          : [];
          
        const upcomingAppointments = Array.isArray(appointmentsData)
          ? appointmentsData.filter(appt => appt.status === 'scheduled')
          : [];
          
        const cancelledAppointments = Array.isArray(appointmentsData)
          ? appointmentsData.filter(appt => appt.status === 'cancelled')
          : [];
        
        // Update dashboard data
        setDashboardData({
          stats: {
            doctors: {
              total: Array.isArray(doctorsData) ? doctorsData.length : 0,
              verified: verifiedDoctors.length,
              pending: pendingDoctors.length,
              growth: 12, // Placeholder for demo
              newThisMonth: 5 // Placeholder for demo
            },
            patients: {
              total: Array.isArray(patientsData) ? patientsData.length : 0,
              active: activePatients.length,
              newThisMonth: 18, // Placeholder for demo
              growth: 8 // Placeholder for demo
            },
            appointments: {
              total: Array.isArray(appointmentsData) ? appointmentsData.length : 0,
              today: todayAppointments.length,
              upcoming: upcomingAppointments.length,
              completed: completedAppointments.length,
              cancelled: cancelledAppointments.length
            },
            revenue: {
              total: 0,
              thisMonth: 0,
              growth: 0,
              avgPerConsultation: 0
            }
          }
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, secondaryText, pendingCount, onClick }) => {
    return (
      <Card 
        onClick={onClick}
        sx={{
          height: '100%',
          borderRadius: 3,
          boxShadow: '0 8px 20px rgba(0,0,0,0.07)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
            '& .arrow-icon': {
              transform: 'translateX(5px)',
              opacity: 1,
            }
          },
          background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
          color: '#fff',
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: -15,
            right: -15,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: alpha('#fff', 0.1),
          }}
        />
        <CardContent sx={{ position: 'relative', zIndex: 1, py: 3.5, px: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, fontSize: '2.5rem' }}>
                {value.toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500, mb: 1.5, fontSize: '1.1rem' }}>
                {title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 18, mr: 0.7 }} />
                  <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                    +{dashboardData.stats.patients.growth}%
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.85rem' }}>
                  {secondaryText}
                </Typography>
              </Box>
              {pendingCount > 0 && (
                <Chip 
                  label={`${pendingCount} pending`} 
                  size="small"
                  sx={{ 
                    mt: 1.5,
                    bgcolor: alpha('#fff', 0.2),
                    color: '#fff',
                    fontWeight: 500,
                  }} 
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Box 
                sx={{ 
                  p: 1.8, 
                  borderRadius: '50%', 
                  bgcolor: alpha('#fff', 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center' 
                }}
              >
                <Icon sx={{ fontSize: 28, color: '#fff' }} />
              </Box>
              <ArrowForwardIcon 
                className="arrow-icon" 
                sx={{ 
                  color: '#fff', 
                  mt: 'auto', 
                  mb: 0.5, 
                  opacity: 0.5,
                  transition: 'all 0.3s ease',
                  fontSize: '1.2rem'
                }} 
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Create sorted stats array
  const getSortedStats = () => {
    const { doctors, patients, appointments } = dashboardData.stats;
    
    const statsArray = [
      { 
        id: 'doctors',
        title: 'Doctors', 
        value: doctors.total, 
        icon: DoctorIcon, 
        color: COLORS.primary,
        secondaryText: `${doctors.newThisMonth} this month`,
        pendingCount: doctors.pending,
        path: '/doctors'
      },
      { 
        id: 'patients',
        title: 'Patients', 
        value: patients.total, 
        icon: PeopleIcon, 
        color: COLORS.secondary,
        secondaryText: `${patients.newThisMonth} new patients`,
        path: '/patients'
      },
      { 
        id: 'appointments',
        title: 'Appointments', 
        value: appointments.total, 
        icon: EventIcon, 
        color: COLORS.tertiary,
        secondaryText: `${appointments.today} today`,
        path: '/appointments'
      }
    ];
    
    // Sort by value (ascending order)
    return statsArray.sort((a, b) => a.value - b.value);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={50} color="primary" />
        <Typography variant="body1" color="text.secondary">
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            bgcolor: alpha(theme.palette.error.light, 0.1),
            border: `1px solid ${theme.palette.error.light}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography color="error" variant="h6" sx={{ mb: 2 }}>
            Error: {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            size="large"
            onClick={() => window.location.reload()}
            sx={{ 
              borderRadius: 8,
              px: 4
            }}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Box className="dashboard-page" sx={{ py: 2 }}>
        <Box className="page-header" sx={{ mb: 6 }}>
          <Typography variant="h4" className="page-title" sx={{ fontWeight: 700, mb: 1.5, color: COLORS.primary }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Medical platform overview • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>

        {/* Statistics Cards - Sorted in ascending order */}
        <Grid container spacing={5} sx={{ mb: 5 }}>
          {getSortedStats().map(stat => (
            <Grid item xs={12} md={4} key={stat.id}>
              <StatCard 
                title={stat.title} 
                value={stat.value} 
                icon={stat.icon} 
                color={stat.color}
                secondaryText={stat.secondaryText}
                pendingCount={stat.pendingCount}
                onClick={() => navigate(stat.path)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;