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
  Link
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Destination après connexion réussie
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Configuration du formulaire
  const { 
    register, 
    handleSubmit,
    formState: { errors, isSubmitting } 
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  
  // Vérifier s'il y a un message de succès dans l'état de navigation
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Effacer le message après 5 secondes
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);
  
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
      setSuccessMessage('');
      setLoading(true);
      console.log(`Tentative de connexion avec: ${data.email} / [mot de passe masqué]`);
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Erreur de connexion:', error);
      const errorMessage = error.message || (typeof error === 'object' && error.message) || 'Échec de la connexion';
      const errorDetails = error.details ? `\n${error.details}` : '';
      setError(`${errorMessage}${errorDetails}`);
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
          
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          
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
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link href="/signup" variant="body2">
                Pas encore de compte ? Créer un compte administrateur
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;