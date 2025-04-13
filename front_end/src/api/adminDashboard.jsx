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
    if (!token) {
        console.error("No token provided to createMenuApi");
        throw new Error("Authentication required. Please log in again.");
    }

    // Validate menu data
    if (!newMenu.category || !newMenu.category.trim()) {
        console.error("Menu category is required");
        throw new Error("Menu category is required");
    }

    if (!newMenu.restaurantId) {
        console.error("Restaurant ID is required");
        throw new Error("Restaurant ID is required");
    }

    // Ensure restaurantId is a number
    const menuPayload = {
        ...newMenu,
        restaurantId: Number(newMenu.restaurantId)
    };

    console.log("Creating menu with validated payload:", menuPayload);

    try {
        // Parse the token to check its contents
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log("Token payload:", payload);
            console.log("Token expiration:", new Date(payload.exp * 1000).toLocaleString());
            console.log("Current time:", new Date().toLocaleString());
            console.log("Is token expired:", payload.exp * 1000 < Date.now());
        }
        
        // First try the test endpoint
        console.log("Trying test endpoint...");
        const testEndpointResponse = await fetch(`${API_BASE_URL}/api/menus/test`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                category: menuPayload.category,
                restaurantId: menuPayload.restaurantId // Note: backend expects restaurantId, not restorantId
            }),
        });
        
        const testResult = await testEndpointResponse.json();
        console.log("Test endpoint response:", testResult);
        
        // Now try with a simpler payload without any unnecessary fields
        // Make sure we use restaurantId which is what the backend expects
        const simplePayload = {
            category: menuPayload.category,
            restaurantId: menuPayload.restaurantId // Note the field name change from restorantId to restaurantId
        };
        
        console.log("Using corrected payload with restaurantId instead of restorantId:", simplePayload);
        
        // Try the actual request with authentication and corrected payload
        const response = await fetch(`${API_BASE_URL}/api/menus`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(simplePayload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Create menu failed with status:", response.status);
            console.error("Error response:", errorText);
            throw new Error(`Failed to create menu: ${response.status} ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error("Error in createMenuApi:", error);
        throw error;
    }
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
 * Создава нов ресторант (POST).
 * @param {string} token - JWT токен.
 * @param {object} restaurantData - Данните за ресторанта (restorantName, phoneNumber, ...).
 * @returns {Promise<any>} Създаденият ресторант (JSON).
 */
export const createRestaurantApi = async (token, restaurantData) => {
    // Ensure address is properly structured
    const enhancedData = { ...restaurantData };
    
    // Make sure we have a contactInfo structure if address exists
    if (restaurantData.address && !restaurantData.contactInfo) {
        enhancedData.contactInfo = {
            ...(restaurantData.contactInfo || {}),
            address: restaurantData.address,
            phone: restaurantData.phoneNumber || restaurantData.phone,
            email: restaurantData.email
        };
    }
    
    // Make sure we have the address in all possible field formats
    enhancedData.restorantAddress = restaurantData.address;
    enhancedData.restaurantAddress = restaurantData.address;
    enhancedData.address = restaurantData.address;
    
    // Log the final data being sent to the API
    console.log("Creating restaurant with data:", JSON.stringify(enhancedData, null, 2));
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/restaurants`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(enhancedData),
        });

        const contentType = response.headers.get("content-type");
        let responseData;
        
        if (contentType && contentType.includes("application/json")) {
            responseData = await response.json();
            console.log("Server response (JSON):", responseData);
        } else {
            responseData = await response.text();
            console.log("Server response (Text):", responseData);
        }

        if (!response.ok) {
            console.error("Restaurant creation failed with status:", response.status);
            console.error("Response headers:", Object.fromEntries([...response.headers]));
            throw new Error(`Failed to create restaurant: ${response.status} - ${responseData}`);
        }

        console.log("Restaurant created successfully:", responseData);
        return responseData;
    } catch (error) {
        console.error("Error in createRestaurantApi:", error);
        throw error;
    }
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
  
  /**
 * Изтрива продукт по дадено productId.
 * @param {string} token - JWT токен.
 * @param {number} productId - ID на продукта за триене.
 */
export const deleteProductApi = async (token, productId) => {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to delete product with ID: ${productId}`);
    }
};

// Функция за качване на снимката
export const uploadProfilePicture = async (token, file, accountId) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePicture", file);

    const response = await fetch(`${API_BASE_URL}/api/accounts/uploadProfilePicture/${accountId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });
    if (!response.ok) {
        throw new Error("Failed to upload profile picture");
    }
};

