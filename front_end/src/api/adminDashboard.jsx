// adminDashboard.js
// Този файл съдържа всички API функции, които викаме от front-end.

// Базов URL към бекенда, взет от .env чрез Vite (VITE_API_URL).
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Извлича списък с акаунти (paginated).
 * @param {string} token - JWT токен за автентикация.
 * @param {number} currentPage - Номер на страницата.
 * @param {number} pageSize - Размер на страницата (колко записа).
 * @returns {Promise<any>} Обект с данни за акаунти { content: [], totalElements: ..., ... }.
 */
export const fetchAccountsApi = async (token, currentPage, pageSize) => {
    const response = await fetch(
        `${API_BASE_URL}/api/accounts/paged?page=${currentPage}&size=${pageSize}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    if (!response.ok) {
        throw new Error("Failed to fetch accounts");
    }
    return response.json();
};

/**
 * Извлича списък с ресторанти (paginated).
 * @param {string} token - JWT токен.
 * @param {number} currentPage - Номер на страницата.
 * @param {number} pageSize - Брой записи на страница.
 * @returns {Promise<any>} Обект с данни за ресторанти { content: [], totalElements: ..., ... }.
 */
export const fetchRestaurantsApi = async (token, currentPage, pageSize) => {
    const response = await fetch(
        `${API_BASE_URL}/api/restaurants/paged?page=${currentPage}&size=${pageSize}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    if (!response.ok) {
        throw new Error("Failed to fetch restaurants");
    }

    return response.json();
};

/**
 * Взема списък с менюта към даден ресторант.
 * @param {string} token - JWT токен.
 * @param {number} restaurantId - ID на ресторанта.
 * @returns {Promise<any[]>} Масив от обекти (менюта).
 */
export const fetchMenusByRestaurantIdApi = async (token, restaurantId) => {
    const response = await fetch(`${API_BASE_URL}/api/menus/restaurant/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch menus");
    }
    
    return response.json();
};

/**
 * Взема категориите за дадено меню.
 * @param {string} token - JWT токен.
 * @param {number} menuId - ID на менюто.
 * @returns {Promise<any[]>} Масив от обекти (категории).
 */
export const fetchCategoriesByMenuIdApi = async (token, menuId) => {
    const response = await fetch(`${API_BASE_URL}/api/categories/menu/${menuId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }
    return response.json();
};

/**
 * Взема QR кода за дадено меню, и го отваря в нов прозорец.
 * @param {string} token - JWT токен.
 * @param {number} menuId - ID на менюто.
 */
export const fetchQRCodeApi = async (token, menuId) => {
    if (!menuId) {
        console.error("Invalid menu ID:", menuId);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/menus/${menuId}/qrcode`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            console.error(`Failed to fetch QR code (Status: ${response.status})`);
            throw new Error(`Failed to fetch QR code. Server responded with status ${response.status}`);
        }

        // Връща binary blob (изображение)
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        // Отваряме в нов таб/прозорец
        window.open(url, "_blank");
    } catch (error) {
        console.error("Error fetching QR code:", error);
        alert("Failed to fetch QR code. Please try again.");
    }
};

/**
 * Създава ново меню (POST).
 * @param {string} token - JWT токен.
 * @param {object} newMenu - Данни за менюто (category, restaurantId и т.н.).
 * @returns {Promise<any>} Създаденият обект (JSON).
 */
export const createMenuApi = async (token, newMenu) => {
    const response = await fetch(`${API_BASE_URL}/api/menus`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMenu),
    });
    if (!response.ok) {
        throw new Error("Failed to create menu");
    }
    return response.json();
};

/**
 * Изтрива акаунт по дадено accountId.
 * @param {string} token - JWT токен.
 * @param {number} accountId - ID на акаунта за триене.
 */
export const deleteAccountApi = async (token, accountId) => {
    const response = await fetch(`${API_BASE_URL}/api/accounts/delete/${accountId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error("Failed to delete account");
    }
};

/**
 * Обновява (PUT) акаунт с дадено accountId.
 * @param {string} token - JWT токен.
 * @param {number} accountId - ID на акаунта за редакция.
 * @param {object} accountData - Новите данни за акаунта.
 */
export const updateAccountApi = async (token, accountId, accountData) => {
    const response = await fetch(
        `${API_BASE_URL}/api/accounts/update/${accountId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(accountData),
        }
    );
    if (!response.ok) {
        throw new Error("Failed to update account");
    }
};

/**
 * Триене на ресторант по дадено restaurantId.
 * @param {string} token - JWT токен.
 * @param {number} restaurantId - ID на ресторанта.
 */
export const deleteRestaurantApi = async (token, restaurantId) => {
    const response = await fetch(
        `${API_BASE_URL}/api/restaurants/delete/${restaurantId}`,
        {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    if (!response.ok) {
        throw new Error("Failed to delete restaurant");
    }
};

/**
 * Ъпдейт (PUT) на ресторант.
 * @param {string} token - JWT токен.
 * @param {number} restaurantId - ID на ресторанта.
 * @param {object} restaurantData - Данните, с които се обновява ресторантът.
 */
export const updateRestaurantApi = async (token, restaurantId, restaurantData) => {
    const response = await fetch(
        `${API_BASE_URL}/api/restaurants/${restaurantId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(restaurantData),
        }
    );
    if (!response.ok) {
        throw new Error("Failed to update restaurant");
    }
};

/**
 * Създаване на нова категория (POST) в дадено меню.
 * @param {string} token - JWT токен.
 * @param {object} categoryData - Данните за създаване { name, menuId, ... }.
 * @returns {Promise<any>} Създадената категория (JSON).
 */
export const createCategoryApi = async (token, categoryData) => {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
        throw new Error("Failed to create category");
    }

    return await response.json();
};

/**
 * Създаване на нов продукт (multipart формата).
 * @param {string} token - JWT токен.
 * @param {FormData} formData - Данни за продукта (ключове: productName, productPrice, productInfo, categoryId, productImage).
 * @returns {Promise<any>} Създаденият продукт (JSON).
 */
export const createProductApi = async (token, formData) => {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        // При FormData не задаваме "Content-Type"
        Authorization: `Bearer ${token}`,
      },
      body: formData
    });
  
    if (!response.ok) {
      throw new Error("Failed to create product");
    }
  
    return await response.json();
};

