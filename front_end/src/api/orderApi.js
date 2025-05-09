import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance for orders API
const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/orders`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Ensure the token is properly formatted
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    config.headers.Authorization = formattedToken;
    
    // Log request details for debugging
    console.log('Making request to:', config.url);
    console.log('With auth token:', formattedToken.substring(0, 20) + '...');
    console.log('Request headers:', config.headers);
  } else {
    console.warn('No auth token found for request to:', config.url);
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Successful response from:', response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Response error:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // If we get a 403, check if it's due to missing/invalid token
      if (error.response.status === 403) {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('403 error: No token found in localStorage');
        } else {
          console.error('403 error: Token exists but may be invalid or expired');
        }
      }
    } else if (error.request) {
      console.error('Request error - no response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

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
      console.log("orderAPI - Creating order with data:", JSON.stringify(orderData, null, 2));
      
      const response = await axiosInstance.post('', orderData);
      console.log("orderAPI - Order creation successful:", response.data);
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
      // Use the regular endpoint now that we fixed the JWT issues
      const response = await axiosInstance.put(`/${orderId}/status`, null, {
        params: { status }
      });
      console.log("Status update response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  },
  
  getUserOrders: async (page = 0, size = 10) => {
    try {
      // Log the request for debugging
      console.log('Fetching user orders with params:', { page, size });
      console.log('Token present:', !!localStorage.getItem('token'));
      
      const response = await axiosInstance.get('/user', {
        params: { page, size }
      });
      
      // Log successful response
      console.log('Successfully fetched user orders:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw new Error(error.response?.data?.message || 'Failed to fetch your orders');
    }
  },
  
  deleteOrder: async (orderId) => {
    try {
      const response = await axiosInstance.delete(`/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete order');
    }
  },
  
  deleteAllOrdersByRestaurant: async (restaurantId) => {
    try {
      const response = await axiosInstance.delete(`/restaurant/${restaurantId}/all`);
      return response.data;
    } catch (error) {
      console.error('Error clearing restaurant orders:', error);
      throw new Error(error.response?.data?.message || 'Failed to clear restaurant order history');
    }
  }
}; 