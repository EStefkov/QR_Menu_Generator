import { useEffect, useState } from "react";
import "../styles/AdminDashboard.css";
import "../styles/Table.css";
import "../styles/Form.css"

const AdminDashboard = () => {
    const [accounts, setAccounts] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingAccount, setEditingAccount] = useState(null);
    const [editingRestaurant, setEditingRestaurant] = useState(null);

    // Fetch accounts and restaurants on component mount
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("No token found. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const accountsResponse = await fetch("http://localhost:8080/api/accounts", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!accountsResponse.ok) {
                    throw new Error(`Failed to fetch accounts: ${accountsResponse.status}`);
                }

                const restaurantsResponse = await fetch("http://localhost:8080/api/restaurants", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!restaurantsResponse.ok) {
                    throw new Error(`Failed to fetch restaurants: ${restaurantsResponse.status}`);
                }

                const accountsData = await accountsResponse.json();
                const restaurantsData = await restaurantsResponse.json();

                setAccounts(accountsData);
                setRestaurants(restaurantsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Delete Account
    const deleteAccount = async (id) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:8080/api/accounts/delete/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                setAccounts(accounts.filter((account) => account.id !== id));
                alert("Account deleted successfully");
            } else {
                const errorText = await response.text();
                alert(`Failed to delete account: ${errorText}`);
            }
        } catch (error) {
            console.error("Error deleting account:", error);
        }
    };

    // Save Account Changes
    const saveAccount = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:8080/api/accounts/update/${editingAccount.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editingAccount),
            });

            if (response.ok) {
                setAccounts((prevAccounts) =>
                    prevAccounts.map((account) =>
                        account.id === editingAccount.id ? editingAccount : account
                    )
                );
                setEditingAccount(null);
                alert("Account updated successfully");
            } else {
                const errorText = await response.text();
                alert(`Failed to update account: ${errorText}`);
            }
        } catch (error) {
            console.error("Error updating account:", error);
        }
    };

    // Delete Restaurant
    const deleteRestaurant = async (id) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:8080/api/restaurants/delete/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                setRestaurants(restaurants.filter((restaurant) => restaurant.id !== id));
                alert("Restaurant deleted successfully");
            } else {
                const errorText = await response.text();
                alert(`Failed to delete restaurant: ${errorText}`);
            }
        } catch (error) {
            console.error("Error deleting restaurant:", error);
        }
    };

    // Save Restaurant Changes
    const saveRestaurant = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:8080/api/restaurants/${editingRestaurant.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editingRestaurant),
            });

            if (response.ok) {
                setRestaurants((prevRestaurants) =>
                    prevRestaurants.map((restaurant) =>
                        restaurant.id === editingRestaurant.id ? editingRestaurant : restaurant
                    )
                );
                setEditingRestaurant(null);
                alert("Restaurant updated successfully");
            } else {
                const errorText = await response.text();
                alert(`Failed to update restaurant: ${errorText}`);
            }
        } catch (error) {
            console.error("Error updating restaurant:", error);
        }
    };

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
                                <td className="table-actions">
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
                ) : (
                    <p>No accounts available.</p>
                )}
            </section>

            {/* Restaurants Table */}
            <section>
                <h2>Restaurants</h2>
                {restaurants.length > 0 ? (
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
                                <td className="table-actions">
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
                ) : (
                    <p>No restaurants available.</p>
                )}
            </section>

            {/* Edit Account Form */}
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
                    <button className="edit-btn" onClick={saveAccount}>Save</button>
                    <button className="delete-btn" onClick={() => setEditingAccount(null)}>Cancel</button>
                </div>
            )}

            {/* Edit Restaurant Form */}
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
                    <button className="edit-btn" onClick={saveRestaurant}>Save</button>
                    <button className="delete-btn" onClick={() => setEditingRestaurant(null)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
