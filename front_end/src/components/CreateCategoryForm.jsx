import React, { useState, useEffect } from "react";

function CreateCategoryForm({
    restaurants,
    fetchMenusByRestaurantId,
    onCreateCategory
}) {
    const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
    const [menusForRestaurant, setMenusForRestaurant] = useState([]);
    const [selectedMenuId, setSelectedMenuId] = useState("");
    const [categoryName, setCategoryName] = useState("");

    useEffect(() => {
        if (selectedRestaurantId) {
            fetchMenusByRestaurantId(selectedRestaurantId)
                .then((menus) => {
                    setMenusForRestaurant(menus);
                    setSelectedMenuId("");
                })
                .catch((err) => console.error("Error fetching menus:", err));
        } else {
            setMenusForRestaurant([]);
            setSelectedMenuId("");
        }
    }, [selectedRestaurantId, fetchMenusByRestaurantId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedRestaurantId || !selectedMenuId || !categoryName) {
            alert("Моля, попълнете всички полета (ресторант, меню, име на категория).");
            return;
        }

        onCreateCategory({
            name: categoryName,
            menuId: selectedMenuId
        });

        setCategoryName("");
        setSelectedRestaurantId("");
        setSelectedMenuId("");
        setMenusForRestaurant([]);
    };

    return (
        <form 
            onSubmit={handleSubmit} 
            className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-md mx-auto mt-6"
        >
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Създаване на категория
            </h3>

            {/* Избор на ресторант */}
            <label htmlFor="restaurantSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ресторант:
            </label>
            <select
                id="restaurantSelect"
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
            >
                <option value="">-- Изберете ресторант --</option>
                {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                        {r.name} (ID: {r.id})
                    </option>
                ))}
            </select>

            {/* Избор на меню (ако има налични менюта) */}
            {menusForRestaurant.length > 0 && (
                <>
                    <label htmlFor="menuSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Меню:
                    </label>
                    <select
                        id="menuSelect"
                        value={selectedMenuId}
                        onChange={(e) => setSelectedMenuId(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
                    >
                        <option value="">-- Изберете меню --</option>
                        {menusForRestaurant.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.category} (ID: {m.id})
                            </option>
                        ))}
                    </select>
                </>
            )}

            {/* Поле за име на категория */}
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Име на категория:
            </label>
            <input
                id="categoryName"
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="DRINKS, STARTERS, MAIN DISHES..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
            />

            {/* Бутон за създаване */}
            <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition"
            >
                Създай категория
            </button>
        </form>
    );
}

export default CreateCategoryForm;
