import React from 'react';
import { HiX } from 'react-icons/hi';
import { useLanguage } from '../../contexts/LanguageContext';

const DeleteConfirmationModal = ({ 
  showModal,
  onClose,
  onConfirm,
  isDeleting,
  error,
  itemToDelete,
  itemName,
  itemType = 'restaurant'
}) => {
  const { t } = useLanguage();
  
  if (!showModal || !itemToDelete) return null;
  
  const displayName = itemName || (itemToDelete.name || itemToDelete.restorantName || itemToDelete.id);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {t(`admin.delete${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`) || `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300">
              {t(`admin.delete${itemType.charAt(0).toUpperCase() + itemType.slice(1)}Warning`) || 
                `Are you sure you want to delete this ${itemType}? This action cannot be undone.`}
            </p>
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                {displayName}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isDeleting}
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting 
                ? (t('common.deleting') || 'Deleting...') 
                : (t('common.delete') || 'Delete')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 