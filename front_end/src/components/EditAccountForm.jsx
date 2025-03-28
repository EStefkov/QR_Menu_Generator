import { useState,useContext } from "react";
import { updateAccountApi, uploadProfilePicture } from "../api/adminDashboard";
import { AuthContext } from "../contexts/AuthContext";

const EditAccountForm = ({ account, onSave, onCancel, token }) => {
    const [editedAccount, setEditedAccount] = useState(account);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
// Взимаме userData, за да знаем кой е логнат
const { userData } = useContext(AuthContext);

    const accountTypes = ["ROLE_ADMIN", "ROLE_USER", "ROLE_WAITER"];

    const handleSave = async () => {
        setIsLoading(true);
        try {
            let accountToUpdate = { ...editedAccount };

            if (selectedFile) {
                const newFileName = await uploadProfilePicture(token, selectedFile, editedAccount.id);
                accountToUpdate.profilePicture = newFileName;
            } else {
                delete accountToUpdate.profilePicture;
            }

            await updateAccountApi(token, editedAccount.id, accountToUpdate);

            // === ДОБАВЯМЕ ПРОВЕРКА ===
            if (userData?.id === editedAccount.id) {
                // Значи редактираме собствения акаунт, затова ъпдейтваме localStorage
                localStorage.setItem("profilePicture", accountToUpdate.profilePicture || editedAccount.profilePicture);
                localStorage.setItem("firstName", accountToUpdate.firstName);
                localStorage.setItem("lastName", accountToUpdate.lastName);
                localStorage.setItem("accountType", accountToUpdate.accountType);

                // Пускаме събития, за да се обнови NavBar
                window.dispatchEvent(new Event("storage"));
                window.dispatchEvent(new Event("userDataUpdated"));
            }

            // Викаме onSave, за да обновим таблицата с акаунти
            onSave(accountToUpdate);
            setIsLoading(false);

        } catch (error) {
            console.error("Error saving account:", error);
            alert("Възникна грешка при запазване на профилната снимка или данните.");
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-md mx-auto mt-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Редакция на акаунт</h3>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Първо име:</label>
            <input
                id="firstName"
                type="text"
                value={editedAccount.firstName || ""}
                onChange={(e) => setEditedAccount({ ...editedAccount, firstName: e.target.value })}
                className="w-full p-2 border rounded-md mb-3"
            />
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Фамилия:</label>
            <input
                id="lastName"
                type="text"
                value={editedAccount.lastName || ""}
                onChange={(e) => setEditedAccount({ ...editedAccount, lastName: e.target.value })}
                className="w-full p-2 border rounded-md mb-3"
            />
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Имейл:</label>
            <input
                id="email"
                type="email"
                value={editedAccount.mailAddress || ""}
                onChange={(e) => setEditedAccount({ ...editedAccount, mailAddress: e.target.value })}
                className="w-full p-2 border rounded-md mb-3"
            />
            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Тип на акаунта:</label>
            <select
                id="accountType"
                value={editedAccount.accountType || ""}
                onChange={(e) => setEditedAccount({ ...editedAccount, accountType: e.target.value })}
                className="w-full p-2 border rounded-md mb-4"
            >
                {accountTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
            <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Профилна снимка:</label>
            <input id="profilePicture" type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="mb-4" />
            <div className="flex space-x-3">
                <button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md disabled:bg-gray-400"
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? "Запазване..." : "Запази"}
                </button>
                <button
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-md"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Отказ
                </button>
            </div>
        </div>
    );
};

export default EditAccountForm;