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
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
      const response = await axiosInstance.post(`/restaurants/${restaurantId}/menus`, menuData);
      return response.data;
    } catch (error) {
      console.error('Error creating menu:', error);
      throw new Error(error.response?.data?.message || 'Failed to create menu');
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