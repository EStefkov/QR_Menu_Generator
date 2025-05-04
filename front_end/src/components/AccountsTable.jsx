import { useState, useMemo } from 'react';
import { 
    HiPhotograph, 
    HiCheckCircle, 
    HiExclamationCircle, 
    HiX, 
    HiRefresh, 
    HiUserGroup, 
    HiFilter, 
    HiChevronLeft, 
    HiChevronRight 
} from 'react-icons/hi';
import { profileApi } from '../api/profileApi';
import { uploadProfilePicture } from '../api/adminDashboard';
import { useLanguage } from '../contexts/LanguageContext';
import RoleUpdateModal from './admin/RoleUpdateModal';
import ManagerRoleUpdateModal from './admin/ManagerRoleUpdateModal';
import { useAuth } from '../AuthContext';

export const AccountsTable = ({ accounts = [], onEdit, onDelete, showSearch = true, showTitle = false }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [accountTypeFilter, setAccountTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editAccount, setEditAccount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState(null);
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showRoleUpdateModal, setShowRoleUpdateModal] = useState(false);
    const [accountToUpdateRole, setAccountToUpdateRole] = useState(null);
    const [showManagerRoleUpdateModal, setShowManagerRoleUpdateModal] = useState(false);
    const [accountToUpdateRoleByManager, setAccountToUpdateRoleByManager] = useState(null);

    // Define itemsPerPage as a constant
    const itemsPerPage = 5;

    // Add filter function for accounts
    const getFilteredAccounts = () => {
        if (!accounts || !Array.isArray(accounts)) return [];
        
        return accounts.filter(account => {
            // Search term filter
            const matchesSearch = 
                account.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.mailAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.accountType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.id?.toString().includes(searchTerm);
                
            // Account type filter
            const matchesType = accountTypeFilter === 'all' || account.accountType === accountTypeFilter;
            
            return matchesSearch && matchesType;
        });
    };

    // Sort the filtered accounts
    const getSortedAndFilteredAccounts = () => {
        const filtered = getFilteredAccounts();
        
        return [...filtered].sort((a, b) => {
            let aValue, bValue;
            
            // Determine which field to sort by
            switch(sortField) {
                case 'id':
                    aValue = Number(a.id);
                    bValue = Number(b.id);
                    break;
                case 'name':
                    aValue = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
                    bValue = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
                    break;
                case 'email':
                    aValue = (a.mailAddress || '').toLowerCase();
                    bValue = (b.mailAddress || '').toLowerCase();
                    break;
                case 'type':
                    aValue = (a.accountType || '').toLowerCase();
                    bValue = (b.accountType || '').toLowerCase();
                    break;
                default:
                    aValue = a[sortField];
                    bValue = b[sortField];
            }
            
            // Compare based on sort direction
            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };

    // Handle column header click for sorting
    const handleSort = (field) => {
        if (sortField === field) {
            // Toggle direction if clicking the same field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // New field, default to ascending
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset to first page when sorting
    };

    // Render sort indicator
    const renderSortIndicator = (field) => {
        if (sortField !== field) {
            return (
                <span className="text-gray-400 ml-1">
                    <svg className="h-4 w-4 inline-block" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                </span>
            );
        }
        
        if (sortDirection === 'asc') {
            return (
                <span className="text-blue-500 ml-1">
                    <svg className="h-4 w-4 inline-block" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M5 15l7-7 7 7"></path>
                    </svg>
                </span>
            );
        } else {
            return (
                <span className="text-blue-500 ml-1">
                    <svg className="h-4 w-4 inline-block" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M19 9l-7 7-7-7"></path>
                    </svg>
                </span>
            );
        }
    };

    // Filter by role when clicking on a role badge
    const handleRoleClick = (role) => {
        setAccountTypeFilter(prev => prev === role ? 'all' : role);
        setCurrentPage(1); // Reset to first page
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setAccountTypeFilter('all');
        setSortField('id');
        setSortDirection('asc');
        setCurrentPage(1);
    };

    // Get filtered, sorted and paginated accounts
    const sortedAndFilteredAccounts = getSortedAndFilteredAccounts();
    const totalPages = Math.ceil(sortedAndFilteredAccounts.length / itemsPerPage);
    const paginatedAccounts = sortedAndFilteredAccounts.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
    );

    // Get role badge classes based on role type and active filter
    const getRoleBadgeClasses = (role) => {
        let baseClasses = "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 ";
        
        // Add active style if this role is the current filter
        if (role === accountTypeFilter) {
            baseClasses += "ring-2 ring-offset-1 ";
        }
        
        if (role === "ROLE_ADMIN") {
            return baseClasses + "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
        } else {
            return baseClasses + "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        }
    };

    const handleEditClick = (account) => {
        // Add a warning if editing the current logged-in user
        const currentUserId = localStorage.getItem('id') || localStorage.getItem('userId');
        const isCurrentUser = currentUserId && currentUserId == account.id;
        
        setEditAccount({
            ...account,
            firstName: account.firstName || '',
            lastName: account.lastName || '',
            email: account.mailAddress || '',
            accountType: account.accountType || 'ROLE_USER',
            profilePicture: account.profilePicture || '',
            isCurrentUser: isCurrentUser // Add flag to track if editing current user
        });
        setImagePreview(account.profilePicture || null);
        setShowEditModal(true);
        
        if (isCurrentUser) {
            setMessage({
                type: 'warning',
                text: t('accounts.editingSelfWarning') || 'Warning: You are editing your own account. For proper updates, please use the profile page instead.'
            });
        } else {
            setMessage({ type: '', text: '' });
        }
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

    const handleSaveAccount = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const updatedAccount = {
            firstName: editAccount.firstName,
            lastName: editAccount.lastName,
            email: editAccount.email,
            mailAddress: editAccount.email,
        };

        try {
            const currentUserId = localStorage.getItem('id') || localStorage.getItem('userId');
            
            // Make the API call to update the user profile
            await profileApi.updateUserProfile(updatedAccount);
            
            // Only update our component state through the callback
            if (onEdit) {
                onEdit(updatedAccount);
            }

            // Show special message for own account edits
            if (editAccount.isCurrentUser) {
                setMessage({
                    type: 'warning',
                    text: t('accounts.selfUpdateAdvice') || 'You have updated your own account. Please go to your profile page and refresh for changes to take effect properly.'
                });
                
                // Keep the modal open longer for this warning
                setTimeout(() => {
                    handleCloseModal();
                }, 4000);
            } else {
                setMessage({
                    type: 'success',
                    text: t('accounts.updateSuccess') || 'Account updated successfully'
                });
                
                setTimeout(() => {
                    handleCloseModal();
                }, 1500);
            }
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

    // Function to handle role update button click
    const handleRoleUpdateClick = (account) => {
        // If the user is a manager, show the manager role update modal instead
        if (user?.userData?.accountType === 'ROLE_MANAGER') {
            setAccountToUpdateRoleByManager(account);
            setShowManagerRoleUpdateModal(true);
        } else {
            setAccountToUpdateRole(account);
            setShowRoleUpdateModal(true);
        }
    };
    
    // Handle role update complete
    const handleRoleUpdated = (accountId, newRole) => {
        // Update the local state with the new role
        const updatedAccounts = accounts.map(acc => 
            acc.id === accountId ? { ...acc, accountType: newRole } : acc
        );
        
        // If there's an external update function provided by parent component, call it
        if (onEdit) {
            const updatedAccount = updatedAccounts.find(acc => acc.id === accountId);
            onEdit(updatedAccount);
        }
    };

    // Replace the existing PaginationControls component with the one that matches AdminProfileContent.jsx
    const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
        if (totalPages <= 1) return null;
        
        return (
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 bg-white dark:bg-gray-800">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t('pagination.showing') || 'Showing'}{' '}
                  <span className="font-medium">
                    {sortedAndFilteredAccounts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                  </span>{' '}
                  {t('pagination.to') || 'to'}{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, sortedAndFilteredAccounts.length)}
                  </span>{' '}
                  {t('pagination.of') || 'of'}{' '}
                  <span className="font-medium">{sortedAndFilteredAccounts.length}</span>{' '}
                  {t('pagination.results') || 'results'}
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-400 ring-1 ring-inset ring-gray-300 
                      dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0 
                      ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="sr-only">{t('pagination.previous') || 'Previous'}</span>
                    <HiChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
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
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-400 ring-1 ring-inset ring-gray-300 
                      dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-offset-0 
                      ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="sr-only">{t('pagination.next') || 'Next'}</span>
                    <HiChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Mobile pagination */}
            <div className="flex sm:hidden justify-between items-center w-full">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300
                  ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800
                  ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <HiChevronLeft className="h-5 w-5 mr-1" />
                {t('pagination.previous') || 'Previous'}
              </button>
              
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300
                  ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800
                  ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {t('pagination.next') || 'Next'}
                <HiChevronRight className="h-5 w-5 ml-1" />
              </button>
            </div>
          </div>
        );
      };

    if (!Array.isArray(accounts)) {
        return (
            <div className="text-center py-8 text-red-600">
                <p>Error: Invalid accounts data</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {showTitle && (
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {t('accounts.title') || 'Accounts Management'}
                    </h3>
                )}
                
                {/* Active filters */}
                {(searchTerm || accountTypeFilter !== 'all') && (
                    <div className={`flex flex-wrap gap-2 mt-2 md:mt-0 mb-2 md:mb-0 ${!showTitle ? 'ml-0' : ''}`}>
                        {searchTerm && (
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                <span className="mr-1">{t('accounts.search') || 'Search'}:</span> 
                                <span className="font-medium">{searchTerm}</span>
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="ml-1 text-blue-500 hover:text-blue-700"
                                >
                                    <HiX className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                        
                        {accountTypeFilter !== 'all' && (
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                <span className="mr-1">{t('accounts.type') || 'Type'}:</span> 
                                <span className="font-medium">{accountTypeFilter}</span>
                                <button 
                                    onClick={() => setAccountTypeFilter('all')}
                                    className="ml-1 text-purple-500 hover:text-purple-700"
                                >
                                    <HiX className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                        
                        <button 
                            onClick={clearFilters}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            <HiRefresh className="h-3.5 w-3.5 mr-1" />
                            {t('accounts.clearFilters') || 'Clear all'}
                        </button>
                    </div>
                )}
                
                <div className={`flex flex-wrap gap-4 w-full ${showTitle ? 'md:w-auto' : 'justify-between'}`}>
                    {/* Search Bar */}
                    {showSearch && (
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder={t('accounts.search') || 'Search...'}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page when filtering
                            }}
                            className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    )}
                </div>
            </div>
            
            {paginatedAccounts.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                        onClick={() => handleSort('id')}
                                    >
                                        <div className="flex items-center">
                                            {t('accounts.id') || 'ID'}
                                            {renderSortIndicator('id')}
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center">
                                            {t('accounts.name') || 'Name'}
                                            {renderSortIndicator('name')}
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                        onClick={() => handleSort('email')}
                                    >
                                        <div className="flex items-center">
                                            {t('accounts.email') || 'Email'}
                                            {renderSortIndicator('email')}
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                        onClick={() => handleSort('type')}
                                    >
                                        <div className="flex items-center">
                                            {t('accounts.type') || 'Type'}
                                            {renderSortIndicator('type')}
                                        </div>
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
                                            <span 
                                                onClick={() => handleRoleClick(account.accountType)}
                                                className={getRoleBadgeClasses(account.accountType)}
                                            >
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
                                                <button
                                                    onClick={() => handleRoleUpdateClick(account)}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                                                    title={t('accounts.updateRole') || 'Update Role'}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination using the reusable component */}
                    <PaginationControls 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            ) : (
                <div className="text-center py-10">
                    <HiUserGroup className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        {t('accounts.noAccounts') || 'No accounts available or you may not have permission to view them.'}
                    </p>
                    <button
                        onClick={clearFilters}
                        className="mt-4 flex items-center mx-auto bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300 font-medium py-2 px-4 rounded-lg transition"
                    >
                        <HiRefresh className="w-5 h-5 mr-2" />
                        {t('common.clearAndRefresh') || 'Clear filters and refresh'}
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

            {/* Standard RoleUpdateModal for admins */}
            <RoleUpdateModal
                isOpen={showRoleUpdateModal}
                onClose={() => setShowRoleUpdateModal(false)}
                account={accountToUpdateRole}
                onRoleUpdated={handleRoleUpdated}
            />
            
            {/* ManagerRoleUpdateModal for managers */}
            <ManagerRoleUpdateModal
                isOpen={showManagerRoleUpdateModal}
                onClose={() => setShowManagerRoleUpdateModal(false)}
                account={accountToUpdateRoleByManager}
                onRoleUpdated={handleRoleUpdated}
            />
        </div>
    );
}

export default AccountsTable; 