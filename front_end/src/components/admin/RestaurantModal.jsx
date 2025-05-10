import React, { useRef } from 'react';
import { HiX } from 'react-icons/hi';
import { useLanguage } from '../../contexts/LanguageContext';

const RestaurantModal = ({ 
  showModal,
  onClose,
  onSubmit,
  isCreating,
  error
}) => {
  const { t } = useLanguage();
  
  // Form refs
  const restaurantNameRef = useRef();
  const phoneNumberRef = useRef();
  const addressRef = useRef();
  const emailRef = useRef();
  
  if (!showModal) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get values from refs
    const restaurantData = {
      restorantName: restaurantNameRef.current.value.trim(),
      phoneNumber: phoneNumberRef.current.value.trim(),
      address: addressRef.current.value.trim(),
      email: emailRef.current.value.trim()
    };
    
    // Validate address field
    if (!restaurantData.address) {
      console.error("Restaurant address is empty");
      // You might want to show an error here
      return; // Don't proceed if address is empty
    }
    
    // Add contactInfo structure to ensure address is properly saved
    // Some backends expect address in a nested structure
    const enhancedData = {
      ...restaurantData,
      contactInfo: {
        address: restaurantData.address,
        phone: restaurantData.phoneNumber,
        email: restaurantData.email
      },
      // Ensure compatibility with different field name conventions
      restorantAddress: restaurantData.address,
      restaurantAddress: restaurantData.address
    };
    
    // Log the data being sent
    console.log("Sending restaurant data:", JSON.stringify(enhancedData, null, 2));
    
    onSubmit(enhancedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {t('admin.createRestaurant') || 'Create New Restaurant'}
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
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('restaurants.name') || 'Restaurant Name'} *
                </label>
                <input
                  type="text"
                  name="restorantName"
                  ref={restaurantNameRef}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t('restaurants.namePlaceholder') || 'Enter restaurant name'}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('restaurants.phone') || 'Phone Number'}
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  ref={phoneNumberRef}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t('restaurants.phonePlaceholder') || 'Enter phone number'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('restaurants.address') || 'Address'} *
                </label>
                <input
                  type="text"
                  name="address"
                  ref={addressRef}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t('restaurants.addressPlaceholder') || 'Enter complete address'}
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('restaurants.addressHelp') || 'Please provide a complete address for the restaurant to be displayed properly.'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('restaurants.email') || 'Email'}
                </label>
                <input
                  type="email"
                  name="email"
                  ref={emailRef}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t('restaurants.emailPlaceholder') || 'Enter email'}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating 
                  ? (t('common.creating') || 'Creating...') 
                  : (t('common.create') || 'Create')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestaurantModal; 