import { axiosInstance } from './axiosInstance';
import { getFullImageUrl } from './adminDashboard';

export const favoritesApi = {
    addFavorite: async (productId) => {
        try {
            const response = await axiosInstance.post(`/api/favorites/${productId}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 403) {
                throw new Error('Authentication required');
            }
            throw error;
        }
    },

    removeFavorite: async (productId) => {
        try {
            const response = await axiosInstance.delete(`/api/favorites/${productId}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 403) {
                throw new Error('Authentication required');
            }
            throw error;
        }
    },

    getFavorites: async () => {
        try {
            const favoritesResponse = await axiosInstance.get('/api/favorites');
            console.log('Raw favorites data:', favoritesResponse.data);

            // Transform the favorites data to include all necessary fields
            const favoritesWithDetails = favoritesResponse.data.map(favorite => ({
                id: favorite.productId,
                productId: favorite.productId,
                productName: favorite.productName || '',
                productPrice: favorite.productPrice || 0,
                productInfo: favorite.productInfo || '',
                productImage: favorite.productImage ? getFullImageUrl(favorite.productImage) : null,
                allergens: favorite.allergens || [],
                categoryId: favorite.categoryId,
                accountId: favorite.accountId,
                createdAt: favorite.createdAt
            }));

            console.log('Processed favorites:', favoritesWithDetails);
            return favoritesWithDetails;
        } catch (error) {
            if (error.response?.status === 403) {
                throw new Error('Authentication required');
            }
            throw error;
        }
    },

    isFavorite: async (productId) => {
        try {
            const response = await axiosInstance.get(`/api/favorites/${productId}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 403) {
                return false;
            }
            console.error('Error checking favorite status:', error);
            return false;
        }
    }
};
