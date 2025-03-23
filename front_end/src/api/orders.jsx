import axios from 'axios';
import { API_BASE_URL } from './config';

const ordersApi = axios.create({
  baseURL: `${API_BASE_URL}/orders`,
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