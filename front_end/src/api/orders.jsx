import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const ordersApi = axios.create({
  baseURL: `${API_BASE_URL}/api/orders`,
});

// Add request interceptor to include auth token
ordersApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createOrder = async (orderData) => {
  try {
    const response = await ordersApi.post('', orderData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create order');
  }
};

export const getRestaurantOrders = async (restaurantId, page = 0, size = 10) => {
  try {
    const response = await ordersApi.get(`/restaurant/${restaurantId}`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch orders');
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await ordersApi.put(`/${orderId}/status`, null, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update order status');
  }
}; 