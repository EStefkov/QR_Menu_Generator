// accountApi.jsx
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Регистрация на нов акаунт
 * @param {Object} accountData - съдържа полетата (accountName, mailAddress, password, ...)
 */
export const registerAccount = async (accountData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/accounts/register`, accountData);
    return response.data;
  } catch (error) {
    console.error("Error registering account:", error);
    throw error.response?.data || "Registration failed";
  }
};

/**
 * Логин на акаунт - връща JWT token, ако е успех
 * @param {Object} loginData - (accountName / mailAddress) + password
 */
export const loginAccount = async (loginData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/accounts/login`, loginData);
    // Бекендът ви връща само token (String) или { ... }? 
    // Ако е само token, response.data е самият стринг. Ако е обект, коригирайте.
    return response.data; // Тук приема, че това е самият JWT token
  } catch (error) {
    console.error("Error logging in:", error);
    throw error.response?.data || "Login failed";
  }
};

/**
 * Валидира дали токенът е все още валиден
 * При успех връща (примерно) { id, firstName, lastName, ... }
 * При грешка (401 и т.н.) - хвърля exception
 */
export const validateToken = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/accounts/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Данните за потребителя, ако желаете
  } catch (error) {
    console.error("Error validating token:", error);
    throw error.response?.data || "Token validation failed";
  }
};
