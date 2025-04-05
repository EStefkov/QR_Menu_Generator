import React from 'react';
import { HiX } from 'react-icons/hi';

const RestaurantDeleteConfirmation = ({
  t,
  restaurant,
  deleting,
  deleteError,
  onConfirm,
  onClose
}) => {
  if (!restaurant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {t('admin.confirmDeleteRestaurant') || 'Delete Restaurant'}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <HiX className="w-5 h-5" />
            </button>
          </div>
          {deleteError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">{deleteError}</div>
          )}
          <p className="mb-2">
            {t('admin.deleteRestaurantWarning') ||
              'Are you sure you want to delete this restaurant? This cannot be undone.'}
          </p>
          <div className="mt-3 p-3 bg-yellow-50 rounded-md">
            <p className="text-yellow-800 font-semibold">
              {restaurant.name || restaurant.restorantName}
            </p>
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="mr-3 px-4 py-2 border rounded"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              {deleting ? (t('common.deleting') || 'Deleting...') : (t('common.delete') || 'Delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDeleteConfirmation;
