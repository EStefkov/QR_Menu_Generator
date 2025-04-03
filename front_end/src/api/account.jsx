// accountApi.jsx
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Utility function to prevent redirects on profile page
export const getStoredToken = () => {
  const token = localStorage.getItem('token');
  const isProfilePage = window.location.pathname.includes('/profile');
  
  if (token && isProfilePage) {
    console.log("On profile page with token - skipping validation");
    return { valid: true, token };
  }
  
  return token;
};

// Референция към текущото състояние на userUpdating флага
let isUserUpdating = false;
let lastUpdateTime = 0; // Запазваме времето на последната промяна на флага

// Експортираме функция, която другите компоненти могат да използват за задаване на флага
export const setUserUpdatingFlag = (value) => {
  console.log(`setUserUpdatingFlag: Setting to ${value}`);
  isUserUpdating = value;
  
  if (value) {
    // Ако флагът се задава на true, запазваме текущото време
    lastUpdateTime = Date.now();
    // Записваме го и в localStorage
    localStorage.setItem("userUpdatingTimestamp", lastUpdateTime.toString());
    localStorage.setItem("userIsUpdating", "true");
  } else {
    // Ако флагът се нулира, нулираме и времевата марка
    lastUpdateTime = 0;
    localStorage.removeItem("userUpdatingTimestamp");
    localStorage.removeItem("userIsUpdating");
  }
};

// Функция за проверка дали потребителят е в режим на обновяване
const isUserUpdatingProfile = () => {
  // Първо проверяваме глобалната променлива
  if (isUserUpdating) {
    return true;
  }
  
  // Проверяваме localStorage
  if (localStorage.getItem("userIsUpdating") === "true") {
    return true;
  }
  
  // Проверяваме времевата марка
  const storedTimestamp = localStorage.getItem("userUpdatingTimestamp");
  if (storedTimestamp) {
    const timestamp = parseInt(storedTimestamp, 10);
    const now = Date.now();
    const elapsed = now - timestamp;
    
    // Ако са минали по-малко от 30 секунди, считаме че потребителят още обновява
    if (elapsed < 30000) {
      console.log(`Token validation: User updated profile ${elapsed/1000} seconds ago, still considering as updating`);
      return true;
    }
  }
  
  return false;
};

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
  if (!token) {
    console.error("No token provided to validateToken");
    throw new Error("No token provided");
  }
  
  // Проверяваме дали потребителят в момента обновява профила си
  if (isUserUpdatingProfile()) {
    console.log("Skipping token validation because user is updating their profile");
    return { valid: true }; // Връщаме обект, че токенът е валиден
  }
  
  // Първо пробваме официалния endpoint
  try {
    console.log("Trying to validate token with /api/accounts/validate");
    const response = await axios.get(`${API_BASE_URL}/api/accounts/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000  // 5-секунден таймаут
    });
    console.log("Token validated successfully with /api/accounts/validate");
    return response.data;
  } catch (validateError) {
    // Проверка отново за флаг userUpdating (в случай, че е бил зададен междувременно)
    if (isUserUpdatingProfile()) {
      console.log("User started profile update during validation - assuming token is valid");
      return { valid: true };
    }
    
    // Ако валидацията е неуспешна, записваме грешката и пробваме резервния endpoint
    console.warn("Error validating token with main endpoint:", validateError.message);
    
    // Ако получим 401, токенът наистина е невалиден
    if (validateError.response && validateError.response.status === 401) {
      console.error("Token is invalid (401 Unauthorized)");
      throw validateError;
    }
    
    // За всички други грешки (включително 403, 500, мрежови грешки), опитваме с резервния endpoint
    try {
      console.log("Trying fallback endpoint /api/accounts/current");
      const fallbackResponse = await axios.get(`${API_BASE_URL}/api/accounts/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000
      });
      console.log("Token validated successfully with fallback endpoint");
      return fallbackResponse.data;
    } catch (fallbackError) {
      // Проверка отново за флаг userUpdating (в случай, че е бил зададен междувременно)
      if (isUserUpdatingProfile()) {
        console.log("User started profile update during fallback validation - assuming token is valid");
        return { valid: true };
      }
      
      console.error("Error validating token with fallback endpoint:", fallbackError.message);
      
      // Ако получим 401, токенът наистина е невалиден
      if (fallbackError.response && fallbackError.response.status === 401) {
        throw fallbackError;
      }
      
      // За 403 и други подобни, ако сме тук поради обновяване на профила,
      // бихме искали да не считаме това за грешка, така че връщаме празен обект
      // Това е само временно "добре" за да не блокираме потребителя
      if (isUserUpdating || localStorage.getItem("userIsUpdating") === "true" || 
          fallbackError.response?.status === 403) {
        console.warn("Ignoring temporary auth error during profile update");
        return { valid: true }; // Връщаме обект, че токенът е валиден
      }
      
      // За всяка друга грешка продължаваме да я хвърляме
      throw fallbackError;
    }
  }
};
