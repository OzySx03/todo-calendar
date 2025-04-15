import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  Alert
} from '@mui/material';
import { Login as LoginIcon, PersonAdd as RegisterIcon } from '@mui/icons-material';
import axios from 'axios';

const Auth = ({ onLogin }) => {
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      console.log('Making request to:', `${API_URL}${endpoint}`);
      
      const response = await axios.post(`${API_URL}${endpoint}`, {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      console.log('Response:', response.data);

      // Store token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      
      // Reset form
      setUsername('');
      setPassword('');
      
      // Notify parent component
      onLogin(response.data);
    } catch (error) {
      console.error('Auth error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(error.response.data.message || 'Server error');
        console.error('Error response:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please try again.');
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Failed to connect to server');
        console.error('Error setting up request:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 400, p: 3 }}>
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          centered
          sx={{ mb: 3 }}
        >
          <Tab
            icon={<LoginIcon />}
            label="LOGIN"
            value="login"
            sx={{ fontWeight: 'bold' }}
          />
          <Tab
            icon={<RegisterIcon />}
            label="REGISTER"
            value="register"
            sx={{ fontWeight: 'bold' }}
          />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            startIcon={tab === 'login' ? <LoginIcon /> : <RegisterIcon />}
          >
            {loading ? 'Please wait...' : (tab === 'login' ? 'Login' : 'Register')}
          </Button>
        </form>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 2 }}
        >
          {tab === 'login'
            ? "Don't have an account? Click Register above."
            : 'Already have an account? Click Login above.'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Auth; 