import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Check if user is updating profile (to prevent logout during profile page operations)
const isUserUpdatingProfile = () => {
  if (localStorage.getItem("userIsUpdating") === "true") {
    return true;
  }
  
  const storedTimestamp = localStorage.getItem("userUpdatingTimestamp");
  if (storedTimestamp) {
    const timestamp = parseInt(storedTimestamp, 10);
    const now = Date.now();
    const elapsed = now - timestamp;
    
    if (elapsed < 30000) { // 30 seconds
      return true;
    }
  }
  
  return false;
};

// Create instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip auth error handling on profile page and favorites page to prevent logout
    if (window.location.pathname.includes('/profile') || window.location.pathname.includes('/favorites')) {
      console.log('Error on protected page - completely ignoring auth errors');
      // Don't do any auth handling on these pages
      return Promise.reject(error);
    }
    
    // Don't handle auth errors during profile update
    if (isUserUpdatingProfile()) {
      console.log('Auth error during profile update - continuing without logout');
      return Promise.reject(error);
    }
    
    // For other pages, we will only LOG the errors but NOT redirect
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('Auth error detected, but not redirecting automatically');
      
      // Don't clear auth data or redirect automatically
      // Let the components handle this themselves
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
