import React, { useState, useEffect } from "react";

/**
 * @param {Array} restaurants - списък с ресторанти [{id, name, ...}]
 * @param {Function} fetchMenusByRestaurantId - функция, която (по подаден restaurantId)
 *        връща Promise с масив от менюта [{id, category, ...}]
 * @param {Function} onCreateCategory - функция, която приема { name, menuId }
 *        и създава категория (POST заявка).
 */
function CreateCategoryForm({
                                restaurants,
                                fetchMenusByRestaurantId,
                                onCreateCategory
                            }) {
    const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
    const [menusForRestaurant, setMenusForRestaurant] = useState([]);
    const [selectedMenuId, setSelectedMenuId] = useState("");
    const [categoryName, setCategoryName] = useState("");

    // Всеки път, когато потребителят смени ресторанта в select-а,
    // зареждаме менютата само за този ресторант.
    useEffect(() => {
        if (selectedRestaurantId) {
            fetchMenusByRestaurantId(selectedRestaurantId)
                .then((menus) => {
                    setMenusForRestaurant(menus);
                    setSelectedMenuId(""); // нулираме избраното меню, ако сменим ресторанта
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
            name: categoryName, // име на категорията
            menuId: selectedMenuId // кое меню да получи тази категория
        });

        // След създаване — нулираме полетата:
        setCategoryName("");
        setSelectedRestaurantId("");
        setSelectedMenuId("");
        setMenusForRestaurant([]);
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
            <h3>Създаване на категория</h3>

            {/* 1. Избор на ресторант */}
            <label htmlFor="restaurantSelect">Ресторант:</label>
            <select
                id="restaurantSelect"
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
            >
                <option value="">-- Изберете ресторант --</option>
                {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                        {r.name} (ID: {r.id})
                    </option>
                ))}
            </select>

            {/* 2. Избор на меню — появява се (или е активно) само ако сме избрали ресторант */}
            {menusForRestaurant.length > 0 && (
                <>
                    <label htmlFor="menuSelect">Меню:</label>
                    <select
                        id="menuSelect"
                        value={selectedMenuId}
                        onChange={(e) => setSelectedMenuId(e.target.value)}
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

            {/* 3. Име на категория */}
            <label htmlFor="categoryName">Име на категория:</label>
            <input
                id="categoryName"
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="DRINKS, STARTERS, MAIN DISHES..."
            />

            {/* 4. Бутон за създаване */}
            <button type="submit">Създай категория</button>
        </form>
    );
}

export default CreateCategoryForm;
