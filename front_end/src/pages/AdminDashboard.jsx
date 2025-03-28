import { useEffect, useState,useContext } from "react";
import { AuthContext } from "../contexts/AuthContext"; 
import AccountsTable from "../components/AccountsTable";
import RestaurantsTable from "../components/RestaurantsTable.jsx";
import CreateMenuForm from "../components/CreateMenuForm.jsx";
import EditAccountForm from "../components/EditAccountForm.jsx";
import EditRestaurantForm from "../components/EditRestaurantForm.jsx";
import CreateCategoryForm from "../components/CreateCategoryForm";
import CreateProductForm from "../components/CreateProductForm.jsx";
import CreateRestaurantForm from "../components/CreateRestaurantForm";

import {
    fetchAccountsApi,
    fetchRestaurantsApi,
    fetchMenusByRestaurantIdApi,
    fetchQRCodeApi,
    createMenuApi,
    deleteAccountApi,
    updateAccountApi,
    deleteRestaurantApi,
    updateRestaurantApi,
    createCategoryApi,
    createRestaurantApi,
    fetchCategoriesByMenuIdApi
} from "../api/adminDashboard";

const AdminDashboard = () => {
    const [activeComponent, setActiveComponent] = useState("accounts");
    const [accounts, setAccounts] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [menus, setMenus] = useState({});
    const [editingAccount, setEditingAccount] = useState(null);
    const [editingRestaurant, setEditingRestaurant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newMenu, setNewMenu] = useState({ category: "", restaurantId: "" });

    const { userData } = useContext(AuthContext);
    const token = userData?.token;

    useEffect(() => {
        if (token) {
            fetchAccounts();
            fetchRestaurants();
        } else {
            setError("No authentication token found. Please log in again.");
        }
    }, [token]);

    const fetchAccounts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await fetchAccountsApi(token, 0, 10);
            if (!data || !data.content) {
                throw new Error("Invalid response format from server");
            }
            setAccounts(data.content || []);
        } catch (error) {
            setError("Failed to load accounts. Please try again later.");
            setAccounts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRestaurants = async () => {
        try {
            const data = await fetchRestaurantsApi(token, 0, 10);
            setRestaurants(data.content);
        } catch (error) {
            setError("Failed to load restaurants. Please try again later.");
        }
    };

    const fetchMenusByRestaurantId = async (restaurantId) => {
        if (!restaurantId) {
            setError("Invalid restaurant ID");
            return [];
        }
        if (menus[restaurantId]) {
            return menus[restaurantId];
        }
        try {
            const data = await fetchMenusByRestaurantIdApi(token, restaurantId);
            setMenus((prev) => ({ ...prev, [restaurantId]: data }));
            return data;
        } catch (error) {
            setError("Failed to load menus. Please try again later.");
            return [];
        }
    };

    const handleDeleteAccount = async (accountId) => {
        try {
            await deleteAccountApi(token, accountId);
            setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
        } catch (error) {
            alert("Неуспешно изтриване на акаунт!");
        }
    };

    const handleUpdateAccount = async (updatedAccount) => {
        try {
            await updateAccountApi(token, updatedAccount.id, updatedAccount);
            setAccounts((prev) =>
                prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc))
            );
            setEditingAccount(null);
            alert("Акаунтът е успешно актуализиран!");
        } catch (error) {
            alert("Неуспешна актуализация на акаунта!");
        }
    };

    const handleAccountTypeChange = async (accountId, newType) => {
        const accountToUpdate = accounts.find((acc) => acc.id === accountId);
        if (!accountToUpdate) return;

        const updatedAccount = { ...accountToUpdate, accountType: newType };

        try {
            await updateAccountApi(token, accountId, updatedAccount);
            setAccounts((prev) =>
                prev.map((acc) =>
                    acc.id === accountId ? updatedAccount : acc
                )
            );
            alert("Типът на акаунта е успешно променен!");
        } catch (error) {
            alert("Неуспешна промяна на типа акаунт!");
        }
    };

    const handleFetchQRCode = async (token, menuId) => {
        await fetchQRCodeApi(token, menuId);
    };

    const handleCreateRestaurant = async (restaurantData) => {
        try {
            await createRestaurantApi(token, restaurantData);
            alert("Ресторантът е създаден успешно!");
            fetchRestaurants();
        } catch (error) {
            alert("Неуспешно създаване на ресторант!");
        }
    };

    const handleCreateMenu = async () => {
        try {
            console.log("Creating menu with token:", token);
            await createMenuApi(token, newMenu);
            fetchMenusByRestaurantId(newMenu.restaurantId);
            setNewMenu({ category: "", restaurantId: "" });
            alert("Menu created successfully!");
        } catch (error) {
            console.error("Error creating menu:", error);
            alert("Failed to create menu: " + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="flex flex-col md:flex-row">
                <aside className="w-full md:w-1/4 p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg md:ml-6 md:mt-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                        Админ панел
                    </h2>
                    <nav className="flex flex-col md:items-start items-center">
                        {[
                            { id: "accounts", name: "Акаунти" },
                            { id: "restaurants", name: "Ресторанти" },
                            { id: "createRestaurant", name: "Създай Ресторант"},
                            { id: "createMenu", name: "Създай Меню" },
                            { id: "createCategory", name: "Създай Категория" },
                            { id: "createProduct", name: "Създай Продукт" }
                        ].map(({ id, name }) => (
                            <button
                                key={id}
                                className={`w-full text-left py-2 px-4 rounded-md ${
                                    activeComponent === id
                                        ? "bg-blue-500 text-white"
                                        : "hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                                onClick={() => setActiveComponent(id)}
                            >
                                {name}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="w-full md:w-3/4 p-4 md:p-6">
                    {activeComponent === "accounts" && (
                        <>
                            {error && (
                                <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
                                    {error}
                                </div>
                            )}
                            {isLoading ? (
                                <div className="flex items-center justify-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            ) : (
                                <AccountsTable
                                    accounts={accounts}
                                    onEdit={setEditingAccount}
                                    onDelete={handleDeleteAccount}
                                    onChangeType={handleAccountTypeChange}
                                />
                            )}
                        </>
                    )}

                    {activeComponent === "restaurants" && (
                        <RestaurantsTable
                            restaurants={restaurants}
                            onEdit={setEditingRestaurant}
                            onDelete={async (id) => {
                                try {
                                    await deleteRestaurantApi(token, id);
                                    setRestaurants((prev) =>
                                        prev.filter((res) => res.id !== id)
                                    );
                                    alert("Ресторантът е изтрит успешно!");
                                } catch (error) {
                                    alert("Неуспешно изтриване на ресторант!");
                                }
                            }}
                            menus={menus}
                            onFetchMenus={fetchMenusByRestaurantId}
                            onFetchQRCode={handleFetchQRCode}
                            token={token}
                        />
                    )}

                    {activeComponent === "createRestaurant" && (
                        <CreateRestaurantForm onCreateRestaurant={handleCreateRestaurant} />
                    )}

                    {activeComponent === "createMenu" && (
                        <CreateMenuForm
                            newMenu={newMenu}
                            setNewMenu={setNewMenu}
                            restaurants={restaurants}
                            onCreate={handleCreateMenu}
                        />
                    )}

                    {activeComponent === "createCategory" && (
                        <CreateCategoryForm
                            restaurants={restaurants}
                            fetchMenusByRestaurantId={fetchMenusByRestaurantId}
                            onCreateCategory={async (categoryData) => {
                                try {
                                    await createCategoryApi(token, categoryData);
                                    alert("Категорията е създадена успешно!");
                                } catch (error) {
                                    alert("Неуспешно създаване на категория!");
                                }
                            }}
                        />
                    )}

                    {activeComponent === "createProduct" && (
                        <CreateProductForm
                            token={token}
                            onCreateProduct={async () => {
                                try {
                                    // Product creation handled in component
                                } catch (error) {
                                    alert("Неуспешно създаване на продукт!");
                                }
                            }}
                            fetchRestaurants={async () => {
                                const restaurants = await fetchRestaurantsApi(token, 0, 50);
                                return restaurants.content || [];
                            }}
                            fetchMenus={async (restaurantId) => {
                                return await fetchMenusByRestaurantIdApi(token, restaurantId);
                            }}
                            fetchCategories={async (menuId) => {
                                return await fetchCategoriesByMenuIdApi(token, menuId);
                            }}
                        />
                    )}

                    {editingAccount && (
                        <EditAccountForm
                            token={token}
                            account={editingAccount}
                            onSave={handleUpdateAccount}
                            onCancel={() => setEditingAccount(null)}
                        />
                    )}

                    {editingRestaurant && (
                        <EditRestaurantForm
                            restaurant={editingRestaurant}
                            onSave={async (updatedRestaurant) => {
                                try {
                                    await updateRestaurantApi(token, updatedRestaurant.id, updatedRestaurant);
                                    setRestaurants((prev) =>
                                        prev.map((res) =>
                                            res.id === updatedRestaurant.id ? updatedRestaurant : res
                                        )
                                    );
                                    setEditingRestaurant(null);
                                    alert("Ресторантът е успешно редактиран!");
                                } catch (error) {
                                    alert("Неуспешно редактиране на ресторант!");
                                }
                            }}
                            onCancel={() => setEditingRestaurant(null)}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
