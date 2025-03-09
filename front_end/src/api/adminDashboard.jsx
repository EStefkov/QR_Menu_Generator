const API_BASE_URL = import.meta.env.VITE_API_URL;

// Fetch paginated accounts
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

// Fetch paginated restaurants
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

// Взема менютата за даден ресторант
export const fetchMenusByRestaurantIdApi = async (token, restaurantId) => {
    const response = await fetch(`${API_BASE_URL}/api/menus/restaurant/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch menus");
    }
    
    return response.json();
};

// Взема категориите за дадено меню
export const fetchCategoriesByMenuIdApi = async (token, menuId) => {
    const response = await fetch(`${API_BASE_URL}/api/categories/menu/${menuId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }
    return response.json();
};


// Fetch QR code for a menu
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

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank"); // Отваря QR кода в нов прозорец
    } catch (error) {
        console.error("Error fetching QR code:", error);
        alert("Failed to fetch QR code. Please try again.");
    }
};


// Create a new menu
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

// Delete an account
export const deleteAccountApi = async (token, accountId) => {
    const response = await fetch(`${API_BASE_URL}/api/accounts/delete/${accountId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error("Failed to delete account");
    }
};

// Update an account
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

// Delete a restaurant
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

// Update a restaurant
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

// POST a new category in menu
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

export const createProductApi = async (token, formData) => {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        // НЕ слагаме Content-Type. FormData сам ще си сложи boundary
        Authorization: `Bearer ${token}`,
      },
      body: formData
    });
  
    if (!response.ok) {
      throw new Error("Failed to create product");
    }
  
    return await response.json();
  };








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
  