import { useState, useMemo } from 'react';

const AccountsTable = ({ accounts, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [accountTypeFilter, setAccountTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filter accounts based on search term and account type
    const filteredAccounts = useMemo(() => {
        return accounts.filter(account => {
            const matchesSearch = 
                account.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.mailAddress.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesType = accountTypeFilter === 'all' || account.accountType === accountTypeFilter;
            
            return matchesSearch && matchesType;
        });
    }, [accounts, searchTerm, accountTypeFilter]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + itemsPerPage);

    return (
        <section className="p-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Акаунти</h2>
                
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 md:flex-none">
                        <input
                            type="text"
                            placeholder="Търсене..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                        />
                        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Account Type Filter */}
                    <select
                        value={accountTypeFilter}
                        onChange={(e) => setAccountTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                    >
                        <option value="all">Всички типове</option>
                        <option value="ROLE_ADMIN">Администратор</option>
                        <option value="ROLE_USER">Потребител</option>
                    </select>

                    {/* Items Per Page Selector */}
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                    >
                        <option value={5}>5 на страница</option>
                        <option value={10}>10 на страница</option>
                        <option value={20}>20 на страница</option>
                        <option value={50}>50 на страница</option>
                    </select>
                </div>
            </div>
            
            {paginatedAccounts.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                                    <th className="p-4 text-left text-sm font-semibold">ID</th>
                                    <th className="p-4 text-left text-sm font-semibold">Име</th>
                                    <th className="p-4 text-left text-sm font-semibold">Имейл</th>
                                    <th className="p-4 text-left text-sm font-semibold">Тип</th>
                                    <th className="p-4 text-left text-sm font-semibold">Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAccounts.map((account) => (
                                    <tr key={account.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                                        <td className="p-4 text-gray-700 dark:text-gray-300">{account.id}</td>
                                        <td className="p-4 text-gray-700 dark:text-gray-300">{account.firstName} {account.lastName}</td>
                                        <td className="p-4 text-gray-700 dark:text-gray-300">{account.mailAddress}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                account.accountType === "ROLE_ADMIN" 
                                                    ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                                                    : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                            }`}>
                                                {account.accountType}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                <button 
                                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                                                    onClick={() => onEdit(account)}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Редактирай
                                                </button>
                                                <button 
                                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                                                    onClick={() => onDelete(account.id)}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Изтрий
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 px-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Показване на {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAccounts.length)} от {filteredAccounts.length} акаунта
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <span className="px-3 py-1 text-gray-700 dark:text-gray-300">
                                Страница {currentPage} от {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Няма намерени акаунти.</p>
                </div>
            )}
        </section>
    );
};

export default AccountsTable;
