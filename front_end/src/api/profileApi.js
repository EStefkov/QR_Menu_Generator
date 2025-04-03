import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance for profile API
const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to an invalid/expired token (403 Forbidden)
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Log the error for debugging
      console.warn('Received 403 Forbidden - Token may be invalid or expired');
      
      // You could implement token refresh logic here if needed
      // For now, we'll just notify that the token might be invalid
      
      // Rethrow a more informative error
      return Promise.reject(new Error('Your session may have expired. Please try logging in again.'));
    }
    
    return Promise.reject(error);
  }
);

export const profileApi = {
  // Get user profile information
  getUserProfile: async () => {
    try {
      console.log('Fetching user profile data...');
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        throw new Error('Authentication required. Please log in.');
      }
      
      const response = await axiosInstance.get('/accounts/current');
      
      // Store email address and account type in localStorage for consistency
      if (response.data) {
        if (response.data.mailAddress) {
          localStorage.setItem('mailAddress', response.data.mailAddress);
        }
        if (response.data.accountType) {
          localStorage.setItem('accountType', response.data.accountType);
        }
        if (response.data.firstName) {
          localStorage.setItem('firstName', response.data.firstName);
        }
        if (response.data.lastName) {
          localStorage.setItem('lastName', response.data.lastName);
        }
        if (response.data.id) {
          localStorage.setItem('userId', response.data.id);
          localStorage.setItem('accountId', response.data.id); // Also store as accountId for consistency
        }
      }
      
      console.log("Fetched user profile data:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // Handle different types of errors with more informative messages
      if (error.response) {
        // Server responded with an error status
        if (error.response.status === 403) {
          throw new Error('Session expired or insufficient permissions. Please log in again.');
        } else if (error.response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (error.response.status === 404) {
          throw new Error('User profile not found.');
        } else {
          throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        // Request made but no response received (network error)
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        throw new Error(error.message || 'Failed to fetch profile details');
      }
    }
  },
  
  // Update user profile information
  updateUserProfile: async (profileData) => {
    try {
      // Check if we have an ID to update
      if (!profileData.id) {
        profileData.id = localStorage.getItem('userId');
      }
      
      const response = await axiosInstance.put(`/accounts/update/${profileData.id}`, profileData);
      
      // Update localStorage after successful database update
      if (response.data) {
        if (profileData.mailAddress) {
          localStorage.setItem('mailAddress', profileData.mailAddress);
        } else if (profileData.email) {
          localStorage.setItem('mailAddress', profileData.email);
        }
        
        if (profileData.firstName) {
          localStorage.setItem('firstName', profileData.firstName);
        }
        
        if (profileData.lastName) {
          localStorage.setItem('lastName', profileData.lastName);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      
      if (error.response) {
        // Server responded with an error
        throw new Error(error.response.data?.message || `Error updating profile: ${error.response.status}`);
      } else if (error.request) {
        // Network error
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error(error.message || 'Failed to update profile');
      }
    }
  },
  
  // Upload new profile picture
  uploadProfilePicture: async (formData) => {
    try {
      const accountId = localStorage.getItem('userId');
      const response = await axiosInstance.post(`/accounts/uploadProfilePicture/${accountId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update profilePicture in localStorage after successful upload
      if (response.data && response.data.profilePicture) {
        localStorage.setItem('profilePicture', response.data.profilePicture);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      
      if (error.response) {
        throw new Error(error.response.data?.message || `Error uploading image: ${error.response.status}`);
      } else if (error.request) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error(error.message || 'Failed to upload profile picture');
      }
    }
  },
  
  // Change password
  changePassword: async (passwordData) => {
    try {
      const accountId = localStorage.getItem('userId');
      const response = await axiosInstance.post(`/accounts/${accountId}/change-password`, passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error(error.message || 'Failed to change password');
      }
    }
  },
  
  // Get admin statistics - real data from database
  getAdminStatistics: async () => {
    try {
      console.log('Fetching admin statistics...');
      const response = await axiosInstance.get('/admin/statistics');
      console.log("Fetched admin statistics:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin statistics:', error);
      
      if (error.response) {
        if (error.response.status === 403) {
          throw new Error('You do not have permission to access admin statistics.');
        } else {
          throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error(error.message || 'Failed to fetch admin statistics');
      }
    }
  },

  // Get user orders count
  getUserOrdersCount: async () => {
    try {
      // Try to get accountId from various sources
      let accountId = localStorage.getItem('accountId');
      if (!accountId) {
        accountId = localStorage.getItem('userId');
      }
      
      // If we still don't have an ID, try to get the current profile and extract the ID
      if (!accountId) {
        console.log('No user ID found, attempting to fetch profile first');
        try {
          const profileData = await profileApi.getUserProfile();
          if (profileData && profileData.id) {
            accountId = profileData.id;
            localStorage.setItem('userId', accountId);
            localStorage.setItem('accountId', accountId);
            console.log('Successfully retrieved accountId from profile:', accountId);
          }
        } catch (profileError) {
          console.error('Failed to get profile data for ID:', profileError);
        }
      }
      
      if (!accountId) {
        console.error('No accountId or userId found or retrievable');
        return 0;
      }
      
      console.log(`Fetching order count for user ${accountId}`);
      const response = await axiosInstance.get(`/orders/count/${accountId}`);
      console.log(`Order count response:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders count:', error);
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      return 0; // Return 0 as fallback
    }
  },

  // Get user favorites count
  getUserFavoritesCount: async () => {
    try {
      // Try to get accountId from various sources
      let accountId = localStorage.getItem('accountId');
      if (!accountId) {
        accountId = localStorage.getItem('userId');
      }
      
      // If we still don't have an ID, try to get the current profile and extract the ID
      if (!accountId) {
        console.log('No user ID found, attempting to fetch profile first');
        try {
          const profileData = await profileApi.getUserProfile();
          if (profileData && profileData.id) {
            accountId = profileData.id;
            localStorage.setItem('userId', accountId);
            localStorage.setItem('accountId', accountId);
            console.log('Successfully retrieved accountId from profile:', accountId);
          }
        } catch (profileError) {
          console.error('Failed to get profile data for ID:', profileError);
        }
      }
      
      if (!accountId) {
        console.error('No accountId or userId found or retrievable');
        return 0;
      }
      
      console.log(`Fetching favorites count for user ${accountId}`);
      const response = await axiosInstance.get(`/favorites/count/${accountId}`);
      console.log(`Favorites count response:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user favorites count:', error);
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      return 0; // Return 0 as fallback
    }
  }
};

export default profileApi; 