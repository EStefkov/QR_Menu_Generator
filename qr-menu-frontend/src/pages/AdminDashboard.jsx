import { useEffect, useState, useCallback } from "react";
import "../styles/AdminDashboard.css";
import "../styles/Table.css";
import "../styles/Form.css";
import NavBar from "../components/NavBar.jsx";
import AccountsTable from "../components/AccountsTable";
import RestaurantsTable from "../components/RestaurantsTable.jsx";
import CreateMenuForm from "../components/CreateMenuForm.jsx";
import EditAccountForm from "../components/EditAccountForm.jsx";
import EditRestaurantForm from "../components/EditRestaurantForm.jsx";
import CreateCategoryForm from "../components/CreateCategoryForm";

import {
    fetchAccountsApi,
    fetchRestaurantsApi,
    fetchMenusByRestaurantIdApi,
    fetchQRCodeApi,
    createMenuApi,
    createCategoryApi,
    deleteAccountApi,
    updateAccountApi,
    deleteRestaurantApi,
    updateRestaurantApi,
} from "../api/adminDashboard";

const AdminDashboard = () => {
    const [accounts, setAccounts] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [editingAccount, setEditingAccount] = useState(null);
    const [editingRestaurant, setEditingRestaurant] = useState(null);
    const [newMenu, setNewMenu] = useState({ category: "", restorantId: "" });
    const [menus, setMenus] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(4);
    const token = localStorage.getItem("token");

    // Зареждаме акаунти и ресторанти при първоначално рендериране (или при смяна на currentPage)
    useEffect(() => {
        if (token) {
            fetchAccounts();
            fetchRestaurants();
        } else {
            console.error("No token found. Please log in.");
        }
    }, [currentPage, token]);
    // Добре е да имате 'token' като зависимост, ако може да се променя (примерно след логин/логаут).

    // Зареждане на акаунти (пагинация)
    const fetchAccounts = async () => {
        try {
            const data = await fetchAccountsApi(token, currentPage, pageSize);
            setAccounts(data.content);
        } catch (error) {
            console.error("Error fetching accounts:", error);
        }
    };

    // Зареждане на ресторанти (пагинация)
    const fetchRestaurants = async () => {
        try {
            const data = await fetchRestaurantsApi(token, currentPage, pageSize);
            setRestaurants(data.content);
        } catch (error) {
            console.error("Error fetching restaurants:", error);
        }
    };

    // Мемоизираме функцията за зареждане на менюта, за да не се създава
    // нова референция при всеки рендер.
    const fetchMenusByRestaurantId = useCallback(async (restaurantId) => {
        if (!restaurantId) {
            console.error("Invalid restaurant ID:", restaurantId);
            return [];
        }
        try {
            const data = await fetchMenusByRestaurantIdApi(token, restaurantId);
            // Записваме менютата в обект `menus`, ако искаме да ги ползваме и другаде
            setMenus((prev) => ({ ...prev, [restaurantId]: data }));
            return data; // важно за CreateCategoryForm
        } catch (error) {
            console.error(`Error fetching menus for restaurant ${restaurantId}:`, error);
            return [];
        }
    }, [token]); // Смяна на token води до нова функция

    // Изтриване на акаунт
    const deleteAccount = async (id) => {
        try {
            await deleteAccountApi(token, id);
            setAccounts((prev) => prev.filter((account) => account.id !== id));
        } catch (error) {
            console.error(`Error deleting account ${id}:`, error);
        }
    };

    // Запазване (редактиране) на акаунт
    const saveAccount = async (updatedAccount) => {
        try {
            await updateAccountApi(token, updatedAccount.id, updatedAccount);
            setAccounts((prev) =>
                prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc))
            );
            setEditingAccount(null);
        } catch (error) {
            console.error("Error updating account:", error);
        }
    };

    // Изтриване на ресторант
    const deleteRestaurant = async (id) => {
        try {
            await deleteRestaurantApi(token, id);
            setRestaurants((prev) => prev.filter((restaurant) => restaurant.id !== id));
        } catch (error) {
            console.error(`Error deleting restaurant ${id}:`, error);
        }
    };

    // Запазване (редактиране) на ресторант
    const saveRestaurant = async (updatedRestaurant) => {
        try {
            await updateRestaurantApi(token, updatedRestaurant.id, updatedRestaurant);
            setRestaurants((prev) =>
                prev.map((res) => (res.id === updatedRestaurant.id ? updatedRestaurant : res))
            );
            setEditingRestaurant(null);
        } catch (error) {
            console.error("Error updating restaurant:", error);
        }
    };

    // Създаване на ново меню
    const createMenu = async () => {
        if (!newMenu.category || !newMenu.restorantId) {
            alert("Please fill in all fields before creating a menu.");
            return;
        }
        try {
            await createMenuApi(token, newMenu);
            alert("Menu created successfully!");
            // Нулираме
            setNewMenu({ category: "", restorantId: "" });
            // Рефрешваме ресторантите или друг state, ако е необходимо
            fetchRestaurants();
        } catch (error) {
            console.error("Error creating menu:", error);
            // Все пак опитайте да рефрешнете, за да не оставате в несигурно състояние.
            fetchRestaurants();
        }
    };

    // Създаване на нова категория
    const createCategory = async (categoryData) => {
        try {
            await createCategoryApi(token, categoryData);
            alert("Category created successfully!");
            // Ако искате да презаредите менютата или ресторантите след създаване:
            // fetchMenusByRestaurantId(categoryData.menuId) или fetchRestaurants();
        } catch (error) {
            console.error("Error creating category:", error);
        }
    };

    return (
        <div className="dashboard-container">
            <NavBar />
            <h1>Admin Dashboard</h1>

            {/* Таблица с акаунти */}
            <AccountsTable
                accounts={accounts}
                onEdit={setEditingAccount}
                onDelete={deleteAccount}
            />

            {/* Таблица с ресторанти */}
            <RestaurantsTable
                restaurants={restaurants}
                onEdit={setEditingRestaurant}
                onDelete={deleteRestaurant}
                onFetchMenus={fetchMenusByRestaurantId}
                menus={menus}
                onFetchQRCode={fetchQRCodeApi}
                token={token}
            />

            {/* Форма за създаване на меню */}
            <CreateMenuForm
                newMenu={newMenu}
                setNewMenu={setNewMenu}
                restaurants={restaurants}
                onCreate={createMenu}
            />

            {/* Форма за създаване на категория (двустепенен избор: 1) ресторант -> 2) меню) */}
            <CreateCategoryForm
                restaurants={restaurants}
                fetchMenusByRestaurantId={fetchMenusByRestaurantId}
                onCreateCategory={createCategory}
            />

            {/* Форма за редактиране на акаунт */}
            {editingAccount && (
                <EditAccountForm
                    account={editingAccount}
                    onSave={saveAccount}
                    onCancel={() => setEditingAccount(null)}
                />
            )}

            {/* Форма за редактиране на ресторант */}
            {editingRestaurant && (
                <EditRestaurantForm
                    restaurant={editingRestaurant}
                    onSave={saveRestaurant}
                    onCancel={() => setEditingRestaurant(null)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
