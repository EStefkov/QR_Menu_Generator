import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Get the auth token from localStorage
const getToken = () => localStorage.getItem('token');

export const cartApi = {
  getCart: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/cart/add`, 
        { 
          productId, 
          quantity 
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  updateCartItem: async (productId, quantity) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/cart/update`, 
        { 
          productId, 
          quantity 
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  removeFromCart: async (productId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/cart/remove/${productId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/cart/clear`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  createOrder: async (orderData) => {
    try {
      // Ensure restaurant ID is included
      if (!orderData.restorantId) {
        console.warn('No restaurant ID provided for order.');
      }
      
      // Log full order data for debugging
      console.log("Creating order with data:", JSON.stringify({
        url: `${BASE_URL}/api/orders`,
        accountId: orderData.accountId,
        restaurantId: orderData.restorantId,
        itemCount: orderData.products?.length || 0,
        authToken: getToken() ? 'Present' : 'Missing'
      }));
      
      const response = await axios.post(`${BASE_URL}/api/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
}; 