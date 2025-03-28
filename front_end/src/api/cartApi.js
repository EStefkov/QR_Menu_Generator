import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Уверете се, че използвате същото име на токена като в останалата част на приложението
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

  // Променяме този URL да съответства на контролера
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/cart/add`, 
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Променяме и този URL
  updateCartItem: async (productId, quantity) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/cart/update`, 
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // И този URL
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

  // Този е правилен
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
  }
}; 