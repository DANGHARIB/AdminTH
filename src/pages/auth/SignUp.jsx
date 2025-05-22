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

  // Form setup
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

  // Watch password for confirmation validation
  const password = watch('password');

  // Form submission
  const onSubmit = async (data) => {
    try {
      setError('');
      setSuccess(false);
      setLoading(true);

      // Check backend connectivity
      const isConnected = await authService.testConnection();
      if (!isConnected) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }

      // Prepare registration data
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: 'Admin'
      };

      console.log('Creating admin account:', { ...userData, password: '[HIDDEN]' });
      await authService.register(userData);

      setSuccess(true);

      // Redirect to login after short delay
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Your account has been created successfully. You can now log in.' }
        });
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.message || 'Registration failed';
      const details = err.details ? `\n${err.details}` : '';
      setError(msg + details);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        py: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#fff'   // full-page white
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          p: 4,
          borderRadius: 4,
          bgcolor: '#fff'   // card white
        }}
      >
        <Typography
          component="h1"
          variant="h5"
          align="center"
          gutterBottom
          sx={{ color: '#090F47', fontWeight: 600, fontSize: '1.75rem' }}
        >
          Create Admin Account
        </Typography>

        <Typography
          variant="body2"
          align="center"
          sx={{ mb: 3, color: '#090F47' }}
        >
          Admin accounts allow you to manage the entire platform
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Account created successfully! Redirecting to login...
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2}>
            {/** First Name **/}
            <Grid item xs={12} sm={6}>
              <TextField
                variant="standard"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
                {...register('firstName', {
                  required: 'First name is required',
                  minLength: {
                    value: 2,
                    message: 'Must be at least 2 characters'
                  }
                })}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#ccc' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                    borderBottomColor: '#7AA7CC'
                  },
                  '& .MuiInput-underline:after': { borderBottomColor: '#7AA7CC' }
                }}
              />
            </Grid>

            {/** Last Name **/}
            <Grid item xs={12} sm={6}>
              <TextField
                variant="standard"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                {...register('lastName', {
                  required: 'Last name is required',
                  minLength: {
                    value: 2,
                    message: 'Must be at least 2 characters'
                  }
                })}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#ccc' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                    borderBottomColor: '#7AA7CC'
                  },
                  '& .MuiInput-underline:after': { borderBottomColor: '#7AA7CC' }
                }}
              />
            </Grid>

            {/** Email **/}
            <Grid item xs={12}>
              <TextField
                variant="standard"
                required
                fullWidth
                id="email"
                label="Email Address"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email'
                  }
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#ccc' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                    borderBottomColor: '#7AA7CC'
                  },
                  '& .MuiInput-underline:after': { borderBottomColor: '#7AA7CC' }
                }}
              />
            </Grid>

            {/** Password **/}
            <Grid item xs={12}>
              <TextField
                variant="standard"
                required
                fullWidth
                id="password"
                label="Password"
                type="password"
                autoComplete="new-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Must be at least 8 characters'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                    message: 'Must include uppercase, lowercase, number & special char'
                  }
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#ccc' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                    borderBottomColor: '#7AA7CC'
                  },
                  '& .MuiInput-underline:after': { borderBottomColor: '#7AA7CC' }
                }}
              />
            </Grid>

            {/** Confirm Password **/}
            <Grid item xs={12}>
              <TextField
                variant="standard"
                required
                fullWidth
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === password || 'Passwords do not match'
                })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#ccc' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                    borderBottomColor: '#7AA7CC'
                  },
                  '& .MuiInput-underline:after': { borderBottomColor: '#7AA7CC' }
                }}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            disabled={isSubmitting || loading || success}
            sx={{
              mt: 4,
              mb: 2,
              py: 1.5,
              borderRadius: 3,
              bgcolor: '#7AA7CC',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': { bgcolor: '#6A95B0' }
            }}
          >
            {isSubmitting || loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1, color: '#fff' }} />
                Creating...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component={RouterLink}
              to="/login"
              variant="body2"
              sx={{ color: '#7AA7CC' }}
            >
              Already have an account? Sign in
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUp;
