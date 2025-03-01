import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL; // Update with your backend URL

export const registerAccount = async (accountData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/accounts/register`, accountData);
        return response.data;
    } catch (error) {
        console.error("Error registering account:", error);
        throw error.response?.data || "Registration failed";
    }
};

export const loginAccount = async (loginData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/accounts/login`, loginData);
        return response.data; // Should return the JWT token
    } catch (error) {
        console.error("Error logging in:", error);
        throw error.response?.data || "Login failed";
    }
};
