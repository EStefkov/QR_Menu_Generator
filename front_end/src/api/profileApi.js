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

// Helper to get cached profile data from localStorage
const getCachedProfileData = () => {
  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName');
  const accountId = localStorage.getItem('userId') || localStorage.getItem('id');
  const accountType = localStorage.getItem('accountType');
  const mailAddress = localStorage.getItem('mailAddress');
  const profilePicture = localStorage.getItem('profilePicture');
  const phone = localStorage.getItem('phone');
  
  if (firstName && lastName && accountId) {
    return {
      id: accountId,
      firstName,
      lastName,
      accountType,
      mailAddress,
      profilePicture,
      phone
    };
  }
  
  return null;
};

export const profileApi = {
  // Get user profile information
  getUserProfile: async () => {
    try {
      console.log('Fetching user profile data...');
      const token = localStorage.getItem('token');
      const isOnProfilePage = window.location.pathname.includes('/profile');
      
      if (!token) {
        console.error('No token found in localStorage');
        throw new Error('Authentication required. Please log in.');
      }
      
      // IMPORTANT: On profile page, ALWAYS use cached data first
      if (isOnProfilePage) {
        const cachedData = getCachedProfileData();
        
        if (cachedData) {
          console.log('Using cached profile data on profile page (immediate return)');
          
          // Start a background fetch that won't block rendering
          setTimeout(() => {
            console.log('Starting background profile fetch...');
            axiosInstance.get('/accounts/current')
              .then(response => {
                console.log('Background profile fetch successful');
                
                // Update localStorage with fresh data
                if (response.data) {
                  if (response.data.mailAddress) localStorage.setItem('mailAddress', response.data.mailAddress);
                  if (response.data.accountType) localStorage.setItem('accountType', response.data.accountType);
                  if (response.data.firstName) localStorage.setItem('firstName', response.data.firstName);
                  if (response.data.lastName) localStorage.setItem('lastName', response.data.lastName);
                  if (response.data.id) {
                    localStorage.setItem('userId', response.data.id);
                    localStorage.setItem('accountId', response.data.id);
                    localStorage.setItem('id', response.data.id);
                  }
                  if (response.data.profilePicture) localStorage.setItem('profilePicture', response.data.profilePicture);
                  
                  // Send event to update UI with new data
                  window.dispatchEvent(new Event('userDataUpdated'));
                }
              })
              .catch(error => {
                // Just log the error, but don't affect the UI
                console.warn('Background profile fetch failed, continuing with cached data', error);
              });
          }, 1500);
          
          return cachedData;
        }
      }
      
      // For non-profile pages or if no cached data, fetch from API
      const response = await axiosInstance.get('/accounts/current');
      
      // Store data in localStorage for future use
      if (response.data) {
        if (response.data.mailAddress) localStorage.setItem('mailAddress', response.data.mailAddress);
        if (response.data.accountType) localStorage.setItem('accountType', response.data.accountType);
        if (response.data.firstName) localStorage.setItem('firstName', response.data.firstName);
        if (response.data.lastName) localStorage.setItem('lastName', response.data.lastName);
        if (response.data.id) {
          localStorage.setItem('userId', response.data.id);
          localStorage.setItem('accountId', response.data.id);
          localStorage.setItem('id', response.data.id);
        }
        if (response.data.profilePicture) localStorage.setItem('profilePicture', response.data.profilePicture);
      }
      
      console.log("Fetched user profile data from API:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // On ANY error on profile page, prefer cached data
      if (window.location.pathname.includes('/profile')) {
        const cachedData = getCachedProfileData();
        
        if (cachedData) {
          console.log('Error fetching profile, using cached data as fallback');
          return cachedData;
        }
      }
      
      // Handle different error types
      if (error.response) {
        if (error.response.status === 403 || error.response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        } else if (error.response.status === 404) {
          throw new Error('User profile not found.');
        } else {
          throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
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
        if (!profileData.id) {
          throw new Error('User ID not found. Please refresh the page and try again.');
        }
      }
      
      // Ensure we have mailAddress field - for backward compatibility
      if (!profileData.mailAddress && profileData.email) {
        profileData.mailAddress = profileData.email;
      }
      
      // Ensure we have number field if phone is provided
      if (!profileData.number && profileData.phone) {
        profileData.number = profileData.phone;
      }
      
      console.log("Sending profile update with data:", profileData);
      
      // Set update flags before making the API call
      localStorage.setItem("userIsUpdating", "true");
      localStorage.setItem("userUpdatingTimestamp", Date.now().toString());
      
      const response = await axiosInstance.put(`/accounts/update/${profileData.id}`, profileData);
      console.log("Profile update API response:", response);
      
      // Update localStorage after successful database update
      if (response.data || response.status === 200) {
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
        
        if (profileData.number) {
          localStorage.setItem('phone', profileData.number);
        } else if (profileData.phone) {
          localStorage.setItem('phone', profileData.phone);
        }
        
        // Trigger custom event for UI updates
        window.dispatchEvent(new Event("userDataUpdated"));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      
      // Reset update flags on error
      localStorage.removeItem("userIsUpdating");
      localStorage.removeItem("userUpdatingTimestamp");
      
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
      console.log('Orders count response:', response.data);
      return response.data || 0;
    } catch (error) {
      console.error('Error fetching user orders count:', error);
      // Return 0 as a fallback for UI rendering purposes
      return 0;
    }
  },

  // Get user orders directly
  getUserOrders: async (page = 0, size = 10) => {
    try {
      // Try to get accountId from various sources
      let accountId = localStorage.getItem('accountId');
      if (!accountId) {
        accountId = localStorage.getItem('userId');
      }
      
      if (!accountId) {
        console.error('No accountId or userId found or retrievable');
        throw new Error('User ID not found');
      }
      
      console.log(`Fetching orders for user ${accountId}, page: ${page}, size: ${size}`);
      
      // Call the backend API endpoint to get orders for this account
      const response = await axiosInstance.get(`/accounts/${accountId}/orders`, {
        params: { page, size }
      });
      
      console.log('Orders response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch your orders');
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
        console.log('No user ID found, attempting to fetch profile first for favorites count');
        try {
          const profileData = await profileApi.getUserProfile();
          if (profileData && profileData.id) {
            accountId = profileData.id;
            localStorage.setItem('userId', accountId);
            localStorage.setItem('accountId', accountId);
            console.log('Successfully retrieved accountId from profile for favorites:', accountId);
          }
        } catch (profileError) {
          console.error('Failed to get profile data for favorites count:', profileError);
        }
      }
      
      if (!accountId) {
        console.error('No accountId or userId found or retrievable for favorites count');
        return 0;
      }
      
      console.log(`Fetching favorites count for user ${accountId}`);
      const response = await axiosInstance.get(`/favorites/count/${accountId}`);
      console.log('Favorites count response:', response.data);
      return response.data || 0;
    } catch (error) {
      console.error('Error fetching user favorites count:', error);
      // Return 0 as a fallback for UI rendering purposes
      return 0;
    }
  },
  
  // Get user statistics (combined method to reduce API calls)
  getUserStats: async () => {
    try {
      console.log('Fetching user statistics...');
      
      // Get user ID
      let accountId = localStorage.getItem('accountId');
      if (!accountId) {
        accountId = localStorage.getItem('userId');
      }
      
      if (!accountId) {
        console.log('No user ID found in localStorage for stats');
        try {
          const profileData = await profileApi.getUserProfile();
          if (profileData && profileData.id) {
            accountId = profileData.id;
            localStorage.setItem('userId', accountId);
            localStorage.setItem('accountId', accountId);
          }
        } catch (profileError) {
          console.error('Failed to get profile data for stats:', profileError);
        }
        
        if (!accountId) {
          console.error('Could not retrieve account ID for stats');
          return { orderCount: 0, favoritesCount: 0 };
        }
      }
      
      // Get orders count
      let orderCount = 0;
      try {
        const ordersResponse = await axiosInstance.get(`/accounts/${accountId}/orders`);
        if (ordersResponse.data) {
          let orders = [];
          if (Array.isArray(ordersResponse.data)) {
            orders = ordersResponse.data;
          } else if (ordersResponse.data.content && Array.isArray(ordersResponse.data.content)) {
            orders = ordersResponse.data.content;
          }
          orderCount = orders.length;
          console.log(`Retrieved ${orderCount} orders for user ${accountId}`);
        }
      } catch (ordersError) {
        console.error('Failed to retrieve orders:', ordersError);
      }
      
      // Get favorites count
      let favoritesCount = 0;
      try {
        const favoritesResponse = await axiosInstance.get(`/favorites/user/${accountId}`);
        if (favoritesResponse.data) {
          let favorites = [];
          if (Array.isArray(favoritesResponse.data)) {
            favorites = favoritesResponse.data;
          } else if (favoritesResponse.data.content && Array.isArray(favoritesResponse.data.content)) {
            favorites = favoritesResponse.data.content;
          }
          favoritesCount = favorites.length;
          console.log(`Retrieved ${favoritesCount} favorites for user ${accountId}`);
        }
      } catch (favoritesError) {
        console.error('Failed to retrieve favorites:', favoritesError);
      }
      
      return {
        orderCount,
        favoritesCount
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        orderCount: 0,
        favoritesCount: 0
      };
    }
  }
};

export default profileApi; 