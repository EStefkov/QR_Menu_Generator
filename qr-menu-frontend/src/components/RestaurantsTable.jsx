import "../styles/AdminDashboard.css";
const RestaurantsTable = ({ restaurants, onEdit, onDelete, onFetchMenus, menus, onFetchQRCode, token }) => {
    
    const handleFetchQRCode = (menuId) => {
        if (!menuId) {
            console.error("Invalid menu ID:", menuId);
            return;
        }
        onFetchQRCode(token, menuId);
    };

    return (
        <section>
            <h2>Restaurants</h2>
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
                                <button className="edit-btn" onClick={() => onEdit(restaurant)}>Edit</button>
                                <button className="delete-btn" onClick={() => onDelete(restaurant.id)}>Delete</button>
                                
                                {restaurant.id ? (
                                    <button className="fetch-menus-btn" onClick={() => onFetchMenus(restaurant.id)}>
                                        Load Menus
                                    </button>
                                ) : (
                                    <p style={{ color: "red" }}>Invalid Restaurant ID</p>
                                )}

                                {menus[restaurant.id] && menus[restaurant.id].length > 0 && (
                                    <select onChange={(e) => handleFetchQRCode(e.target.value)}>
                                        <option value="">Select a Menu</option>
                                        {menus[restaurant.id].map((menu) => (
                                            <option key={menu.id} value={menu.id}>{menu.category}</option>
                                        ))}
                                    </select>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

export default RestaurantsTable;
