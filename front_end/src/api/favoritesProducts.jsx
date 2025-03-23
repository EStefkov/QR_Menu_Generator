import { axiosInstance } from './axiosInstance';
import { getFullImageUrl } from './adminDashboard';

export const favoritesApi = {
    addFavorite: async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const response = await axiosInstance.post(`/api/favorites/${productId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error adding favorite:', error);
            throw error;
        }
    },

    removeFavorite: async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            await axiosInstance.delete(`/api/favorites/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error removing favorite:', error);
            throw error;
        }
    },

    getFavorites: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const response = await axiosInstance.get('/api/favorites', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Transform the data to include full image URLs
            return response.data.map(favorite => {
                // If the product already has a full URL, use it
                const productImage = favorite.productImage;
                return {
                    ...favorite,
                    productImage: productImage ? getFullImageUrl(productImage) : null
                };
            });
        } catch (error) {
            console.error('Error getting favorites:', error);
            throw error;
        }
    },

    isFavorite: async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return false;
            }
            const response = await axiosInstance.get(`/api/favorites/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error checking favorite status:', error);
            return false;
        }
    }
};
