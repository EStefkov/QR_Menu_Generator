// MenuBanner.jsx
import React, { useState, useEffect } from 'react';
import { getFullImageUrl } from "../api/adminDashboard";
import { useAuth } from "../contexts/AuthContext";

const MenuBanner = ({ bannerImage, menuName, onBannerUpload, onDefaultProductImageUpload, isAdmin, menuId, initialTextColor = 'text-white' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingDefaultProduct, setIsUploadingDefaultProduct] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [textColor, setTextColor] = useState(initialTextColor?.replace(/['"]/g, '') || 'text-white');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(menuName?.replace(/['"]/g, ''));
  const { userData } = useAuth();

  // Check if user is admin, manager, or co-manager
  const canEdit = isAdmin || userData?.accountType === 'ROLE_COMANAGER';

  useEffect(() => {
    setEditedName(menuName?.replace(/['"]/g, ''));
  }, [menuName]);

  useEffect(() => {
    // Only attempt to load image if bannerImage exists
    if (bannerImage) {
      const fullUrl = getFullImageUrl(bannerImage);
      setImageUrl(fullUrl);

      // Preload image
      const img = new Image();
      img.onload = () => {
        setImageError(false);
        setIsLoading(false);
      };
      img.onerror = () => {
        console.error('Failed to load image:', fullUrl);
        setImageError(true);
        setIsLoading(false);
      };
      setIsLoading(true);
      img.src = fullUrl;
    } else {
      // If no banner image, set default state
      setImageUrl('');
      setImageError(false);
      setIsLoading(false);
    }
  }, [bannerImage]);

  // Update textColor when initialTextColor prop changes
  useEffect(() => {
    if (initialTextColor) {
      const cleanColor = initialTextColor.replace(/['"]/g, '');
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
    setTextColor(newColor);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/menus/${menuId}/text-color`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newColor.replace(/['"]/g, ''))
      });

      if (!response.ok) {
        throw new Error('Failed to update text color');
      }
      
      const updatedMenu = await response.json();
      
    } catch (error) {
      console.error('Failed to save color:', error);
      alert('Failed to save color preference');
      setTextColor(textColor); // Revert to previous color on error
    }
  };

  const handleNameChange = async () => {
    const cleanName = editedName.replace(/['"]/g, '').trim();
    if (cleanName === menuName?.replace(/['"]/g, '')) {
      setIsEditingName(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/menus/${menuId}/name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cleanName)
      });

      if (!response.ok) {
        throw new Error('Failed to update menu name');
      }

      const updatedMenu = await response.json();
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to save menu name:', error);
      alert('Failed to save menu name');
      setEditedName(menuName?.replace(/['"]/g, '')); // Revert to original name on error
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleNameChange();
    } else if (event.key === 'Escape') {
      setEditedName(menuName?.replace(/['"]/g, ''));
      setIsEditingName(false);
    }
  };

  const handleDefaultProductImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingDefaultProduct(true);
      await onDefaultProductImageUpload(file);
    } catch (error) {
      alert(`Error uploading default product image: ${error.message}`);
    } finally {
      setIsUploadingDefaultProduct(false);
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
          {isEditingName && canEdit ? (
            <div className="relative">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleNameChange}
                onKeyDown={handleKeyPress}
                className="text-4xl font-bold bg-transparent text-center border-b-2 border-white/50 focus:border-white/80 outline-none px-2"
                style={{ color: 'inherit' }}
                autoFocus
              />
              <div className="absolute -bottom-6 left-0 right-0 text-center">
                <span className="text-xs text-white/70">Press Enter to save, Esc to cancel</span>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <h1 className={`text-4xl font-bold ${textColor} drop-shadow-lg z-10`}>
                {editedName}
              </h1>
              {canEdit && (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>
          )}

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

              <input
                type="file"
                id="default-product-upload"
                accept="image/*"
                className="hidden"
                onChange={handleDefaultProductImageUpload}
                disabled={isUploadingDefaultProduct}
              />
              <label
                htmlFor="default-product-upload"
                className={`
                  inline-block
                  px-4 py-2
                  bg-green-500 
                  hover:bg-green-600 
                  text-white 
                  rounded-lg
                  cursor-pointer
                  transition-all
                  ${isUploadingDefaultProduct ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isUploadingDefaultProduct ? 'Uploading...' : 'Set Default Product Image'}
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuBanner;
