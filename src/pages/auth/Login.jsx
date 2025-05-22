import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  TextField,
  Typography,
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

  // after-login redirect
  const from = location.state?.from?.pathname || '/dashboard';

  // form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: { email: '', password: '' }
  });

  // flash message?
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const t = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  // if already logged in → go
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (data) => {
    try {
      setError('');
      setSuccessMessage('');
      setLoading(true);
      console.log(`Attempting login with: ${data.email} / [hidden]`);
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || 'Login failed';
      setError(msg + (err.details ? `\n${err.details}` : ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        width: '100vw',
        minHeight: '100vh',
        bgcolor: '#fff',          // ← entire page white
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          borderRadius: 4,
          bgcolor: '#fff'          // ← card white
        }}
      >
        <Typography
          component="h1"
          variant="h5"
          align="center"
          gutterBottom
          sx={{ color: '#090F47', fontWeight: 600, fontSize: '1.75rem' }}
        >
          Admin Login
        </Typography>

        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
        {error          && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            variant="standard"
            fullWidth
            required
            id="email"
            label="Email Address"
            autoComplete="email"
            autoFocus
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{
              my: 2,
              '& .MuiInput-underline:before': { borderBottomColor: '#ccc' },
              '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                borderBottomColor: '#7AA7CC'
              },
              '& .MuiInput-underline:after': { borderBottomColor: '#7AA7CC' }
            }}
          />

          <TextField
            variant="standard"
            fullWidth
            required
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Must be at least 6 characters'
              }
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{
              my: 2,
              '& .MuiInput-underline:before': { borderBottomColor: '#ccc' },
              '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                borderBottomColor: '#7AA7CC'
              },
              '& .MuiInput-underline:after': { borderBottomColor: '#7AA7CC' }
            }}
          />

          <Button
            type="submit"
            fullWidth
            disabled={isSubmitting || loading}
            sx={{
              mt: 6,
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
                Logging in…
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link href="/signup" variant="body2" sx={{ color: '#7AA7CC' }}>
              Don’t have an account? Create Admin
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
