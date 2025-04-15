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
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  console.log('Current API_URL:', API_URL); // Debug log

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const fullUrl = `${API_URL}${endpoint}`;
      console.log('Making request to:', fullUrl);
      
      // Health check before auth request
      try {
        const healthCheckUrl = `${API_URL}/health`;
        console.log('Checking health at:', healthCheckUrl);
        const healthCheck = await axios.get(healthCheckUrl);
        console.log('Health check response:', healthCheck.data);
      } catch (healthError) {
        console.error('Health check failed:', healthError);
        throw new Error(`Server health check failed: ${healthError.message}`);
      }
      
      const response = await axios.post(fullUrl, {
        username,
        password
      }, axiosConfig);

      console.log('Auth response received');

      if (response.data && response.data.token) {
        // Store token and user info
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username);
        
        // Reset form
        setUsername('');
        setPassword('');
        
        // Notify parent component
        onLogin(response.data);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Auth error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(error.response.data.message || 'Server error');
        console.error('Error response:', error.response.data);
        console.error('Status:', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection and try again.');
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
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