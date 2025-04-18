// API Configuration
export const API_URL = ''; // Empty string for relative URLs

// API Headers configuration
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
};

console.log('Current environment:', process.env.NODE_ENV);
console.log('Using API URL:', API_URL); 