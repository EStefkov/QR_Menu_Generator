import { useState } from "react";

const CreateRestaurantForm = ({ onCreateRestaurant }) => {
    const [restaurantData, setRestaurantData] = useState({
        restorantName: "",
        phoneNumber: "",
        location: "",
        email: ""
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRestaurantData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!restaurantData.restorantName || !restaurantData.phoneNumber || !restaurantData.location || !restaurantData.email) {
            setError("Моля, попълнете всички полета!");
            return;
        }

        onCreateRestaurant(restaurantData);

        // Изчистваме формата
        setRestaurantData({ restorantName: "", phoneNumber: "", location: "", email: "" });
        setError("");
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-lg mx-auto mt-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Създай нов ресторант</h2>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Име на ресторанта:</label>
            <input
                type="text"
                name="restorantName"
                value={restaurantData.restorantName}
                onChange={handleChange}
                placeholder="Въведете име"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
            />

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Телефонен номер:</label>
            <input
                type="text"
                name="phoneNumber"
                value={restaurantData.phoneNumber}
                onChange={handleChange}
                placeholder="+359..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
            />

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Локация:</label>
            <input
                type="text"
                name="location"
                value={restaurantData.location}
                onChange={handleChange}
                placeholder="Адрес на ресторанта"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
            />

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Имейл:</label>
            <input
                type="email"
                name="email"
                value={restaurantData.email}
                onChange={handleChange}
                placeholder="example@restaurant.com"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
            />

            <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition"
            >
                Създай ресторант
            </button>
        </form>
    );
};

export default CreateRestaurantForm;
