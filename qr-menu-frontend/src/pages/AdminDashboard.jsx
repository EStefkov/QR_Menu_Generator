import { useEffect, useState } from "react";
import "../styles/AdminDashboard.css";
import "../styles/Table.css";
import "../styles/Form.css";
import NavBar from "../components/NavBar.jsx";
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingAccount, setEditingAccount] = useState(null);
    const [editingRestaurant, setEditingRestaurant] = useState(null);
    const [newMenu, setNewMenu] = useState({ category: "", restorantId: "" });
    const [menus, setMenus] = useState({}); // Key: restaurantId, Value: array of menus

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(4);

    const token = localStorage.getItem("token");

    // Fetch accounts
    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const data = await fetchAccountsApi(token, currentPage, pageSize);
            setAccounts(data.content);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch restaurants
    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const data = await fetchRestaurantsApi(token, currentPage, pageSize);
            setRestaurants(data.content);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch menus by restaurant
    const fetchMenusByRestaurantId = async (restaurantId) => {
        try {
            const data = await fetchMenusByRestaurantIdApi(token, restaurantId);
            setMenus((prev) => ({ ...prev, [restaurantId]: data }));
        } catch (err) {
            alert(err.message);
        }
    };

    // Fetch QR code
    const fetchQRCode = async (menuId) => {
        try {
            const blob = await fetchQRCodeApi(token, menuId);
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
        } catch (err) {
            alert(err.message);
        }
    };

    // Create menu
    const createMenu = async () => {
        if (!newMenu.category || !newMenu.restorantId) {
            alert("Please fill in all fields.");
            return;
        }
        try {
            await createMenuApi(token, newMenu);
            alert("Menu created successfully!");
            setNewMenu({ category: "", restorantId: "" });
            fetchRestaurants(); // Refresh restaurants
        } catch (err) {
            alert(err.message);
        }
    };

    // Delete account
    const deleteAccount = async (id) => {
        try {
            await deleteAccountApi(token, id);
            setAccounts(accounts.filter((account) => account.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    // Update account
    const saveAccount = async () => {
        try {
            await updateAccountApi(token, editingAccount.id, editingAccount);
            setAccounts((prev) =>
                prev.map((acc) => (acc.id === editingAccount.id ? editingAccount : acc))
            );
            setEditingAccount(null);
        } catch (err) {
            alert(err.message);
        }
    };

    // Delete restaurant
    const deleteRestaurant = async (id) => {
        try {
            await deleteRestaurantApi(token, id);
            setRestaurants(restaurants.filter((restaurant) => restaurant.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    // Update restaurant
    const saveRestaurant = async () => {
        try {
            await updateRestaurantApi(token, editingRestaurant.id, editingRestaurant);
            setRestaurants((prev) =>
                prev.map((res) =>
                    res.id === editingRestaurant.id ? editingRestaurant : res
                )
            );
            setEditingRestaurant(null);
        } catch (err) {
            alert(err.message);
        }
    };
// Initial data fetch
    useEffect(() => {
        if (token) {
            fetchAccounts();
            fetchRestaurants();
        } else {
            setError("No token found. Please log in.");
        }
    }, [currentPage, pageSize]);

    // Pagination Handlers
    const handleNextPage = () => setCurrentPage((prev) => prev + 1);
    const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

    // UI Rendering
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="dashboard-container">
            <NavBar />
            <h1>Admin Dashboard</h1>
            <p>Manage accounts and restaurants</p>

            {/* Accounts Table */}
            <section>
                <h2>Accounts</h2>
                {accounts.length > 0 ? (
                    <>
                        <table>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {accounts.map((account) => (
                                <tr key={account.id}>
                                    <td>{account.id}</td>
                                    <td>{account.firstName} {account.lastName}</td>
                                    <td>{account.mailAddress}</td>
                                    <td>{account.accountType}</td>
                                    <td>
                                        <button
                                            className="edit-btn"
                                            onClick={() => setEditingAccount(account)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => deleteAccount(account.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className="pagination-controls">
                            <button onClick={handlePrevPage} disabled={currentPage === 0}>
                                Previous
                            </button>
                            <span>Page {currentPage + 1}</span>
                            <button onClick={handleNextPage}>Next</button>
                        </div>
                    </>
                ) : (
                    <p>No accounts available.</p>
                )}
            </section>

            {/* Restaurants Table */}
            <section>
                <h2>Restaurants</h2>
                {restaurants.length > 0 ? (
                    <>
                        <table>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Owner ID</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {restaurants.map((restaurant) => (
                                <tr key={restaurant.id}>
                                    <td>{restaurant.id}</td>
                                    <td>{restaurant.restorantName}</td>
                                    <td>{restaurant.phoneNumber}</td>
                                    <td>{restaurant.accountId}</td>
                                    <td>
                                        <button
                                            className="edit-btn"
                                            onClick={() => setEditingRestaurant(restaurant)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => deleteRestaurant(restaurant.id)}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            className="fetch-menus-btn"
                                            onClick={() => fetchMenusByRestaurantId(restaurant.id)}
                                        >
                                            Load Menus
                                        </button>
                                        {menus[restaurant.id] && menus[restaurant.id].length > 0 && (
                                            <>
                                                <select
                                                    onChange={(e) =>
                                                        fetchQRCode(e.target.value)
                                                    }
                                                >
                                                    <option value="">Select a Menu</option>
                                                    {menus[restaurant.id].map((menu) => (
                                                        <option key={menu.id} value={menu.id}>
                                                            {menu.category}
                                                        </option>
                                                    ))}
                                                </select>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>

                        </table>
                        <div className="pagination-controls">
                            <button onClick={handlePrevPage} disabled={currentPage === 0}>
                                Previous
                            </button>
                            <span>Page {currentPage + 1}</span>
                            <button onClick={handleNextPage}>Next</button>
                        </div>

                    </>
                ) : (
                    <p>No restaurants available.</p>
                )}
            </section>

            <section>
                <h2>Create Menu</h2>
                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <input
                        type="text"
                        id="category"
                        value={newMenu.category}
                        onChange={(e) =>
                            setNewMenu({...newMenu, category: e.target.value})
                        }
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="restorant">Restaurant</label>
                    <select
                        id="restorant"
                        value={newMenu.restorantId}
                        onChange={(e) =>
                            setNewMenu({...newMenu, restorantId: e.target.value})
                        }
                    >
                        <option value="">Select a Restaurant</option>
                        {restaurants.map((restaurant) => (
                            <option key={restaurant.id} value={restaurant.id}>
                                {restaurant.restorantName}
                            </option>
                        ))}
                    </select>
                </div>
                <button onClick={createMenu}>Create Menu</button>
            </section>
            ;



            {/* Edit Forms */}
            {editingAccount && (
                <div className="edit-form">
                    <h3>Edit Account</h3>
                    <input
                        type="text"
                        value={editingAccount.firstName || ""}
                        onChange={(e) =>
                            setEditingAccount({...editingAccount, firstName: e.target.value})
                        }
                        placeholder="First Name"
                    />
                    <input
                        type="text"
                        value={editingAccount.lastName || ""}
                        onChange={(e) =>
                            setEditingAccount({...editingAccount, lastName: e.target.value})
                        }
                        placeholder="Last Name"
                    />
                    <input
                        type="email"
                        value={editingAccount.mailAddress || ""}
                        onChange={(e) =>
                            setEditingAccount({...editingAccount, mailAddress: e.target.value})
                        }
                        placeholder="Email"
                    />
                    <button className="edit-btn" onClick={saveAccount}>
                        Save
                    </button>
                    <button className="delete-btn" onClick={() => setEditingAccount(null)}>
                        Cancel
                    </button>
                </div>
            )}

            {editingRestaurant && (
                <div className="edit-form">
                    <h3>Edit Restaurant</h3>
                    <input
                        type="text"
                        value={editingRestaurant.restorantName || ""}
                        onChange={(e) =>
                            setEditingRestaurant({
                                ...editingRestaurant,
                                restorantName: e.target.value,
                            })
                        }
                        placeholder="Restaurant Name"
                    />
                    <input
                        type="text"
                        value={editingRestaurant.phoneNumber || ""}
                        onChange={(e) =>
                            setEditingRestaurant({
                                ...editingRestaurant,
                                phoneNumber: e.target.value,
                            })
                        }
                        placeholder="Phone Number"
                    />
                    <button className="edit-btn" onClick={saveRestaurant}>
                        Save
                    </button>
                    <button className="delete-btn" onClick={() => setEditingRestaurant(null)}>
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
