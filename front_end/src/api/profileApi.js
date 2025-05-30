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
  const mailAddress = localStorage.getItem('mailAddress') || localStorage.getItem('email');
  const email = mailAddress; // Ensure both fields are available
  const profilePicture = localStorage.getItem('profilePicture');
  const localProfilePicture = localStorage.getItem('profilePictureLocal');
  const phone = localStorage.getItem('phone') || localStorage.getItem('number');
  const createdAt = localStorage.getItem('createdAt') || 
                   localStorage.getItem('creationDate') || 
                   localStorage.getItem('createDate') ||
                   localStorage.getItem('registrationDate');
  
  if (firstName && lastName && accountId) {
    // Log what we found for debugging
    console.log("getCachedProfileData found:", {
      id: accountId,
      email: email,
      phone: phone,
      firstName: firstName,
      lastName: lastName
    });
    
    return {
      id: accountId,
      firstName,
      lastName,
      accountType,
      mailAddress,
      email,
      profilePicture: localProfilePicture && localProfilePicture.startsWith('data:image') ? 
                     localProfilePicture : profilePicture,
      localProfilePicture,
      phone, // Include phone in cached data
      number: phone, // Include as number too for backward compatibility
      createdAt
    };
  }
  
  return null;
};

export const profileApi = {
  // Get user profile information
  getUserProfile: async (bypassCache = false) => {
    try {
      console.log('Fetching user profile data... (bypass cache:', bypassCache, ')');
      const token = localStorage.getItem('token');
      const isOnProfilePage = window.location.pathname.includes('/profile');
      
      if (!token) {
        console.error('No token found in localStorage');
        throw new Error('Authentication required. Please log in.');
      }
      
      // IMPORTANT: On profile page, ALWAYS use cached data first, UNLESS bypassCache is true
      if (isOnProfilePage && !bypassCache) {
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
                  if (response.data.createdAt) localStorage.setItem('createdAt', response.data.createdAt);
                  
                  // Store phone/number field from response
                  if (response.data.phone) {
                    localStorage.setItem('phone', response.data.phone);
                  } else if (response.data.number) {
                    localStorage.setItem('phone', response.data.number);
                  }
                  
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
      
      // For non-profile pages or if no cached data or bypassCache=true, fetch from API
      console.log('Making direct API call to fetch profile data');
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
        if (response.data.createdAt) localStorage.setItem('createdAt', response.data.createdAt);
        
        // Store phone/number field from response
        if (response.data.phone) {
          localStorage.setItem('phone', response.data.phone);
        } else if (response.data.number) {
          localStorage.setItem('phone', response.data.number);
        }
      }
      
      console.log("Fetched user profile data from API:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // On ANY error on profile page, prefer cached data if NOT bypassing cache
      if (window.location.pathname.includes('/profile') && !bypassCache) {
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
      
      // Don't send profile picture in update request unless explicitly provided
      // This prevents accidentally clearing the profile picture
      if (!profileData.profilePicture) {
        console.log("No profile picture in update data - existing picture will be preserved");
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
        
        // Don't update profile picture in localStorage unless it's explicitly provided
        if (profileData.profilePicture) {
          localStorage.setItem('profilePicture', profileData.profilePicture);
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
      const accountType = localStorage.getItem('accountType');
      const isCustomer = accountType === 'ROLE_USER' || accountType === 'ROLE_CUSTOMER';
      
      try {
        // Make API call to upload profile picture
        const response = await axiosInstance.post(`/accounts/uploadProfilePicture/${accountId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Update profilePicture in localStorage after successful upload
        if (response.data && response.data.profilePicture) {
          localStorage.setItem('profilePicture', response.data.profilePicture);
        }
        
        // Always create a local backup of the image in base64 for resilience
        const file = formData.get('profilePicture');
        if (file) {
          // Create a local base64 version for resilience against 403 errors
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result;
            // Always store in localStorage for future use
            localStorage.setItem('profilePictureLocal', base64Data);
            localStorage.setItem('profilePictureUpdatedAt', Date.now().toString());
            
            // Dispatch event to notify components about the update
            window.dispatchEvent(new Event('userDataUpdated'));
          };
          reader.readAsDataURL(file);
        }
        
        // Dispatch event to notify components about the profile update
        window.dispatchEvent(new Event('userDataUpdated'));
        
        return response.data;
      } catch (apiError) {
        console.error('API error uploading profile picture:', apiError);
        
        // Special handling for customer accounts with permission issues
        if (isCustomer && (apiError.response?.status === 403 || apiError.response?.status === 401)) {
          console.log('Customer account got permission error when uploading profile picture - handling locally');
          
          // Create a file reader to get base64 data of the image
          const file = formData.get('profilePicture');
          if (file) {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64Data = reader.result;
                
                // Store in localStorage for local usage
                localStorage.setItem('profilePictureLocal', base64Data);
                localStorage.setItem('profilePictureUpdatedAt', Date.now().toString());
                
                // Dispatch event to notify components
                window.dispatchEvent(new Event('userDataUpdated'));
                
                // Return mock response
                resolve({
                  success: true,
                  message: 'Profile picture updated locally',
                  profilePicture: base64Data
                });
              };
              reader.readAsDataURL(file);
            });
          }
        }
        
        // Re-throw error for other cases
        throw apiError;
      }
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
        accountId = localStorage.getItem('id');
      }
      
      if (!accountId) {
        console.error('No accountId or userId found or retrievable');
        throw new Error('User ID not found');
      }
      
      // Make sure accountId is a number - backend expects Long
      if (typeof accountId === 'string') {
        accountId = parseInt(accountId, 10);
        if (isNaN(accountId)) {
          console.error('Invalid account ID (not a number)');
          throw new Error('Invalid user ID format');
        }
      }
      
      console.log(`Fetching orders for user ${accountId}, page: ${page}, size: ${size}`);
      
      const response = await axiosInstance.get(`/accounts/${accountId}/orders`, {
        params: { page, size }
      });
      
      console.log('Orders response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      
      // If we get a 403/401 error, return empty data structure instead of throwing
      if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        console.log('Returning empty orders list due to permission error');
        return { content: [], page: { size, number: page, totalElements: 0, totalPages: 0 } };
      }
      
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

      console.log('Using accountId for stats:', accountId);
      
      // Get orders count
      let orderCount = 0;
      try {
        console.log('Attempting to fetch orders count from /orders/count/${accountId}');
        const ordersResponse = await axiosInstance.get(`/orders/count/${accountId}`);
        console.log('Orders count response:', ordersResponse);
        
        if (ordersResponse.data !== undefined) {
          orderCount = parseInt(ordersResponse.data) || 0;
          console.log(`Found ${orderCount} orders`);
        }
      } catch (ordersError) {
        console.error('Error fetching orders count:', ordersError);
        if (ordersError.response) {
          console.error('Orders error response:', ordersError.response.data);
          console.error('Orders error status:', ordersError.response.status);
        }
      }
      
      // Get favorites count
      let favoritesCount = 0;
      try {
        console.log('Attempting to fetch favorites count from /favorites/count/${accountId}');
        const favoritesResponse = await axiosInstance.get(`/favorites/count/${accountId}`);
        console.log('Favorites count response:', favoritesResponse);
        
        if (favoritesResponse.data !== undefined) {
          favoritesCount = parseInt(favoritesResponse.data) || 0;
          console.log(`Found ${favoritesCount} favorites`);
        }
      } catch (favoritesError) {
        console.error('Error fetching favorites count:', favoritesError);
        if (favoritesError.response) {
          console.error('Favorites error response:', favoritesError.response.data);
          console.error('Favorites error status:', favoritesError.response.status);
        }
      }
      
      const stats = {
        orderCount,
        favoritesCount
      };
      console.log('Final stats:', stats);
      return stats;
    } catch (error) {
      console.error('Error in getUserStats:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      return {
        orderCount: 0,
        favoritesCount: 0
      };
    }
  }
};

export default profileApi; 