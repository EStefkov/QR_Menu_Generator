// MenuBanner.jsx
import React, { useState } from 'react';

const MenuBanner = ({ bannerImage, menuName, onBannerUpload, isAdmin }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Директно приемаме bannerImage като пълен URL,
  // без да викаме повторно getFullImageUrl
  const bannerUrl = bannerImage || '';

  const handleBannerUpload = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Валидации...
        if (file.size > 10 * 1024 * 1024) {
          alert('Файлът е твърде голям...');
          return;
        }
        if (!file.type.startsWith('image/')) {
          alert('Моля, изберете валиден формат...');
          return;
        }

        setIsLoading(true);
        await onBannerUpload(file);
      } catch (error) {
        console.error('Error uploading banner:', error);
        alert('Възникна грешка при качването на банера...');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative w-full h-64 md:h-96 lg:h-[400px] mb-8 rounded-xl overflow-hidden">
      {bannerUrl ? (
        <img
          src={bannerUrl}
          alt={menuName}
          className="w-full h-full object-cover"
          style={{ 
            maxHeight: '400px',
            objectPosition: 'center'
          }}
          onError={(e) => {
            // Ако не може да се зареди изображението, слагаме някакъв default
            e.target.onerror = null;
            e.target.src = '/default-banner.png'; 
          }}
        />
      ) : (
        <div className="w-full h-full bg-black flex items-center justify-center">
          <span className="text-white text-xl font-semibold">
            Няма банер
          </span>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-2 drop-shadow-lg">
          {menuName}
        </h1>
      </div>

      {/* Бутон за ъплоуд (само за admin) */}
      {isAdmin && (
        <label className="absolute bottom-4 right-4 cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleBannerUpload}
            className="hidden"
            disabled={isLoading}
          />
          <div 
            className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800
                        rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700
                        transition-colors duration-200
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                ></circle>
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 
                    0 5.373 0 12h4zm2 5.291A7.962 7.962 
                    0 014 12H0c0 3.042 1.135 5.824 3 
                    7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2 
                     l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 
                     2 0 002-2V6a2 2 0 
                     00-2-2H6a2 2 0 00-2 2v12a2 2 0 
                     002 2z"
                />
              </svg>
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isLoading
                ? 'Качване...'
                : bannerUrl
                  ? 'Промени банер'
                  : 'Добави банер'}
            </span>
          </div>
        </label>
      )}
    </div>
  );
};

export default MenuBanner;
