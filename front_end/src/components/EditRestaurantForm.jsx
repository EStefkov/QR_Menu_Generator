import { useState } from "react";

const EditRestaurantForm = ({ restaurant, onSave, onCancel }) => {
    const [editedRestaurant, setEditedRestaurant] = useState(restaurant);

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-md mx-auto mt-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Редакция на ресторант
            </h3>

            {/* Поле за име на ресторанта */}
            <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Име на ресторанта:
            </label>
            <input
                id="restaurantName"
                type="text"
                value={editedRestaurant.restorantName || ""}
                onChange={(e) => setEditedRestaurant({ ...editedRestaurant, restorantName: e.target.value })}
                placeholder="Въведете име"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
            />

            {/* Поле за телефонен номер */}
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Телефонен номер:
            </label>
            <input
                id="phoneNumber"
                type="text"
                value={editedRestaurant.phoneNumber || ""}
                onChange={(e) => setEditedRestaurant({ ...editedRestaurant, phoneNumber: e.target.value })}
                placeholder="Въведете телефонен номер"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
            />

            {/* Бутоните */}
            <div className="flex space-x-3">
                <button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md transition"
                    onClick={() => onSave(editedRestaurant)}
                >
                    Запази
                </button>
                <button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-md transition"
                    onClick={onCancel}
                >
                    Отказ
                </button>
            </div>
        </div>
    );
};

export default EditRestaurantForm;
