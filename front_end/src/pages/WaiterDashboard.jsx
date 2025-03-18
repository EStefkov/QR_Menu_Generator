const WaiterDashboard = () => {
    const logout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    return (
        <div className="dashboard-container">
            <h1>Welcome, Waiter!</h1>
            <p>Manage orders, view menus, and assist restaurant operations.</p>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default WaiterDashboard;
