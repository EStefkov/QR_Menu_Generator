// MenuBanner.jsx
import React, { useState, useEffect } from 'react';
import { getFullImageUrl } from "../api/adminDashboard";

const MenuBanner = ({ bannerImage, menuName, onBannerUpload, isAdmin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (bannerImage) {
      const fullUrl = getFullImageUrl(bannerImage);
      setImageUrl(fullUrl);

      // Preload image
      const img = new Image();
      img.onload = () => setImageError(false);
      img.onerror = () => setImageError(true);
      img.src = fullUrl;
    }
  }, [bannerImage]);

  const handleBannerUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setImageError(false);
      await onBannerUpload(file);
    } catch (error) {
      setImageError(true);
      alert(`Error uploading image: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-[300px] relative overflow-hidden">
      {/* Base background */}
      <div className="absolute inset-0 bg-gray-900">
        {/* Image container */}
        {imageUrl && !imageError && (
          <div className="w-full h-full">
            <img
              src={imageUrl}
              alt={menuName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg z-10">
            {menuName}
          </h1>
        </div>

        {/* Admin controls */}
        {isAdmin && (
          <div className="absolute bottom-4 right-4 z-20">
            <input
              type="file"
              id="banner-upload"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
              disabled={isLoading}
            />
            <label
              htmlFor="banner-upload"
              className={`
                inline-block
                px-4 py-2
                bg-blue-500 
                hover:bg-blue-600 
                text-white 
                rounded-lg
                cursor-pointer
                transition-all
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isLoading ? 'Uploading...' : 'Change Banner'}
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuBanner;
