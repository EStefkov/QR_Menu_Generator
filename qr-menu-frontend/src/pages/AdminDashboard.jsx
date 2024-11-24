import { useEffect, useState } from "react";

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
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!accountsResponse.ok) {
                    throw new Error(`Failed to fetch accounts: ${accountsResponse.status}`);
                }

                const restaurantsResponse = await fetch("http://localhost:8080/api/restaurants", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
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

    // Handle account deletion
    const deleteAccount = async (id) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:8080/api/accounts/delete/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                alert("Account deleted successfully");
                setAccounts(accounts.filter((account) => account.id !== id));
            } else {
                alert("Failed to delete account");
            }
        } catch (error) {
            console.error("Error deleting account:", error);
        }
    };

    // Handle editing accounts
    const handleEditAccount = (account) => {
        setEditingAccount(account);
    };

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
                alert("Account updated successfully");
                setAccounts((prev) =>
                    prev.map((acc) => (acc.id === editingAccount.id ? editingAccount : acc))
                );
                setEditingAccount(null);
            } else {
                alert("Failed to update account");
            }
        } catch (error) {
            console.error("Error updating account:", error);
        }
    };

    // Handle restaurant deletion
    const deleteRestaurant = async (id) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:8080/api/restaurants/delete/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                alert("Restaurant deleted successfully");
                setRestaurants(restaurants.filter((restaurant) => restaurant.id !== id));
            } else {
                alert("Failed to delete restaurant");
            }
        } catch (error) {
            console.error("Error deleting restaurant:", error);
        }
    };

    // Handle editing restaurants
    const handleEditRestaurant = (restaurant) => {
        setEditingRestaurant(restaurant);
    };

    const saveRestaurant = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:8080/api/restaurants/update/${editingRestaurant.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editingRestaurant),
            });

            if (response.ok) {
                alert("Restaurant updated successfully");
                setRestaurants((prev) =>
                    prev.map((res) => (res.id === editingRestaurant.id ? editingRestaurant : res))
                );
                setEditingRestaurant(null);
            } else {
                alert("Failed to update restaurant");
            }
        } catch (error) {
            console.error("Error updating restaurant:", error);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="dashboard-container">
            <h1>Admin Dashboard</h1>
            <p>Manage accounts and restaurants</p>

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
                                <td>
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEditAccount(account.id)}
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
                                        onClick={() => handleEditRestaurant(restaurant.id)}
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

            {/* Editing forms */}
            {editingAccount && (
                <div>
                <h3>Edit Account</h3>
                    <input
                        type="text"
                        value={editingAccount.firstName}
                        onChange={(e) => setEditingAccount({ ...editingAccount, firstName: e.target.value })}
                        placeholder="First Name"
                    />
                    <input
                        type="text"
                        value={editingAccount.lastName}
                        onChange={(e) => setEditingAccount({ ...editingAccount, lastName: e.target.value })}
                        placeholder="Last Name"
                    />
                    <input
                        type="text"
                        value={editingAccount.mailAddress}
                        onChange={(e) => setEditingAccount({ ...editingAccount, mailAddress: e.target.value })}
                        placeholder="Email"
                    />
                    <button onClick={saveAccount}>Save</button>
                    <button onClick={() => setEditingAccount(null)}>Cancel</button>
                </div>
            )}

            {editingRestaurant && (
                <div>
                    <h3>Edit Restaurant</h3>
                    <input
                        type="text"
                        value={editingRestaurant.restorantName}
                        onChange={(e) => setEditingRestaurant({ ...editingRestaurant, restorantName: e.target.value })}
                        placeholder="Restaurant Name"
                    />
                    <input
                        type="text"
                        value={editingRestaurant.phoneNumber}
                        onChange={(e) => setEditingRestaurant({ ...editingRestaurant, phoneNumber: e.target.value })}
                        placeholder="Phone Number"
                    />
                    <button onClick={saveRestaurant}>Save</button>
                    <button onClick={() => setEditingRestaurant(null)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
