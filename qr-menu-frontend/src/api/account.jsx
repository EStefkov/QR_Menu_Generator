import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/accounts"; // Update with your backend URL

export const registerAccount = async (accountData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/register`, accountData);
        return response.data;
    } catch (error) {
        console.error("Error registering account:", error);
        throw error.response?.data || "Registration failed";
    }
};

export const loginAccount = async (loginData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, loginData);
        return response.data; // Should return the JWT token
    } catch (error) {
        console.error("Error logging in:", error);
        throw error.response?.data || "Login failed";
    }
};
