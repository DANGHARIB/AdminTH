import { useState } from 'react';
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
  Divider
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


// Mock data for finances
const MOCK_FINANCIAL_DATA = {
  overview: {
    totalRevenue: 125420.50,
    monthlyRevenue: 18750.25,
    pendingPayments: 3240.00,
    completedTransactions: 1247,
    revenueGrowth: 12.5,
    avgTransactionValue: 100.50
  },
  
  recentTransactions: [
    {
      id: 1,
      date: '2025-05-22',
      type: 'payment',
      amount: 85.00,
      patient: { id: 1, name: 'John Smith' },
      doctor: { id: 1, name: 'Dr. Martin Johnson' },
      status: 'completed',
      method: 'card',
      description: 'Cardiology consultation'
    },
    {
      id: 2,
      date: '2025-05-22',
      type: 'refund',
      amount: -45.00,
      patient: { id: 2, name: 'Mary Wilson' },
      doctor: { id: 2, name: 'Dr. Sophie Anderson' },
      status: 'processed',
      method: 'card',
      description: 'Refund for cancelled consultation'
    },
    {
      id: 3,
      date: '2025-05-21',
      type: 'payment',
      amount: 120.00,
      patient: { id: 3, name: 'Peter Brown' },
      doctor: { id: 1, name: 'Dr. Martin Johnson' },
      status: 'completed',
      method: 'bank_transfer',
      description: 'Consultation + examinations'
    },
    {
      id: 4,
      date: '2025-05-21',
      type: 'commission',
      amount: 25.50,
      patient: null,
      doctor: { id: 3, name: 'Dr. Thomas Davis' },
      status: 'pending',
      method: 'platform',
      description: 'Platform commission - Consultation'
    },
    {
      id: 5,
      date: '2025-05-20',
      type: 'payment',
      amount: 95.00,
      patient: { id: 4, name: 'Sophie Miller' },
      doctor: { id: 2, name: 'Dr. Sophie Anderson' },
      status: 'completed',
      method: 'card',
      description: 'Pediatric consultation'
    }
  ],
  
  topDoctorsByRevenue: [
    { id: 1, name: 'Dr. Martin Johnson', specialty: 'Cardiologist', revenue: 8420.50, patients: 42, growth: 15.2 },
    { id: 2, name: 'Dr. Sophie Anderson', specialty: 'Pediatrician', revenue: 6850.25, patients: 56, growth: 8.7 },
    { id: 5, name: 'Dr. Paul Mitchell', specialty: 'Ophthalmologist', revenue: 5240.00, patients: 38, growth: 22.1 }
  ],
  
  paymentMethods: [
    { method: 'card', label: 'Credit Card', count: 892, percentage: 71.5, amount: 89750.30 },
    { method: 'bank_transfer', label: 'Bank Transfer', count: 245, percentage: 19.6, amount: 24580.50 },
    { method: 'digital_wallet', label: 'Digital Wallet', count: 110, percentage: 8.9, amount: 11089.70 }
  ]
};

const FinancesOverview = () => {
  const [financialData] = useState(MOCK_FINANCIAL_DATA);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [tabValue, setTabValue] = useState(0);

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
            {new Date(value).toLocaleDateString('en-US', { 
              day: '2-digit', 
              month: '2-digit' 
            })}
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
          label={value === 'payment' ? 'Payment' : value === 'refund' ? 'Refund' : 'Commission'} 
          color={getTransactionColor(value)}
          size="small"
          icon={getTransactionIcon(value)}
        />
      )
    },
    {
      field: 'amount',
      headerName: 'Amount',
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
      headerName: 'Doctor',
      width: 180,
      renderCell: (value) => (
        <Typography variant="body2">{value.name}</Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (value) => (
        <Chip 
          label={value === 'completed' ? 'Completed' : value === 'processed' ? 'Processed' : value === 'pending' ? 'Pending' : 'Failed'} 
          color={getStatusColor(value)}
          size="small"
        />
      )
    },
    {
      field: 'method',
      headerName: 'Method',
      width: 140,
      renderCell: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getMethodIcon(value)}
          <Typography variant="body2">
            {value === 'card' ? 'Card' : value === 'bank_transfer' ? 'Transfer' : value === 'digital_wallet' ? 'Wallet' : 'Platform'}
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

  return (
    <Box className="finances-page">
      <Box className="page-header">
        <Box>
          <Typography variant="h4" className="page-title">
            Finances
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Platform financial overview
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          className="export-button"
        >
          Export Report
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card revenue">
            <CardContent>
              <Box className="stat-content">
                <Box>
                  <Typography variant="h4" className="stat-number">
                    {formatCurrency(financialData.overview.totalRevenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
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
                    {formatCurrency(financialData.overview.monthlyRevenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Revenue
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" color="success.main">
                      +{financialData.overview.revenueGrowth}%
                    </Typography>
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
                    {formatCurrency(financialData.overview.pendingPayments)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Payments
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
                    {financialData.overview.completedTransactions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Transactions
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg: {formatCurrency(financialData.overview.avgTransactionValue)}
                  </Typography>
                </Box>
                <CardIcon className="stat-icon" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Doctors by Revenue */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card className="info-card">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DoctorIcon />
                Top Doctors by Revenue
              </Typography>
              {financialData.topDoctorsByRevenue.map((doctor) => (
                <Box key={doctor.id} sx={{ mb: 2, pb: 2, borderBottom: doctor.id < financialData.topDoctorsByRevenue.length ? 1 : 0, borderColor: 'divider' }}>
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
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card className="info-card">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CardIcon />
                Payment Methods
              </Typography>
              {financialData.paymentMethods.map((method) => (
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

      {/* Transactions Table */}
      <Card className="transactions-card">
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon />
              Recent Transactions
            </Typography>
          </Box>
          
          <DataTable
            data={financialData.recentTransactions}
            columns={columns}
            searchable={true}
            loading={false}
            pagination={true}
            initialRowsPerPage={25}
          />
        </CardContent>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { console.log('View transaction details'); handleMenuClose(); }}>
          View Details
        </MenuItem>
        <MenuItem onClick={() => { console.log('Download receipt'); handleMenuClose(); }}>
          Download Receipt
        </MenuItem>
        {selectedTransaction?.status === 'pending' && (
          <MenuItem onClick={() => { console.log('Process transaction'); handleMenuClose(); }}>
            Process
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