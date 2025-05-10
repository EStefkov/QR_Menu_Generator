import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance for restaurant API
const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    // Log token presence (but not the actual token for security)
    console.log(`Adding authorization token to ${config.method.toUpperCase()} ${config.url}`);
    config.headers.Authorization = `Bearer ${token}`;
    
    // Check token expiration (if possible)
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const expiration = new Date(payload.exp * 1000);
        const now = new Date();
        
        if (expiration < now) {
          console.warn(`Token expired at ${expiration.toLocaleString()}. Current time: ${now.toLocaleString()}`);
        }
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  } else {
    console.warn(`No auth token available for request to ${config.url}`);
  }
  
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

export const restaurantApi = {
  // Get restaurant by ID
  getRestaurantById: async (restaurantId) => {
    try {
      const response = await axiosInstance.get(`/restaurants/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch restaurant details');
    }
  },

  // Get all menus for a specific restaurant
  getRestaurantMenus: async (restaurantId) => {
    try {
      const response = await axiosInstance.get(`/restaurants/${restaurantId}/menus`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant menus:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch restaurant menus');
    }
  },

  // Get a specific menu by ID
  getMenuById: async (menuId) => {
    try {
      const response = await axiosInstance.get(`/menus/${menuId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching menu:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch menu details');
    }
  },

  // Create a new menu for a restaurant
  createMenu: async (restaurantId, menuData) => {
    try {
      // Ensure restaurantId is a number
      const payload = {
        category: menuData.category,
        restaurantId: Number(restaurantId)
      };
      
      // Log the payload for debugging
      console.log("Creating menu with payload:", JSON.stringify(payload, null, 2));
      
      // Use the /api/menus endpoint which is known to work
      const response = await axiosInstance.post(`/menus`, payload);
      console.log("Menu created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating menu:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        
        // More specific error message based on the status code
        if (error.response.status === 403) {
          throw new Error('Permission denied. You may not have access to create menus.');
        } else if (error.response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        
        throw new Error(error.response.data?.message || `Failed to create menu (Status: ${error.response.status})`);
      }
      throw new Error('Failed to create menu - Network error');
    }
  },

  // Update an existing menu
  updateMenu: async (menuId, menuData) => {
    try {
      const response = await axiosInstance.put(`/menus/${menuId}`, menuData);
      return response.data;
    } catch (error) {
      console.error('Error updating menu:', error);
      throw new Error(error.response?.data?.message || 'Failed to update menu');
    }
  },

  // Update a menu with images (using FormData)
  updateMenuWithImages: async (menuId, menuData, bannerImage, defaultProductImage) => {
    try {
      const formData = new FormData();
      
      // Add basic menu data
      formData.append('category', menuData.category || menuData.name);
      if (menuData.name) formData.append('name', menuData.name);
      if (menuData.restaurantId) formData.append('restaurantId', Number(menuData.restaurantId));
      
      // Add banner image if provided
      if (bannerImage) {
        formData.append('bannerImage', bannerImage);
      }
      
      // Add default product image if provided
      if (defaultProductImage) {
        formData.append('defaultProductImage', defaultProductImage);
      }
      
      // Try to use the special with-images endpoint first
      try {
        const response = await axios.put(`${API_BASE_URL}/api/menus/${menuId}/with-images`, formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            // Don't set Content-Type here, axios will set the correct one with boundary for FormData
          }
        });
        return response.data;
      } catch (withImagesError) {
        console.warn('Failed to use with-images endpoint, trying standard update endpoint', withImagesError);
        
        // If there are no actual image files, use the standard endpoint as fallback
        if (!bannerImage && !defaultProductImage) {
          const standardResponse = await axiosInstance.put(`/menus/${menuId}`, {
            category: menuData.category,
            name: menuData.name,
            restaurantId: menuData.restaurantId
          });
          return standardResponse.data;
        } else {
          // If we have images but the with-images endpoint failed, propagate the error
          throw withImagesError;
        }
      }
    } catch (error) {
      console.error('Error updating menu with images:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw new Error(error.response?.data?.message || 'Failed to update menu with images');
    }
  },

  // Delete a menu
  deleteMenu: async (menuId) => {
    try {
      await axiosInstance.delete(`/menus/${menuId}`);
      return true;
    } catch (error) {
      console.error('Error deleting menu:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete menu');
    }
  },
  
  // Apply default product image from menu to a specific product
  applyDefaultImageToProduct: async (productId, menuId) => {
    try {
      const response = await axiosInstance.post(`/products/${productId}/apply-default-image`, {
        menuId: Number(menuId)
      });
      return response.data;
    } catch (error) {
      console.error('Error applying default image to product:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw new Error(error.response?.data?.message || 'Failed to apply default image to product');
    }
  },
  
  // Get revenue data for a specific restaurant
  getRestaurantRevenue: async (restaurantId) => {
    try {
      const response = await axiosInstance.get(`/restaurants/${restaurantId}/revenue`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant revenue:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch revenue data');
    }
  },
  
  // Get comprehensive stats for a restaurant
  getRestaurantStats: async (restaurantId, timeRange = 'all') => {
    try {
      const response = await axiosInstance.get(`/restaurants/${restaurantId}/statistics`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant statistics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch restaurant statistics');
    }
  }
}; 