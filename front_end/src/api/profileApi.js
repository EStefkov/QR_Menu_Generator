import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance for profile API
const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const profileApi = {
  // Get user profile information
  getUserProfile: async () => {
    try {
      const response = await axiosInstance.get('/accounts/current');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch profile details');
    }
  },
  
  // Update user profile information
  updateUserProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put(`/accounts/update/${profileData.id || localStorage.getItem('userId')}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },
  
  // Upload new profile picture
  uploadProfilePicture: async (formData) => {
    try {
      const accountId = localStorage.getItem('userId');
      const response = await axiosInstance.post(`/accounts/uploadProfilePicture/${accountId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload profile picture');
    }
  },
  
  // Change password
  changePassword: async (passwordData) => {
    try {
      const accountId = localStorage.getItem('userId');
      const response = await axiosInstance.post(`/accounts/${accountId}/change-password`, passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.error || 'Failed to change password';
      throw new Error(errorMessage);
    }
  },
  
  // Get admin statistics
  getAdminStatistics: async () => {
    try {
      const response = await axiosInstance.get('/admin/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin statistics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch admin statistics');
    }
  },
  
  // Until backend APIs are implemented, we can use these mock functions
  getMockAdminStatistics: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      restaurantStats: [
        { id: 1, name: "Restaurant A", totalOrders: 145, totalRevenue: 8750.50, averageOrderValue: 60.35 },
        { id: 2, name: "Restaurant B", totalOrders: 89, totalRevenue: 5340.25, averageOrderValue: 60.00 },
        { id: 3, name: "Restaurant C", totalOrders: 67, totalRevenue: 3980.75, averageOrderValue: 59.41 }
      ],
      popularProducts: [
        { id: 101, name: "Margherita Pizza", restaurantId: 1, restaurantName: "Restaurant A", orderCount: 78, revenue: 1170.00 },
        { id: 203, name: "Beef Burger", restaurantId: 2, restaurantName: "Restaurant B", orderCount: 65, revenue: 975.00 },
        { id: 105, name: "Caesar Salad", restaurantId: 1, restaurantName: "Restaurant A", orderCount: 42, revenue: 504.00 },
        { id: 302, name: "Spaghetti Carbonara", restaurantId: 3, restaurantName: "Restaurant C", orderCount: 38, revenue: 532.00 },
        { id: 208, name: "Chicken Wings", restaurantId: 2, restaurantName: "Restaurant B", orderCount: 36, revenue: 540.00 }
      ],
      recentOrders: [
        { id: 5001, restaurantName: "Restaurant A", customerName: "John Doe", totalAmount: 85.50, status: "DELIVERED", orderDate: new Date().toISOString() },
        { id: 5002, restaurantName: "Restaurant B", customerName: "Jane Smith", totalAmount: 42.75, status: "PREPARING", orderDate: new Date(Date.now() - 3600000).toISOString() },
        { id: 5003, restaurantName: "Restaurant C", customerName: "Alice Johnson", totalAmount: 67.25, status: "PENDING", orderDate: new Date(Date.now() - 7200000).toISOString() }
      ],
      orderStatusCounts: {
        PENDING: 12,
        PREPARING: 8,
        READY: 5,
        DELIVERED: 24,
        CANCELLED: 3
      },
      timeStats: {
        today: { orders: 18, revenue: 1082.50 },
        thisWeek: { orders: 87, revenue: 5242.75 },
        thisMonth: { orders: 301, revenue: 18060.50 }
      }
    };
  },
  
  getMockUserProfile: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      profilePicture: "/uploads/default_profile.png",
      createdAt: "2023-01-15T10:30:00Z",
      orderCount: 12,
      favoriteProducts: 8
    };
  }
};

export default profileApi; 