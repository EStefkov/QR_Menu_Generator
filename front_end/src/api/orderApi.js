import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance for orders API
const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/orders`,
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const orderApi = {
  getOrderById: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch order details');
    }
  },
  
  createOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post('', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  },
  
  getRestaurantOrders: async (restaurantId, page = 0, size = 10) => {
    try {
      const response = await axiosInstance.get(`/restaurant/${restaurantId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },
  
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await axiosInstance.put(`/${orderId}/status`, null, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  },
  
  getUserOrders: async (page = 0, size = 10) => {
    try {
      const response = await axiosInstance.get('/user', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch your orders');
    }
  }
}; 