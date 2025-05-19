import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Alert 
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  
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
  
  // Soumission du formulaire
  const onSubmit = async (data) => {
    try {
      setError('');
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.');
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;