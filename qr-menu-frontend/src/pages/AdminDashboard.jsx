import { useEffect, useState } from "react";
import "../styles/AdminDashboard.css";
import "../styles/Table.css";
import "../styles/Form.css";
import NavBar from "../components/NavBar.jsx";
import AccountsTable from "../components/AccountsTable";
import RestaurantsTable from "../components/RestaurantsTable.jsx";
import CreateMenuForm from "../components/CreateMenuForm.jsx";
import EditAccountForm from "../components/EditAccountForm.jsx";
import EditRestaurantForm from "../components/EditRestaurantForm.jsx";
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

    useEffect(() => {
        if (token) {
            fetchAccounts();
            fetchRestaurants();
        } else {
            console.error("No token found. Please log in.");
        }
    }, [currentPage]);

    const fetchAccounts = async () => {
        try {
            const data = await fetchAccountsApi(token, currentPage, pageSize);
            setAccounts(data.content);
        } catch (error) {
            console.error("Error fetching accounts:", error);
        }
    };

    const fetchRestaurants = async () => {
        try {
            const data = await fetchRestaurantsApi(token, currentPage, pageSize);
            setRestaurants(data.content);
        } catch (error) {
            console.error("Error fetching restaurants:", error);
        }
    };

    const fetchMenusByRestaurantId = async (restaurantId) => {
        if (!restaurantId) {
            console.error("Invalid restaurant ID:", restaurantId);
            return;
        }
        try {
            const data = await fetchMenusByRestaurantIdApi(token, restaurantId);
            setMenus((prev) => ({ ...prev, [restaurantId]: data }));
        } catch (error) {
            console.error(`Error fetching menus for restaurant ${restaurantId}:`, error);
        }
    };

    const deleteAccount = async (id) => {
        try {
            await deleteAccountApi(token, id);
            setAccounts(accounts.filter((account) => account.id !== id));
        } catch (error) {
            console.error(`Error deleting account ${id}:`, error);
        }
    };

    const saveAccount = async (updatedAccount) => {
        try {
            await updateAccountApi(token, updatedAccount.id, updatedAccount);
            setAccounts(accounts.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc)));
            setEditingAccount(null);
        } catch (error) {
            console.error("Error updating account:", error);
        }
    };

    const deleteRestaurant = async (id) => {
        try {
            await deleteRestaurantApi(token, id);
            setRestaurants(restaurants.filter((restaurant) => restaurant.id !== id));
        } catch (error) {
            console.error(`Error deleting restaurant ${id}:`, error);
        }
    };

    const saveRestaurant = async (updatedRestaurant) => {
        try {
            await updateRestaurantApi(token, updatedRestaurant.id, updatedRestaurant);
            setRestaurants(restaurants.map((res) => (res.id === updatedRestaurant.id ? updatedRestaurant : res)));
            setEditingRestaurant(null);
        } catch (error) {
            console.error("Error updating restaurant:", error);
        }
    };

    const createMenu = async () => {
        if (!newMenu.category || !newMenu.restorantId) {
            alert("Please fill in all fields before creating a menu.");
            return;
        }
        try {
            await createMenuApi(token, newMenu);
            alert("Menu created successfully!");
            setNewMenu({ category: "", restorantId: "" });
            fetchRestaurants(); // Refresh restaurants after creating a menu
        } catch (error) {
            console.error("Error creating menu:", error);
            fetchRestaurants();
        }
    };

    return (
        <div className="dashboard-container">
            <NavBar />
            <h1>Admin Dashboard</h1>

            {/* Таблица с акаунти */}
            <AccountsTable accounts={accounts} onEdit={setEditingAccount} onDelete={deleteAccount} />

            {/* Таблица с ресторанти */}
            <RestaurantsTable 
                restaurants={restaurants} 
                onEdit={setEditingRestaurant} 
                onDelete={deleteRestaurant} 
                onFetchMenus={fetchMenusByRestaurantId}  // ✅ Поправено извикване
                menus={menus}
                onFetchQRCode={fetchQRCodeApi}
                token={token}
            />

            {/* Форма за създаване на меню */}
            <CreateMenuForm 
                newMenu={newMenu} 
                setNewMenu={setNewMenu} 
                restaurants={restaurants} 
                onCreate={createMenu}  // ✅ Поправено извикване
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
