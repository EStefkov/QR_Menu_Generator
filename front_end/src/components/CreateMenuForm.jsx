import { useState } from "react";

const CreateMenuForm = ({ newMenu, setNewMenu, restaurants, onCreate }) => {
    const [error, setError] = useState("");

    const handleCreateMenu = () => {
        if (!newMenu.category || !newMenu.restorantId) {
            setError("Моля, попълнете всички полета.");
            return;
        }
        onCreate(newMenu);
        setNewMenu({ category: "", restorantId: "" }); // Изчистване на формата
        setError("");
    };

    return (
        <section className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-md mx-auto mt-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Създаване на Меню
            </h2>

            {/* Грешка */}
            {error && <p className="text-red-500 mb-2">{error}</p>}

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
                value={newMenu.restorantId}
                onChange={(e) => setNewMenu({ ...newMenu, restorantId: e.target.value })}
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
                disabled={!newMenu.category || !newMenu.restorantId}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Създай Меню
            </button>
        </section>
    );
};

export default CreateMenuForm;
