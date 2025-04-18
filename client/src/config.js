// API Configuration
const getApiUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8080';  // Local development
  } else {
    return 'https://todo-calendar-api.onrender.com';  // Production on Render
  }
};

export const API_URL = getApiUrl();

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
console.log('Origin:', window.location.origin); 