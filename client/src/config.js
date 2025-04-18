// API Configuration
export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://todo-calendar-production.up.railway.app'  // Production backend URL
  : 'http://localhost:8080';  // Local development backend URL

// API Headers configuration
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false // Set to false when using '*' for CORS
};

console.log('Current environment:', process.env.NODE_ENV);
console.log('Using API URL:', API_URL); 