import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Alert,
  CircularProgress,
  Link,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordOption, setPasswordOption] = useState('password');
  
  // Options de mot de passe prédéfinies pour faciliter les tests
  const passwordOptions = {
    'password': 'password',
    'admin123': 'admin123',
    'Admin123!': 'Admin123!',
    '123456': '123456'
  };
  
  // Destination après connexion réussie
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Configuration du formulaire
  const { 
    register, 
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting } 
  } = useForm({
    defaultValues: {
      email: 'admin@admin.com',
      password: passwordOptions[passwordOption]
    }
  });
  
  // Mettre à jour le mot de passe quand l'option change
  useEffect(() => {
    setValue('password', passwordOptions[passwordOption]);
  }, [passwordOption, setValue]);
  
  // Si déjà authentifié, rediriger
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  // Soumission du formulaire
  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      console.log(`Tentative de connexion avec: ${data.email} / [mot de passe masqué]`);
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Erreur de connexion:', error);
      const errorMessage = error.message || (typeof error === 'object' && error.message) || 'Échec de la connexion';
      setError(`${errorMessage}. Veuillez vérifier vos identifiants.`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            width: '100%',
            borderRadius: 2
          }}
        >
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Connexion Administrateur
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Utiliser admin@admin.com et testez différents mots de passe
          </Alert>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse email"
              autoComplete="email"
              autoFocus
              {...register('email', { 
                required: 'L\'email est requis',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Adresse email invalide'
                }
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            
            <FormControl fullWidth sx={{ mt: 2, mb: 1 }}>
              <InputLabel id="password-option-label">Option de mot de passe</InputLabel>
              <Select
                labelId="password-option-label"
                value={passwordOption}
                label="Option de mot de passe"
                onChange={(e) => setPasswordOption(e.target.value)}
              >
                <MenuItem value="password">password (défaut)</MenuItem>
                <MenuItem value="admin123">admin123</MenuItem>
                <MenuItem value="Admin123!">Admin123!</MenuItem>
                <MenuItem value="123456">123456</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="password"
              label="Mot de passe"
              type="password"
              autoComplete="current-password"
              {...register('password', { 
                required: 'Le mot de passe est requis',
                minLength: {
                  value: 6,
                  message: 'Le mot de passe doit contenir au moins 6 caractères'
                }
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting || loading}
            >
              {(isSubmitting || loading) ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Connexion en cours...
                </>
              ) : 'Se connecter'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;