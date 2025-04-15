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
  
  // Use localhost for development
  const API_URL = 'http://localhost:8080';
  console.log('Current API_URL:', API_URL);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const fullUrl = `${API_URL}${endpoint}`;
      console.log('Making request to:', fullUrl);
      
      const response = await axios.post(fullUrl, {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Auth response received');

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username);
        setUsername('');
        setPassword('');
        onLogin(response.data);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Auth error:', error);
      if (error.response) {
        setError(error.response.data.message || 'Server error');
        console.error('Error response:', error.response.data);
        console.error('Status:', error.response.status);
      } else if (error.request) {
        setError('Cannot connect to server. Please make sure the backend is running.');
        console.error('No response received:', error.request);
      } else {
        setError(error.message || 'Failed to connect to server');
        console.error('Error setting up request:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          centered
          sx={{ mb: 3 }}
        >
          <Tab
            label="Login"
            value="login"
            icon={<LoginIcon />}
            iconPosition="start"
          />
          <Tab
            label="Register"
            value="register"
            icon={<RegisterIcon />}
            iconPosition="start"
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
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
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