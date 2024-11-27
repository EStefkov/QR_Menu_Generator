import { useEffect, useState } from "react";
import "../styles/AdminDashboard.css";
import "../styles/Table.css";
import "../styles/Form.css";

const AdminDashboard = () => {
    const [accounts, setAccounts] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingAccount, setEditingAccount] = useState(null);
    const [editingRestaurant, setEditingRestaurant] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(4); // Fixed size for both tables

    const token = localStorage.getItem("token");

    // Fetch paginated accounts
    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:8080/api/accounts/paged?page=${currentPage}&size=${pageSize}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!response.ok) throw new Error("Failed to fetch accounts");
            const data = await response.json();
            setAccounts(data.content);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch paginated restaurants
    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:8080/api/restaurants/paged?page=${currentPage}&size=${pageSize}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!response.ok) throw new Error("Failed to fetch restaurants");
            const data = await response.json();
            setRestaurants(data.content);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch both tables on page load and page change
    useEffect(() => {
        if (token) {
            fetchAccounts();
            fetchRestaurants();
        } else {
            setError("No token found. Please log in.");
        }
    }, [currentPage, pageSize]);

    // Delete Account
    const deleteAccount = async (id) => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/accounts/delete/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!response.ok) throw new Error("Failed to delete account");
            setAccounts(accounts.filter((account) => account.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    // Save Account Changes
    const saveAccount = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/accounts/update/${editingAccount.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(editingAccount),
                }
            );
            if (!response.ok) throw new Error("Failed to update account");
            setAccounts((prev) =>
                prev.map((acc) => (acc.id === editingAccount.id ? editingAccount : acc))
            );
            setEditingAccount(null);
        } catch (err) {
            alert(err.message);
        }
    };

    // Delete Restaurant
    const deleteRestaurant = async (id) => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/restaurants/delete/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!response.ok) throw new Error("Failed to delete restaurant");
            setRestaurants(restaurants.filter((restaurant) => restaurant.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    // Save Restaurant Changes
    const saveRestaurant = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/restaurants/${editingRestaurant.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(editingRestaurant),
                }
            );
            if (!response.ok) throw new Error("Failed to update restaurant");
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

    // Pagination Handlers
    const handleNextPage = () => setCurrentPage((prev) => prev + 1);
    const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

    // UI Rendering
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="dashboard-container">
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

            {/* Edit Forms */}
            {editingAccount && (
                <div className="edit-form">
                    <h3>Edit Account</h3>
                    <input
                        type="text"
                        value={editingAccount.firstName || ""}
                        onChange={(e) =>
                            setEditingAccount({ ...editingAccount, firstName: e.target.value })
                        }
                        placeholder="First Name"
                    />
                    <input
                        type="text"
                        value={editingAccount.lastName || ""}
                        onChange={(e) =>
                            setEditingAccount({ ...editingAccount, lastName: e.target.value })
                        }
                        placeholder="Last Name"
                    />
                    <input
                        type="email"
                        value={editingAccount.mailAddress || ""}
                        onChange={(e) =>
                            setEditingAccount({ ...editingAccount, mailAddress: e.target.value })
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
