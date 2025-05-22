import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Grid,
  Divider
} from '@mui/material';
import authService from '../../services/authService';

const SignUp = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Configuration du formulaire
  const { 
    register, 
    handleSubmit,
    watch,
    formState: { errors, isSubmitting } 
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
  
  // Observer le mot de passe pour la validation de confirmation
  const password = watch('password');
  
  // Soumission du formulaire
  const onSubmit = async (data) => {
    try {
      // Réinitialiser les messages
      setError('');
      setSuccess(false);
      setLoading(true);
      
      // Vérifier la connectivité avec le backend
      const isConnected = await authService.testConnection();
      if (!isConnected) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.');
      }
      
      // Préparer les données d'inscription
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: 'Admin' // S'assurer que le rôle est bien défini comme Admin
      };
      
      // Appeler le service d'inscription
      console.log('Création de compte administrateur:', { ...userData, password: '[MASQUÉ]' });
      await authService.register(userData);
      
      // Afficher le message de succès
      setSuccess(true);
      
      // Rediriger vers la connexion après un court délai
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.' 
          } 
        });
      }, 2000);
      
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      const errorMessage = error.message || (typeof error === 'object' && error.message) || 'Échec de l\'inscription';
      const errorDetails = error.details ? `\n${error.details}` : '';
      setError(`${errorMessage}${errorDetails}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 8
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
            Créer un compte administrateur
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Les comptes administrateurs permettent de gérer l'ensemble de la plateforme
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Compte créé avec succès! Redirection vers la page de connexion...
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  label="Prénom"
                  autoFocus
                  {...register('firstName', { 
                    required: 'Le prénom est requis',
                    minLength: {
                      value: 2,
                      message: 'Le prénom doit contenir au moins 2 caractères'
                    }
                  })}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Nom"
                  {...register('lastName', { 
                    required: 'Le nom est requis',
                    minLength: {
                      value: 2,
                      message: 'Le nom doit contenir au moins 2 caractères'
                    }
                  })}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Adresse email"
                  type="email"
                  autoComplete="email"
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
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="password"
                  label="Mot de passe"
                  type="password"
                  autoComplete="new-password"
                  {...register('password', { 
                    required: 'Le mot de passe est requis',
                    minLength: {
                      value: 8,
                      message: 'Le mot de passe doit contenir au moins 8 caractères'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                      message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
                    }
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="confirmPassword"
                  label="Confirmer le mot de passe"
                  type="password"
                  {...register('confirmPassword', { 
                    required: 'Veuillez confirmer le mot de passe',
                    validate: value => value === password || 'Les mots de passe ne correspondent pas'
                  })}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting || loading || success}
            >
              {(isSubmitting || loading) ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Création en cours...
                </>
              ) : 'Créer le compte'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Déjà un compte ? Connectez-vous
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignUp; 