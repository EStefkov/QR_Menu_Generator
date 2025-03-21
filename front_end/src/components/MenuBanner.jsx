// MenuBanner.jsx
import React, { useState, useEffect } from 'react';
import { getFullImageUrl } from "../api/adminDashboard";

const MenuBanner = ({ bannerImage, menuName, onBannerUpload, isAdmin, menuId, initialTextColor = 'text-white' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [textColor, setTextColor] = useState(initialTextColor?.replace(/['"]/g, '') || 'text-white');

  // Debug log for props
  useEffect(() => {
    console.log('MenuBanner props:', { initialTextColor, menuName, menuId });
  }, [initialTextColor, menuName, menuId]);

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

  // Update textColor when initialTextColor prop changes
  useEffect(() => {
    if (initialTextColor) {
      const cleanColor = initialTextColor.replace(/['"]/g, '');
      console.log('Updating text color to:', cleanColor);
      setTextColor(cleanColor);
    }
  }, [initialTextColor]);

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

  const handleColorChange = async (event) => {
    const newColor = event.target.value;
    console.log('Color change requested:', newColor);
    setTextColor(newColor);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/menus/${menuId}/text-color`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newColor)
      });

      if (!response.ok) {
        throw new Error('Failed to update text color');
      }
      
      const updatedMenu = await response.json();
      console.log('Color update response:', updatedMenu);
      
    } catch (error) {
      console.error('Failed to save color:', error);
      alert('Failed to save color preference');
      setTextColor(textColor); // Revert to previous color on error
    }
  };

  const colorOptions = [
    { value: 'text-white', label: 'White' },
    { value: 'text-yellow-400', label: 'Gold' },
    { value: 'text-blue-400', label: 'Blue' },
    { value: 'text-green-400', label: 'Green' },
    { value: 'text-red-400', label: 'Red' },
    { value: 'text-purple-400', label: 'Purple' }
  ];

  // Debug log for current state
  console.log('Current MenuBanner state:', { textColor, isLoading, imageError });

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
          <h1 className={`text-4xl font-bold ${textColor} drop-shadow-lg z-10`}>
            {menuName}
          </h1>
        </div>

        {/* Admin controls */}
        {isAdmin && (
          <div className="absolute bottom-4 right-4 z-20 flex gap-2">
            <select
              onChange={handleColorChange}
              value={textColor}
              className="px-3 py-2 bg-white text-gray-800 rounded-lg text-sm cursor-pointer hover:bg-gray-50"
            >
              {colorOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
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
