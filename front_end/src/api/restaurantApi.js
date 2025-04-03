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
        category: menuData.category || menuData.name,
        restaurantId: Number(restaurantId)
      };
      
      // Add description if provided
      if (menuData.description) {
        payload.description = menuData.description;
      }
      
      console.log("Creating menu with payload:", payload);
      
      // Use the /api/menus endpoint which is known to work
      const response = await axiosInstance.post(`/menus`, payload);
      return response.data;
    } catch (error) {
      console.error('Error creating menu:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
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

  // Delete a menu
  deleteMenu: async (menuId) => {
    try {
      await axiosInstance.delete(`/menus/${menuId}`);
      return true;
    } catch (error) {
      console.error('Error deleting menu:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete menu');
    }
  }
}; 