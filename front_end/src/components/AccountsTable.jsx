import { useState, useMemo } from 'react';
import { HiPhotograph, HiCheckCircle, HiExclamationCircle, HiX } from 'react-icons/hi';
import { profileApi } from '../api/profileApi';
import { uploadProfilePicture } from '../api/adminDashboard';

const AccountsTable = ({ accounts = [], onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [accountTypeFilter, setAccountTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editAccount, setEditAccount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Filter accounts based on search term and account type
    const filteredAccounts = useMemo(() => {
        if (!Array.isArray(accounts)) return [];
        
        return accounts.filter(account => {
            if (!account) return false;
            
            const searchTermLower = searchTerm.toLowerCase();
            const firstName = account.firstName?.toLowerCase() || '';
            const lastName = account.lastName?.toLowerCase() || '';
            const email = account.mailAddress?.toLowerCase() || '';
            
            const matchesSearch = 
                firstName.includes(searchTermLower) ||
                lastName.includes(searchTermLower) ||
                email.includes(searchTermLower);
            
            const matchesType = accountTypeFilter === 'all' || account.accountType === accountTypeFilter;
            
            return matchesSearch && matchesType;
        });
    }, [accounts, searchTerm, accountTypeFilter]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + itemsPerPage);

    const handleEditClick = (account) => {
        setEditAccount({
            ...account,
            firstName: account.firstName || '',
            lastName: account.lastName || '',
            email: account.mailAddress || '',
            accountType: account.accountType || 'ROLE_USER',
            profilePicture: account.profilePicture || '',
        });
        setImagePreview(account.profilePicture || null);
        setShowEditModal(true);
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
        setEditAccount(null);
        setMessage({ type: '', text: '' });
        setProfileImage(null);
        setImagePreview(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditAccount(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAccountTypeChange = (e) => {
        setEditAccount(prev => ({
            ...prev,
            accountType: e.target.value
        }));
    };

    const handleSaveAccount = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const accountToUpdate = {
                id: editAccount.id,
                firstName: editAccount.firstName,
                lastName: editAccount.lastName,
                mailAddress: editAccount.email,
                accountType: editAccount.accountType
            };

            await profileApi.updateUserProfile(accountToUpdate);

            // Проверяваме дали редактираме собствения акаунт
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const currentUserId = localStorage.getItem('id') || localStorage.getItem('userId');
            
            if (currentUserId && currentUserId == editAccount.id) {
                console.log('Updating current user data in localStorage');
                localStorage.setItem("firstName", accountToUpdate.firstName);
                localStorage.setItem("lastName", accountToUpdate.lastName);
                localStorage.setItem("mailAddress", accountToUpdate.mailAddress);
                
                // Обновяваме UI без да пращаме storage събитие
                window.dispatchEvent(new Event("userDataUpdated"));
            }

            // If the original onEdit function exists, call it
            if (onEdit) {
                onEdit(accountToUpdate);
            }

            setMessage({
                type: 'success',
                text: 'Акаунтът е обновен успешно'
            });

            setTimeout(() => {
                handleCloseModal();
                // Не релоудваме страницата, за да не излизаме от акаунта
                // window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Error updating account:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Грешка при обновяване на акаунта'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        if (!file.type.match('image.*')) {
            setMessage({
                type: 'error',
                text: 'Моля, изберете изображение (JPG, PNG, GIF)'
            });
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage({
                type: 'error',
                text: 'Изображението трябва да бъде по-малко от 5MB'
            });
            return;
        }

        setProfileImage(file);
        
        // Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUploadImage = async () => {
        if (!profileImage || !editAccount) return;

        setUploadingImage(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            await uploadProfilePicture(token, profileImage, editAccount.id);
            
            setMessage({
                type: 'success',
                text: 'Профилната снимка е качена успешно'
            });
            
            // Update local state
            setEditAccount(prev => ({
                ...prev,
                profilePicture: URL.createObjectURL(profileImage)
            }));
            
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Грешка при качване на профилната снимка'
            });
        } finally {
            setUploadingImage(false);
        }
    };

    if (!Array.isArray(accounts)) {
        return (
            <div className="text-center py-8 text-red-600">
                <p>Error: Invalid accounts data</p>
            </div>
        );
    }

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
                                                    onClick={() => handleEditClick(account)}
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

            {/* Edit Account Modal */}
            {showEditModal && editAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Редактиране на акаунт
                            </h3>
                            <button 
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <HiX className="w-6 h-6" />
                            </button>
                        </div>

                        {message.text && (
                            <div className={`p-4 mb-6 rounded-lg flex items-center ${
                                message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 
                                'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                            }`}>
                                {message.type === 'success' ? 
                                <HiCheckCircle className="w-5 h-5 mr-2" /> : 
                                <HiExclamationCircle className="w-5 h-5 mr-2" />
                                }
                                {message.text}
                            </div>
                        )}

                        {/* Profile Picture */}
                        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Профилна снимка</h4>
                            
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                {/* Preview */}
                                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                                    {imagePreview ? (
                                        <img 
                                            src={imagePreview} 
                                            alt="Profile Preview" 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <HiPhotograph className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                                    )}
                                </div>
                                
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label 
                                            htmlFor="profilePicture" 
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                        >
                                            Избери нова снимка
                                        </label>
                                        <input
                                            type="file"
                                            id="profilePicture"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900 dark:file:text-blue-200 hover:file:bg-blue-100 dark:hover:file:bg-blue-800 cursor-pointer"
                                        />
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            JPG, PNG или GIF (макс. 5MB)
                                        </p>
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={handleUploadImage}
                                        disabled={!profileImage || uploadingImage}
                                        className={`px-4 py-2 rounded-lg font-medium ${
                                            !profileImage || uploadingImage
                                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        } transition-colors`}
                                    >
                                        {uploadingImage ? 'Качване...' : 'Качи снимка'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSaveAccount} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Account ID */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        ID Акаунт
                                    </label>
                                    <input 
                                        type="text" 
                                        value={editAccount.id}
                                        disabled
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white transition cursor-not-allowed"
                                    />
                                </div>

                                {/* First Name */}
                                <div>
                                    <label 
                                        htmlFor="firstName" 
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Име
                                    </label>
                                    <input 
                                        type="text" 
                                        id="firstName" 
                                        name="firstName" 
                                        value={editAccount.firstName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        required
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label 
                                        htmlFor="lastName" 
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Фамилия
                                    </label>
                                    <input 
                                        type="text" 
                                        id="lastName" 
                                        name="lastName" 
                                        value={editAccount.lastName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label 
                                        htmlFor="email" 
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Имейл
                                    </label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email" 
                                        value={editAccount.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        required
                                    />
                                </div>

                                {/* Account Type */}
                                <div>
                                    <label 
                                        htmlFor="accountType" 
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Тип акаунт
                                    </label>
                                    <select
                                        id="accountType"
                                        value={editAccount.accountType}
                                        onChange={handleAccountTypeChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    >
                                        <option value="ROLE_USER">Потребител</option>
                                        <option value="ROLE_ADMIN">Администратор</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
                                >
                                    Отказ
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors ${
                                        loading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {loading ? 'Запазване...' : 'Запази промените'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AccountsTable;
