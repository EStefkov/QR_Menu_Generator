import React from 'react';
import { HiX } from 'react-icons/hi';

const RestaurantModal = ({
  t,
  show,
  onClose,
  onSubmit,
  creatingRestaurant,
  createError,
  refs
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {t('admin.createRestaurant') || 'Create New Restaurant'}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <HiX className="w-5 h-5" />
            </button>
          </div>
          {createError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">{createError}</div>
          )}
          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('restaurants.name') || 'Restaurant Name'} *
                </label>
                <input
                  type="text"
                  name="restorantName"
                  ref={refs.restorantNameRef}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('restaurants.phone') || 'Phone Number'}
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  ref={refs.phoneNumberRef}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('restaurants.address') || 'Address'}
                </label>
                <input
                  type="text"
                  name="address"
                  ref={refs.addressRef}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('restaurants.email') || 'Email'}
                </label>
                <input
                  type="email"
                  name="email"
                  ref={refs.emailRef}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button type="button" onClick={onClose} className="mr-3 px-4 py-2 border rounded">
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={creatingRestaurant}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {creatingRestaurant ? (t('common.creating') || 'Creating...') : (t('common.create') || 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestaurantModal;
