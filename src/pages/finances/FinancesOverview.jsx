import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  CreditCard as CardIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  LocalHospital as DoctorIcon,
  Download as DownloadIcon,
  DateRange as DateIcon,
  Assessment as AssessmentIcon,
  Wallet as WalletIcon
} from '@mui/icons-material';
import DataTable from '../../components/common/DataTable';
import './FinancesOverview.css';
import paymentsService from '../../services/paymentsService';
import doctorsService from '../../services/doctorsService';

const FinancesOverview = () => {
  // États pour stocker les données récupérées
  const [isLoading, setIsLoading] = useState(true);
  const [financialOverview, setFinancialOverview] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    completedTransactions: 0,
    revenueGrowth: 0,
    avgTransactionValue: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Chargement des données
  useEffect(() => {
    const fetchFinancialData = async () => {
      setIsLoading(true);
      
      try {
        // Récupération des données financières générales
        const stats = await paymentsService.getPaymentsStats('month');
        
        // Récupération des transactions
        const allPayments = await paymentsService.getAllPayments();

        // Traitement des données de statistiques
        const overview = {
          totalRevenue: stats.totalRevenue || 0,
          monthlyRevenue: stats.totalRevenue || 0,
          pendingPayments: allPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
          completedTransactions: stats.completedPayments || allPayments.filter(p => p.status === 'completed').length,
          revenueGrowth: stats.trend?.revenue || 0,
          avgTransactionValue: stats.averageTransaction || 0
        };
        setFinancialOverview(overview);

        // Conversion des transactions pour correspondre au format attendu
        const processedTransactions = await processTransactions(allPayments);
        setTransactions(processedTransactions);

        // Récupération et formatage des données des médecins
        const doctors = await doctorsService.getAllDoctors();
        const topDoctorsByRevenue = await calculateTopDoctors(doctors, allPayments);
        setTopDoctors(topDoctorsByRevenue);

        // Calcul des méthodes de paiement
        const methods = calculatePaymentMethods(allPayments);
        setPaymentMethods(methods);
      } catch (error) {
        console.error('Erreur lors du chargement des données financières:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  // Traitement des transactions pour ajouter les informations liées aux docteurs et patients
  const processTransactions = async (payments) => {
    try {
      // Récupération des médecins
      const doctors = await doctorsService.getAllDoctors();
      const doctorsMap = new Map(doctors.map(d => [d.id, d]));

      return payments.slice(0, 5).map(payment => ({
        id: payment.id,
        date: payment.date,
        type: payment.amount > 0 ? 'payment' : 'refund',
        amount: payment.amount,
        patient: payment.patientId ? { id: payment.patientId, name: payment.patientId } : null,
        doctor: doctorsMap.get(payment.doctorId) ? 
          { id: payment.doctorId, name: doctorsMap.get(payment.doctorId).displayName } : 
          { id: payment.doctorId, name: 'Dr. Unknown' },
        status: payment.status,
        method: payment.method,
        description: payment.description
      }));
    } catch (error) {
      console.error('Erreur lors du traitement des transactions:', error);
      return [];
    }
  };

  // Calcul des médecins les plus performants en termes de revenus
  const calculateTopDoctors = async (doctors, payments) => {
    try {
      const doctorRevenues = {};
      
      // Calcul des revenus par médecin
      payments.forEach(payment => {
        if (!doctorRevenues[payment.doctorId]) {
          doctorRevenues[payment.doctorId] = {
            revenue: 0,
            count: 0
          };
        }
        doctorRevenues[payment.doctorId].revenue += payment.amount;
        doctorRevenues[payment.doctorId].count += 1;
      });
      
      // Association des revenus aux données des médecins
      return doctors
        .filter(doctor => doctorRevenues[doctor.id])
        .map(doctor => ({
          id: doctor.id,
          name: doctor.displayName || doctor.fullName,
          specialty: doctor.specialty,
          revenue: doctorRevenues[doctor.id].revenue,
          patients: doctor.patients || 0,
          growth: Math.floor(Math.random() * 30) - 5 // Valeur simulée pour la croissance
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3);
    } catch (error) {
      console.error('Erreur lors du calcul des meilleurs médecins:', error);
      return [];
    }
  };

  // Calcul des méthodes de paiement
  const calculatePaymentMethods = (payments) => {
    const methods = {
      card: { method: 'card', label: 'Carte de Crédit', count: 0, amount: 0 },
      bank_transfer: { method: 'bank_transfer', label: 'Virement Bancaire', count: 0, amount: 0 },
      digital_wallet: { method: 'digital_wallet', label: 'Portefeuille Digital', count: 0, amount: 0 }
    };
    
    // Comptage des paiements par méthode
    payments.forEach(payment => {
      const methodKey = payment.method || 'card';
      if (methods[methodKey]) {
        methods[methodKey].count += 1;
        methods[methodKey].amount += payment.amount;
      } else {
        methods.card.count += 1;
        methods.card.amount += payment.amount;
      }
    });
    
    // Calcul des pourcentages
    const totalCount = Object.values(methods).reduce((sum, m) => sum + m.count, 0) || 1;
    Object.values(methods).forEach(m => {
      m.percentage = Math.round((m.count / totalCount) * 100);
    });
    
    return Object.values(methods);
  };

  // Utilitaires pour l'affichage
  const getTransactionColor = (type) => {
    switch (type) {
      case 'payment': return 'success';
      case 'refund': return 'error';
      case 'commission': return 'info';
      default: return 'default';
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'payment': return <TrendingUpIcon />;
      case 'refund': return <TrendingDownIcon />;
      case 'commission': return <ReceiptIcon />;
      default: return <MoneyIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processed': return 'info';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'card': return <CardIcon />;
      case 'bank_transfer': return <AccountBalanceIcon />;
      case 'digital_wallet': return <MoneyIcon />;
      default: return <MoneyIcon />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const columns = [
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      renderCell: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DateIcon sx={{ fontSize: 16, color: '#6b7280' }} />
          <Typography variant="body2">
            {new Date(value).toLocaleDateString('fr-FR')}
          </Typography>
        </Box>
      )
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 130,
      renderCell: (value) => (
        <Chip 
          label={value === 'payment' ? 'Paiement' : value === 'refund' ? 'Remboursement' : 'Commission'} 
          color={getTransactionColor(value)}
          size="small"
          icon={getTransactionIcon(value)}
        />
      )
    },
    {
      field: 'amount',
      headerName: 'Montant',
      width: 120,
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
      field: 'patient',
      headerName: 'Patient',
      width: 180,
      renderCell: (value) => (
        value ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>
              {value.name.charAt(0)}
            </Avatar>
            <Typography variant="body2">{value.name}</Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">-</Typography>
        )
      )
    },
    {
      field: 'doctor',
      headerName: 'Médecin',
      width: 180,
      renderCell: (value) => (
        <Typography variant="body2">{value.name}</Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Statut',
      width: 120,
      renderCell: (value) => (
        <Chip 
          label={value === 'completed' ? 'Terminé' : value === 'processed' ? 'Traité' : value === 'pending' ? 'En attente' : 'Échoué'} 
          color={getStatusColor(value)}
          size="small"
        />
      )
    },
    {
      field: 'method',
      headerName: 'Méthode',
      width: 140,
      renderCell: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getMethodIcon(value)}
          <Typography variant="body2">
            {value === 'card' ? 'Carte' : value === 'bank_transfer' ? 'Virement' : value === 'digital_wallet' ? 'E-Wallet' : 'Plateforme'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      align: 'center',
      renderCell: (value, row) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTransaction(row);
            setAnchorEl(e.currentTarget);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      )
    }
  ];

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransaction(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="finances-page">
      <Box className="page-header">
        <Box>
          <Typography variant="h4" className="page-title">
            Finances
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vue d'ensemble des finances
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          className="export-button"
        >
          Exporter le rapport
        </Button>
      </Box>

      {/* Cartes de statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card revenue">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {formatCurrency(financialOverview.totalRevenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revenu Total
                  </Typography>
                </Box>
                <MoneyIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card monthly">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {formatCurrency(financialOverview.monthlyRevenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revenu Mensuel
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    {financialOverview.revenueGrowth >= 0 ? (
                      <>
                        <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="caption" color="success.main">
                          +{financialOverview.revenueGrowth}%
                        </Typography>
                      </>
                    ) : (
                      <>
                        <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                        <Typography variant="caption" color="error.main">
                          {financialOverview.revenueGrowth}%
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
                <TrendingUpIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card pending">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {formatCurrency(financialOverview.pendingPayments)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Paiements en attente
                  </Typography>
                </Box>
                <ReceiptIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card transactions">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {financialOverview.completedTransactions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Transactions
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Moyenne: {formatCurrency(financialOverview.avgTransactionValue)}
                  </Typography>
                </Box>
                <CardIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Médecins par Revenu et Méthodes de paiement */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card className="info-card">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DoctorIcon />
                Top Médecins par Revenu
              </Typography>
              {topDoctors.map((doctor) => (
                <Box key={doctor.id} sx={{ mb: 2, pb: 2, borderBottom: doctor.id !== topDoctors[topDoctors.length-1].id ? 1 : 0, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#2563eb', fontSize: '14px' }}>
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {doctor.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doctor.specialty} • {doctor.patients} patients
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(doctor.revenue)}
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        +{doctor.growth}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
              {topDoctors.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  Aucune donnée disponible
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card className="info-card">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CardIcon />
                Méthodes de Paiement
              </Typography>
              {paymentMethods.map((method) => (
                <Box key={method.method} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getMethodIcon(method.method)}
                      <Typography variant="body2" fontWeight={500}>
                        {method.label}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(method.amount)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={method.percentage} 
                      sx={{ flex: 1, height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {method.percentage}% ({method.count})
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tableau des transactions */}
      <Card className="transactions-card">
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon />
              Transactions Récentes
            </Typography>
          </Box>
          
          <DataTable
            data={transactions}
            columns={columns}
            searchable={true}
            loading={false}
            pagination={true}
            initialRowsPerPage={10}
          />
        </CardContent>
      </Card>

      {/* Menu d'actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { console.log('Voir les détails de la transaction'); handleMenuClose(); }}>
          Voir les détails
        </MenuItem>
        <MenuItem onClick={() => { console.log('Télécharger le reçu'); handleMenuClose(); }}>
          Télécharger le reçu
        </MenuItem>
        {selectedTransaction?.status === 'pending' && (
          <MenuItem onClick={() => { console.log('Traiter la transaction'); handleMenuClose(); }}>
            Traiter
          </MenuItem>
        )}
      </Menu>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} className="finance-tabs">
          <Tab icon={<ReceiptIcon />} label="Transactions" />
          <Tab icon={<AssessmentIcon />} label="Reports" />
          <Tab icon={<WalletIcon />} label="Budget" />
        </Tabs>
      </Box>
    </Box>
  );
};

export default FinancesOverview;