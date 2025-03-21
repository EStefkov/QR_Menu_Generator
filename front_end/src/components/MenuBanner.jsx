import React from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const MenuBanner = ({ bannerImage, menuName, onBannerUpload, isAdmin }) => {
  const bannerUrl = bannerImage ? `${API_BASE_URL}${bannerImage}` : '';
  
  const handleBannerUpload = (event) => {
    const file = event.target.files[0];
    if (file && onBannerUpload) {
      onBannerUpload(file);
    }
  };

  return (
    <div className="relative w-full h-64 md:h-80 mb-8 rounded-xl overflow-hidden">
      {bannerUrl ? (
        <img
          src={bannerUrl}
          alt={menuName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">{menuName}</h1>
        </div>
      )}

      {/* Overlay with menu name */}
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center px-4">
          {menuName}
        </h1>
      </div>

      {/* Admin upload button */}
      {isAdmin && (
        <label className="absolute bottom-4 right-4 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            className="hidden"
          />
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <svg 
              className="w-5 h-5 text-gray-700 dark:text-gray-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {bannerUrl ? 'Промени банер' : 'Добави банер'}
            </span>
          </div>
        </label>
      )}
    </div>
  );
};

export default MenuBanner; 