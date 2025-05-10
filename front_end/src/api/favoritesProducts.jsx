import axiosInstance from './axiosInstance';
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
            const favoritesWithDetails = await Promise.all(favoritesResponse.data.map(async favorite => {
                // Try to get complete product details
                let productDetails = null;
                try {
                    const productResponse = await axiosInstance.get(`/api/products/${favorite.productId}`);
                    productDetails = productResponse.data;
                } catch (error) {
                    console.error('Error fetching product details:', error);
                }

                return {
                    id: favorite.productId,
                    productId: favorite.productId,
                    productName: favorite.productName || productDetails?.productName || '',
                    productPrice: favorite.productPrice || productDetails?.productPrice || 0,
                    productInfo: favorite.productInfo || productDetails?.productInfo || '',
                    productImage: favorite.productImage ? getFullImageUrl(favorite.productImage) : null,
                    allergens: favorite.allergens || productDetails?.allergens || [],
                    categoryId: favorite.categoryId || productDetails?.categoryId,
                    accountId: favorite.accountId,
                    createdAt: favorite.createdAt,
                    menuName: favorite.menuName || 'Uncategorized',
                    restaurantId: favorite.restaurantId || favorite.restorantId || productDetails?.restaurantId || productDetails?.restorantId || null,
                    restorantId: favorite.restaurantId || favorite.restorantId || productDetails?.restaurantId || productDetails?.restorantId || null
                };
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
