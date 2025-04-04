import { useState, useMemo } from 'react';
import { HiPhotograph, HiCheckCircle, HiExclamationCircle, HiX, HiRefresh, HiUserGroup } from 'react-icons/hi';
import { profileApi } from '../api/profileApi';
import { uploadProfilePicture } from '../api/adminDashboard';
import { useLanguage } from '../contexts/LanguageContext';

export const AccountsTable = ({ accounts = [], onEdit, onDelete }) => {
    const { t } = useLanguage();
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState(null);

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

            // Update user data if editing own account
            const currentUserId = localStorage.getItem('id') || localStorage.getItem('userId');
            
            if (currentUserId && currentUserId == editAccount.id) {
                console.log('Updating current user data in localStorage');
                localStorage.setItem("firstName", accountToUpdate.firstName);
                localStorage.setItem("lastName", accountToUpdate.lastName);
                localStorage.setItem("mailAddress", accountToUpdate.mailAddress);
                
                window.dispatchEvent(new Event("userDataUpdated"));
            }

            // If the original onEdit function exists, call it
            if (onEdit) {
                onEdit(accountToUpdate);
            }

            setMessage({
                type: 'success',
                text: t('accounts.updateSuccess') || 'Account updated successfully'
            });

            setTimeout(() => {
                handleCloseModal();
            }, 1500);
        } catch (error) {
            console.error('Error updating account:', error);
            setMessage({
                type: 'error',
                text: error.message || t('accounts.updateError') || 'Error updating account'
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
                text: t('accounts.imageTypeError') || 'Please select an image file (JPG, PNG, GIF)'
            });
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage({
                type: 'error',
                text: t('accounts.imageSizeError') || 'Image must be less than 5MB'
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
                text: t('accounts.imageUploadSuccess') || 'Profile picture uploaded successfully'
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
                text: error.message || t('accounts.imageUploadError') || 'Error uploading profile picture'
            });
        } finally {
            setUploadingImage(false);
        }
    };

    // Handle delete confirmation
    const handleDeleteAccount = (accountId) => {
        setAccountToDelete(accountId);
        setShowDeleteModal(true);
    };
    
    const confirmDeleteAccount = () => {
        if (onDelete && accountToDelete) {
            onDelete(accountToDelete);
        }
        setShowDeleteModal(false);
        setAccountToDelete(null);
    };
    
    const cancelDeleteAccount = () => {
        setShowDeleteModal(false);
        setAccountToDelete(null);
    };

    if (!Array.isArray(accounts)) {
        return (
            <div className="text-center py-8 text-red-600">
                <p>Error: Invalid accounts data</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {t('accounts.title') || 'Accounts Management'}
                </h3>
                
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 md:flex-none">
                        <input
                            type="text"
                            placeholder={t('accounts.search') || 'Search...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Account Type Filter */}
                    <select
                        value={accountTypeFilter}
                        onChange={(e) => setAccountTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                        <option value="all">{t('accounts.all') || 'All Types'}</option>
                        <option value="ROLE_ADMIN">{t('accounts.admin') || 'Administrator'}</option>
                        <option value="ROLE_USER">{t('accounts.user') || 'User'}</option>
                    </select>

                    {/* Items Per Page Selector */}
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                        <option value={5}>5 {t('accounts.perPage') || 'per page'}</option>
                        <option value={10}>10 {t('accounts.perPage') || 'per page'}</option>
                        <option value={20}>20 {t('accounts.perPage') || 'per page'}</option>
                        <option value={50}>50 {t('accounts.perPage') || 'per page'}</option>
                    </select>
                </div>
            </div>
            
            {paginatedAccounts.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {t('accounts.id') || 'ID'}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {t('accounts.name') || 'Name'}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {t('accounts.email') || 'Email'}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {t('accounts.type') || 'Type'}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {t('accounts.actions') || 'Actions'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedAccounts.map((account) => (
                                    <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {account.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {account.firstName} {account.lastName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {account.mailAddress}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                account.accountType === "ROLE_ADMIN" 
                                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                            }`}>
                                                {account.accountType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex flex-wrap items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleEditClick(account)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    {t('accounts.edit') || 'Edit'}
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteAccount(account.id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    {t('accounts.delete') || 'Delete'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination - Using the same style as other tables */}
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 bg-white dark:bg-gray-800">
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {t('pagination.showing') || 'Showing'}{' '}
                                    <span className="font-medium">
                                        {startIndex + 1}
                                    </span>{' '}
                                    {t('pagination.to') || 'to'}{' '}
                                    <span className="font-medium">
                                        {Math.min(startIndex + itemsPerPage, filteredAccounts.length)}
                                    </span>{' '}
                                    {t('pagination.of') || 'of'}{' '}
                                    <span className="font-medium">{filteredAccounts.length}</span>{' '}
                                    {t('pagination.results') || 'results'}
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-400 ring-1 ring-inset ring-gray-300 
                                        dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0 
                                        ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span className="sr-only">{t('pagination.previous') || 'Previous'}</span>
                                        <svg className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            aria-current={currentPage === page ? 'page' : undefined}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold 
                                                ${currentPage === page 
                                                ? 'z-10 bg-blue-600 dark:bg-blue-700 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
                                                : 'text-gray-900 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0'}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-400 ring-1 ring-inset ring-gray-300 
                                        dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0 
                                        ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span className="sr-only">{t('pagination.next') || 'Next'}</span>
                                        <svg className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                        
                        {/* Mobile pagination */}
                        <div className="flex sm:hidden justify-between items-center w-full">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300
                                ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800
                                ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <svg className="h-5 w-5 mr-1" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                {t('pagination.previous') || 'Previous'}
                            </button>
                            
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {currentPage} / {totalPages}
                            </span>
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300
                                ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800
                                ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {t('pagination.next') || 'Next'}
                                <svg className="h-5 w-5 ml-1" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-10">
                    <HiUserGroup className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        {t('accounts.noAccounts') || 'No accounts available or you may not have permission to view them.'}
                    </p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setAccountTypeFilter('all');
                        }}
                        className="mt-4 flex items-center mx-auto bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300 font-medium py-2 px-4 rounded-lg transition"
                    >
                        <HiRefresh className="w-5 h-5 mr-2" />
                        {t('common.refresh') || 'Refresh'}
                    </button>
                </div>
            )}

            {/* Edit Account Modal - Matching the style of other modals */}
            {showEditModal && editAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {t('accounts.editAccount') || 'Edit Account'}
                                </h3>
                                <button 
                                    onClick={handleCloseModal}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    <HiX className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {message.text && (
                                <div className={`mb-4 p-3 ${
                                    message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 
                                    'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                } rounded-md flex items-center`}>
                                    {message.type === 'success' ? 
                                    <HiCheckCircle className="w-5 h-5 mr-2" /> : 
                                    <HiExclamationCircle className="w-5 h-5 mr-2" />
                                    }
                                    {message.text}
                                </div>
                            )}

                            {/* Profile Picture */}
                            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                                    {t('accounts.profilePicture') || 'Profile Picture'}
                                </h4>
                                
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
                                                {t('accounts.chooseNewPicture') || 'Choose new picture'}
                                            </label>
                                            <input
                                                type="file"
                                                id="profilePicture"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900 dark:file:text-blue-200 hover:file:bg-blue-100 dark:hover:file:bg-blue-800 cursor-pointer"
                                            />
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {t('accounts.imageRequirements') || 'JPG, PNG or GIF (max. 5MB)'}
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
                                            {uploadingImage ? 
                                                (t('accounts.uploading') || 'Uploading...') : 
                                                (t('accounts.uploadPicture') || 'Upload Picture')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSaveAccount} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Account ID */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {t('accounts.accountId') || 'Account ID'}
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
                                            {t('accounts.firstName') || 'First Name'}
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
                                            {t('accounts.lastName') || 'Last Name'}
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
                                            {t('accounts.email') || 'Email'}
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
                                            {t('accounts.accountType') || 'Account Type'}
                                        </label>
                                        <select
                                            id="accountType"
                                            value={editAccount.accountType}
                                            onChange={handleAccountTypeChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        >
                                            <option value="ROLE_USER">{t('accounts.user') || 'User'}</option>
                                            <option value="ROLE_ADMIN">{t('accounts.admin') || 'Administrator'}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
                                    >
                                        {t('accounts.cancel') || 'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors ${
                                            loading ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {loading ? 
                                            (t('accounts.saving') || 'Saving...') : 
                                            (t('accounts.saveChanges') || 'Save Changes')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
                        <div className="text-center">
                            <HiExclamationCircle className="mx-auto h-14 w-14 text-red-500 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {t('accounts.confirmDeleteTitle') || 'Confirm Account Deletion'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                {t('accounts.confirmDeleteMessage') || 'Are you sure you want to delete this account? This action cannot be undone.'}
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={cancelDeleteAccount}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
                                >
                                    {t('common.cancel') || 'Cancel'}
                                </button>
                                <button
                                    onClick={confirmDeleteAccount}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    {t('common.delete') || 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AccountsTable; 