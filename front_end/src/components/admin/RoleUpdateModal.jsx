import { useState } from 'react';
import { HiX, HiExclamationCircle, HiCheck } from 'react-icons/hi';
import { useLanguage } from '../../contexts/LanguageContext';
import { updateUserRole } from '../../api/adminDashboard';

const RoleUpdateModal = ({ isOpen, onClose, account, onRoleUpdated }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedRole, setSelectedRole] = useState(account?.accountType || 'ROLE_USER');

  if (!isOpen) return null;

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      await updateUserRole(token, account.id, selectedRole);
      setSuccess(true);
      
      // Callback to parent component
      if (onRoleUpdated) {
        onRoleUpdated(account.id, selectedRole);
      }
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err.message || 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to display user-friendly role names
  const getRoleFriendlyName = (roleType) => {
    const roleNames = {
      'ROLE_USER': t('roles.user') || 'User',
      'ROLE_ADMIN': t('roles.admin') || 'Administrator',
      'ROLE_MANAGER': t('roles.manager') || 'Manager',
      'ROLE_WAITER': t('roles.waiter') || 'Waiter'
    };
    return roleNames[roleType] || roleType;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('admin.updateUserRole') || 'Update User Role'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md flex items-center">
              <HiExclamationCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md flex items-center">
              <HiCheck className="w-5 h-5 mr-2" />
              {t('admin.roleUpdatedSuccess') || 'User role updated successfully'}
            </div>
          )}
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('admin.updateRoleFor') || 'Update role for'}: 
              <span className="font-medium text-gray-900 dark:text-white ml-1">
                {account?.firstName || ''} {account?.lastName || ''} ({account?.mailAddress || ''})
              </span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('admin.currentRole') || 'Current role'}: 
              <span className="font-medium text-gray-900 dark:text-white ml-1">
                {getRoleFriendlyName(account?.accountType)}
              </span>
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.selectRole') || 'Select new role'}
              </label>
              <select
                value={selectedRole}
                onChange={handleRoleChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={loading}
              >
                <option value="ROLE_USER">{t('roles.user') || 'User'}</option>
                <option value="ROLE_ADMIN">{t('roles.admin') || 'Administrator'}</option>
                <option value="ROLE_MANAGER">{t('roles.manager') || 'Manager'}</option>
                <option value="ROLE_WAITER">{t('roles.waiter') || 'Waiter'}</option>
              </select>
            </div>
            
            {selectedRole === 'ROLE_MANAGER' && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-md">
                <p className="text-sm">
                  {t('admin.managerRoleNote') || 'Note: After changing the role to Manager, you can assign restaurants to this user from the Manager Assignments section.'}
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={loading}
              >
                {loading
                  ? t('common.updating') || 'Updating...'
                  : t('common.update') || 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleUpdateModal; 