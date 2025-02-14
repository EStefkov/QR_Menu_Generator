import { useState } from "react";

const CreateMenuForm = ({ newMenu, setNewMenu, restaurants, onCreate }) => {
    const [error, setError] = useState("");

    const handleCreateMenu = () => {
        if (!newMenu.category || !newMenu.restorantId) {
            setError("Please fill in all fields.");
            return;
        }
        onCreate(newMenu);
        setNewMenu({ category: "", restorantId: "" }); // Изчистване на формата
        setError("");
    };

    return (
        <section>
            <h2>Create Menu</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <input 
                type="text" 
                value={newMenu.category} 
                onChange={(e) => setNewMenu({ ...newMenu, category: e.target.value })} 
                placeholder="Category" 
            />
            <select 
                value={newMenu.restorantId} 
                onChange={(e) => setNewMenu({ ...newMenu, restorantId: e.target.value })}
            >
                <option value="">Select a Restaurant</option>
                {restaurants.length > 0 ? (
                    restaurants.map((restaurant) => (
                        <option key={restaurant.id} value={restaurant.id}>{restaurant.restorantName}</option>
                    ))
                ) : (
                    <option disabled>No restaurants available</option>
                )}
            </select>
            <button onClick={handleCreateMenu} disabled={!newMenu.category || !newMenu.restorantId}>
                Create Menu
            </button>
        </section>
    );
};

export default CreateMenuForm;
