const AccountsTable = ({ accounts, onEdit, onDelete }) => {
    return (
        <section className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Акаунти</h2>
            
            {accounts.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
                                <th className="p-3 text-left">ID</th>
                                <th className="p-3 text-left">Име</th>
                                <th className="p-3 text-left">Имейл</th>
                                <th className="p-3 text-left">Тип</th>
                                <th className="p-3 text-left">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map((account) => (
                                <tr key={account.id} className="border-b border-gray-300 dark:border-gray-600">
                                    <td className="p-3">{account.id}</td>
                                    <td className="p-3">{account.firstName} {account.lastName}</td>
                                    <td className="p-3">{account.mailAddress}</td>
                                    {/* Вече няма select, а само текст */}
                                    <td className="p-3 font-medium text-gray-800 dark:text-gray-300">
                                        {account.accountType}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-2">
                                            <button 
                                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
                                                onClick={() => onEdit(account)}
                                            >
                                                Редактирай
                                            </button>
                                            <button 
                                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
                                                onClick={() => onDelete(account.id)}
                                            >
                                                Изтрий
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-300">Няма намерени акаунти.</p>
            )}
        </section>
    );
};

export default AccountsTable;
