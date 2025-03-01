import { useState } from "react";

const EditAccountForm = ({ account, onSave, onCancel }) => {
    const [editedAccount, setEditedAccount] = useState(account);

    // Всички възможни типове акаунти
    const accountTypes = ["ROLE_ADMIN", "ROLE_USER", "ROLE_WAITER"];

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-md mx-auto mt-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Редакция на акаунт
            </h3>

            {/* Поле за име */}
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Първо име:
            </label>
            <input
                id="firstName"
                type="text"
                value={editedAccount.firstName || ""}
                onChange={(e) => setEditedAccount({ ...editedAccount, firstName: e.target.value })}
                placeholder="Въведете първо име"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
            />

            {/* Поле за фамилия */}
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Фамилия:
            </label>
            <input
                id="lastName"
                type="text"
                value={editedAccount.lastName || ""}
                onChange={(e) => setEditedAccount({ ...editedAccount, lastName: e.target.value })}
                placeholder="Въведете фамилия"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
            />

            {/* Поле за имейл */}
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Имейл:
            </label>
            <input
                id="email"
                type="email"
                value={editedAccount.mailAddress || ""}
                onChange={(e) => setEditedAccount({ ...editedAccount, mailAddress: e.target.value })}
                placeholder="Въведете имейл"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
            />

            {/* Падащо меню за тип на акаунта */}
            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Тип на акаунта:
            </label>
            <select
                id="accountType"
                value={editedAccount.accountType || ""}
                onChange={(e) => setEditedAccount({ ...editedAccount, accountType: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
            >
                {accountTypes.map((type) => (
                    <option key={type} value={type}>
                        {type}
                    </option>
                ))}
            </select>

            {/* Бутоните */}
            <div className="flex space-x-3">
                <button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md transition"
                    onClick={() => onSave(editedAccount)}
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

export default EditAccountForm;
