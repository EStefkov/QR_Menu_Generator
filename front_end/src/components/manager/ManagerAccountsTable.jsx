import { useState, useEffect } from 'react';
import { 
    HiX, 
    HiRefresh, 
    HiUserGroup, 
    HiFilter, 
    HiChevronLeft, 
    HiChevronRight,
    HiExclamationCircle,
    HiCheckCircle
} from 'react-icons/hi';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import ManagerRoleUpdateModal from '../admin/ManagerRoleUpdateModal';
import { getManagedRestaurants } from '../../api/adminDashboard';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ManagerAccountsTable = ({ accounts = [], onEdit, onDelete, restaurantId = null, selectedRestaurant = null }) => {
    const { t } = useLanguage();
    const { userData } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [accountTypeFilter, setAccountTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showManagerRoleUpdateModal, setShowManagerRoleUpdateModal] = useState(false);
    const [accountToUpdateRoleByManager, setAccountToUpdateRoleByManager] = useState(null);
    const [loading, setLoading] = useState(false);
    const [restaurantCoManagers, setRestaurantCoManagers] = useState([]);

    // Define itemsPerPage as a constant
    const itemsPerPage = 5;

    // Load co-managers for current restaurant
    useEffect(() => {
        if (restaurantId) {
            fetchRestaurantCoManagers(restaurantId);
        }
    }, [restaurantId]);

    const fetchRestaurantCoManagers = async (restaurantId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/manager-assignments/restaurant/${restaurantId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Filter to get only COMANAGER accounts
            const coManagers = Array.isArray(response.data) ? 
                response.data.filter(manager => 
                    manager.account && manager.account.accountType === 'ROLE_COMANAGER'
                ) : [];
            
            setRestaurantCoManagers(coManagers);
        } catch (err) {
            console.error('Error fetching restaurant co-managers:', err);
        }
    };

    // Add filter function for accounts
    const getFilteredAccounts = () => {
        if (!accounts || !Array.isArray(accounts)) return [];
        
        return accounts.filter(account => {
            // Only show USER and COMANAGER roles
            const allowedRoles = ['ROLE_USER', 'ROLE_COMANAGER'];
            const hasAllowedRole = allowedRoles.includes(account.accountType);
            
            if (!hasAllowedRole) return false;
            
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

    // Check if account is already a co-manager for this restaurant
    const isCoManagerForRestaurant = (accountId) => {
        return restaurantCoManagers.some(cm => cm.account?.id === accountId);
    };

    // Function to handle role update button click
    const handleRoleUpdateClick = (account) => {
        setAccountToUpdateRoleByManager(account);
        setShowManagerRoleUpdateModal(true);
    };
    
    // Handle role update complete
    const handleRoleUpdated = (accountId, newRole) => {
        // If there's an external update function provided by parent component, call it
        if (onEdit) {
            const updatedAccount = {
                id: accountId,
                accountType: newRole
            };
            onEdit(updatedAccount);
        }
        
        // Refresh co-managers list after update
        if (restaurantId) {
            fetchRestaurantCoManagers(restaurantId);
        }
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
        } else if (role === "ROLE_COMANAGER") {
            return baseClasses + "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        } else {
            return baseClasses + "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        }
    };

    // Pagination controls component
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
          </div>
        );
    };

    if (!selectedRestaurant) {
        return (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-md overflow-hidden p-6">
                <div className="text-center py-8">
                    <HiExclamationCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {t('manager.selectRestaurantFirst') || 'Please select a restaurant first to manage its co-managers.'}
                    </h3>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">{t('common.loading') || 'Loading...'}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-md overflow-hidden">
            <div className="p-6 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {t('manager.manageCoManagers') || 'Manage Co-Managers'}
                    </h3>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder={t('accounts.search') || 'Search users...'}
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

                {/* Filter pills */}
                {(searchTerm || accountTypeFilter !== 'all') && (
                    <div className="flex flex-wrap gap-2">
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
            </div>

            {/* Accounts table */}
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
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                    >
                                        {t('manager.status') || 'Status'}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        {t('accounts.actions') || 'Actions'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedAccounts.map((account) => {
                                    const isAlreadyCoManager = isCoManagerForRestaurant(account.id);
                                    return (
                                        <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                                                {isAlreadyCoManager ? (
                                                    <div className="inline-flex items-center text-sm text-green-600 dark:text-green-400">
                                                        <HiCheckCircle className="w-5 h-5 mr-1" />
                                                        {t('manager.isCoManager') || 'Is Co-Manager'}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-400 dark:text-gray-500">
                                                        {t('manager.notCoManager') || 'Not Co-Manager'}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {!isAlreadyCoManager && (
                                                    <button
                                                        onClick={() => handleRoleUpdateClick(account)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        title={t('manager.makeCoManager') || 'Make Co-Manager'}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                                        </svg>
                                                        {t('manager.updateRole') || 'Update Role'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
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
                        {t('accounts.noAccounts') || 'No accounts available or matching your search criteria.'}
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

            {/* ManagerRoleUpdateModal */}
            <ManagerRoleUpdateModal
                isOpen={showManagerRoleUpdateModal}
                onClose={() => setShowManagerRoleUpdateModal(false)}
                account={accountToUpdateRoleByManager}
                onRoleUpdated={handleRoleUpdated}
            />
        </div>
    );
};

export default ManagerAccountsTable; 