/**
 * Създава нов ресторант (POST).
 * @param {string} token - JWT токен.
 * @param {object} restaurantData - Данните за ресторанта (restorantName, phoneNumber, ...).
 * @returns {Promise<any>} Създаденият ресторант (JSON).
 */
export const createRestaurantApi = async (token, restaurantData) => {
    const response = await fetch(`${API_BASE_URL}/api/restaurants`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(restaurantData),
    });

    if (!response.ok) {
        throw new Error("Failed to create restaurant");
    }

    return response.json();
};

/**
 * Взема продукти според даден categoryId (GET).
 * @param {string} token - JWT токен.
 * @param {number} categoryId - ID на категорията.
 * @returns {Promise<any[]>} Масив от продукти.
 */
export async function fetchProductsByCategoryIdApi(token, categoryId) {
    if (!categoryId) {
      throw new Error("Invalid category ID");
    }
  
    const response = await fetch(`${API_BASE_URL}/api/products/category/${categoryId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error(`Failed to fetch products for category ID: ${categoryId}`);
    }
  
    const data = await response.json();
    return data;
}


/**
 * Ъпдейт на продукт (PUT) към /api/products/:id.
 * Ако подадеш FormData (multipart/form-data), не слагай "Content-Type" header.
 * 
 * @param {string} token - JWT токен.
 * @param {number} productId - ID на продукта, който редактираме.
 * @param {FormData} formData - Данни (име, цена, описание, файл) за продукта.
 * @returns {Promise<any>} Върнатият JSON от сървъра (обновения продукт).
 */
export const updateProductApi = async (token, productId, formData) => {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: "PUT",
      headers: {
        // НЕ задаваме "Content-Type", FormData го прави
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error(`Failed to update product with ID: ${productId}`);
    }
  
    return await response.json();
  };
  