export const uploadMenuImageApi = async (token, menuId, imageFile) => {
    try {
        console.log('Starting upload with:', { 
            menuId, 
            fileName: imageFile.name,
            fileSize: imageFile.size,
            fileType: imageFile.type
        });
        
        const formData = new FormData();
        // Use 'image' to match @RequestParam("image") in MenuController
        formData.append('image', imageFile);
        

        const response = await fetch(`${API_BASE_URL}/api/menus/${menuId}/image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            console.error('Response status:', response.status);
            console.error('Response headers:', Object.fromEntries([...response.headers]));
            throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Upload successful:', data);
        return data;
    } catch (error) {
        console.error('Error in uploadMenuImageApi:', error);
        throw error;
    }
};

// Helper function to get full image URL
export const getFullImageUrl = (relativePath) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  
  if (!relativePath || relativePath.trim() === '') {
    return `${API_BASE_URL}/uploads/default_product.png`;
  }
  
  // If it's already a full URL, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Special case for old default product paths
  if (relativePath === 'default_product.png') {
    console.warn('Using legacy default_product.png path. Update to menu-specific path.');
    return `${API_BASE_URL}/uploads/default_product.png`;
  }
  
  // Handle menu-specific default product images
  // This matches patterns like "/uploads/4/default_product.png" or "uploads/4/default_product.jpg"
  const menuPathRegex = /^(?:\/)?uploads\/(\d+)\/default_product(\.\w+)?$/;
  if (menuPathRegex.test(relativePath)) {
    // Make sure we have the correct format with API_BASE_URL
    const formattedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${API_BASE_URL}${formattedPath}`;
  }
  
  // If it's a path starting with /, add the API base URL
  if (relativePath.startsWith('/')) {
    return `${API_BASE_URL}${relativePath}`;
  }
  
  // Otherwise, assume it's a relative path and add the leading slash
  return `${API_BASE_URL}/${relativePath}`;
};

// Get category details including menu and restaurant info
export async function getCategoryDetails(categoryId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token available for getCategoryDetails');
      throw new Error('Authentication required');
    }

    console.log(`Fetching category details for ID ${categoryId} with auth token`);
    
    const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const statusText = response.statusText;
      console.error(`Category details fetch failed: ${response.status} ${statusText}`);
      throw new Error(`Failed to fetch category: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Successfully retrieved category details for ID ${categoryId}:`, data);
    
    // Extract restaurant ID from the response
    let restaurantId = null;
    if (data.menu && data.menu.restorant) {
      restaurantId = data.menu.restorant.id;
      console.log(`Found restaurant ID ${restaurantId} in category details`);
    }
    
    // Add a restorantId field to make it easier to access
    return {
      ...data,
      restorantId: restaurantId,
      restaurantId: restaurantId // Add both spellings for compatibility
    };
  } catch (error) {
    console.error(`Error fetching category details for ID ${categoryId}:`, error);
    throw error;
  }
}

/**
 * Извлича всички поръчки в системата (paginated) за администратор.
 * @param {string} token - JWT токен за автентикация.
 * @param {number} page - Номер на страницата (започва от 0).
 * @param {number} size - Брой записи на страница.
 * @param {string} sortBy - Поле, по което да се сортира (по подразбиране: orderTime).
 * @param {string} direction - Посока на сортиране (asc или desc).
 * @returns {Promise<any>} Обект с данни за поръчки { content: [], totalElements: ..., ... }.
 */
export const fetchAllOrdersApi = async (token, page = 0, size = 10, sortBy = 'orderTime', direction = 'desc') => {
    const response = await fetch(
        `${API_BASE_URL}/api/orders?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    if (!response.ok) {
        throw new Error("Failed to fetch orders");
    }
    return response.json();
};

/**
 * Извлича всички акаунти (без пагинация).
 * @param {string} token - JWT токен за автентикация.
 * @returns {Promise<any[]>} Масив с всички акаунти.
 */
export const fetchAllAccountsApi = async (token) => {
    const response = await fetch(
        `${API_BASE_URL}/api/accounts/all`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    if (!response.ok) {
        throw new Error("Failed to fetch all accounts");
    }
    return response.json();
};

// Manager Assignment Management
export const getManagerAssignments = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manager-assignments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch manager assignments');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error fetching manager assignments:', error);
      throw error;
    }
  };
  
  export const assignManagerToRestaurant = async (token, managerId, restaurantId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manager-assignments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          managerId,
          restaurantId
        })
      });
  
      if (!response.ok) {
        // Check the content type to determine how to parse the error
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to assign manager to restaurant');
        } else {
          // Handle text/plain or any other non-JSON response
          const errorText = await response.text();
          console.error('Server returned non-JSON error:', errorText);
          throw new Error('Failed to assign manager to restaurant: ' + errorText);
        }
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error assigning manager to restaurant:', error);
      throw error;
    }
  };
  
  export const removeManagerAssignment = async (token, assignmentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manager-assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove manager assignment');
      }
  
      return true;
    } catch (error) {
      console.error('Error removing manager assignment:', error);
      throw error;
    }
  };
  
  export const getRestaurantsByManager = async (token, managerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manager-assignments/manager/${managerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch restaurants for manager');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error fetching restaurants for manager:', error);
      throw error;
    }
  };
  
  export const getManagersByRestaurant = async (token, restaurantId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manager-assignments/restaurant/${restaurantId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch managers for restaurant');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error fetching managers for restaurant:', error);
      throw error;
    }
  };

export const getAvailableManagers = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/manager-assignments/available-managers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch available managers');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching available managers:', error);
    throw error;
  }
};

export const batchAssignRestaurantsToManager = async (token, managerId, restaurantIds) => {
  try {
    // Log the request payload for debugging
    console.log('Batch assigning restaurants:', { managerId, restaurantIds });
    
    const response = await fetch(`${API_BASE_URL}/api/manager-assignments/batch-assign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        managerId,
        restaurantIds
      })
    });

    // Get response content type to determine how to handle the response
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      // Handle error response based on content type
      if (contentType && contentType.includes('application/json')) {
        // Parse JSON error
        const errorData = await response.json();
        console.error('Server returned JSON error:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to batch assign restaurants to manager');
      } else {
        // Handle text/plain or any other non-JSON response
        const errorText = await response.text();
        console.error('Server returned non-JSON error:', errorText);
        throw new Error('Failed to batch assign restaurants to manager: ' + errorText);
      }
    }

    // Handle success response
    let responseData;
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      // Unexpected content type for success response
      const responseText = await response.text();
      console.warn('Unexpected content type for success response:', contentType, responseText);
      responseData = { message: responseText };
    }

    console.log('Batch assignment successful:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error batch assigning restaurants to manager:', error);
    throw error;
  }
};

export const updateUserRole = async (token, userId, role) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/accounts/${userId}/update-role`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update user role');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const getManagedRestaurants = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/restaurants/managed`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch managed restaurants');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching managed restaurants:', error);
    throw error;
  }
}; 