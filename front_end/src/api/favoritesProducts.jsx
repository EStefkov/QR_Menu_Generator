import { axiosInstance } from './axiosInstance';

export const favoritesApi = {
    addFavorite: async (productId) => {
        try {
            const response = await axiosInstance.post(`/api/favorites/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error adding favorite:', error);
            throw error;
        }
    },

    removeFavorite: async (productId) => {
        try {
            await axiosInstance.delete(`/api/favorites/${productId}`);
        } catch (error) {
            console.error('Error removing favorite:', error);
            throw error;
        }
    },

    getFavorites: async () => {
        try {
            const response = await axiosInstance.get('/api/favorites');
            return response.data;
        } catch (error) {
            console.error('Error getting favorites:', error);
            throw error;
        }
    },

    isFavorite: async (productId) => {
        try {
            const response = await axiosInstance.get(`/api/favorites/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error checking favorite status:', error);
            return false;
        }
    }
};
