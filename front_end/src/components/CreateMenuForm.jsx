import { useState } from "react";
import { restaurantApi } from "../api/restaurantApi";

const CreateMenuForm = ({ newMenu, setNewMenu, restaurants, onCreate }) => {
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleCreateMenu = async () => {
        if (!newMenu.category || !newMenu.restaurantId) {
            setError("Моля, попълнете всички полета.");
            return;
        }
        
        setIsSubmitting(true);
        setError("");
        setSuccessMessage("");
        
        try {
            // Format menu data for API
            const formattedMenu = {
                category: newMenu.category,
                restaurantId: Number(newMenu.restaurantId)
            };
            
            // Use restaurantApi instead of the old API
            await restaurantApi.createMenu(formattedMenu.restaurantId, formattedMenu);
            
            setSuccessMessage("Менюто беше създадено успешно!");
            setNewMenu({ category: "", restaurantId: "" }); // Clear the form
            
            // If there's an onCreate callback, call it
            if (onCreate) {
                onCreate(formattedMenu);
            }
            
        } catch (err) {
            console.error("Error creating menu:", err);
            setError(err.message || "Неуспешно създаване на меню.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-md mx-auto mt-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Създаване на Меню
            </h2>

            {/* Error message */}
            {error && (
                <div className="p-3 mb-4 text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-300 rounded-md">
                    {error}
                </div>
            )}

            {/* Success message */}
            {successMessage && (
                <div className="p-3 mb-4 text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-300 rounded-md">
                    {successMessage}
                </div>
            )}

            {/* Поле за категория */}
            <label htmlFor="menuCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Категория:
            </label>
            <input
                id="menuCategory"
                type="text"
                value={newMenu.category}
                onChange={(e) => setNewMenu({ ...newMenu, category: e.target.value })}
                placeholder="Пример: Десерти, Напитки..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
            />

            {/* Избор на ресторант */}
            <label htmlFor="restaurantSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Избери ресторант:
            </label>
            <select
                id="restaurantSelect"
                value={newMenu.restaurantId}
                onChange={(e) => setNewMenu({ ...newMenu, restaurantId: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
            >
                <option value="">-- Избери ресторант --</option>
                {restaurants.length > 0 ? (
                    restaurants.map((restaurant) => (
                        <option key={restaurant.id} value={restaurant.id}>
                            {restaurant.restorantName}
                        </option>
                    ))
                ) : (
                    <option disabled>Няма налични ресторанти</option>
                )}
            </select>

            {/* Бутон за създаване */}
            <button 
                onClick={handleCreateMenu} 
                disabled={!newMenu.category || !newMenu.restaurantId || isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? "Създаване..." : "Създай Меню"}
            </button>
        </section>
    );
};

export default CreateMenuForm;
