import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const cartApi = {
  getCart: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
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
      const response = await axios.post(`${BASE_URL}/api/cart/items`, 
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
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
      const response = await axios.put(`${BASE_URL}/api/cart/items/${productId}`, 
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
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
      const response = await axios.delete(`${BASE_URL}/api/cart/items/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
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
      const response = await axios.delete(`${BASE_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
}; 