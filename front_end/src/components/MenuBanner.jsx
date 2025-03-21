// MenuBanner.jsx
import React, { useState, useEffect } from 'react';
import { getFullImageUrl } from "../api/adminDashboard";

const MenuBanner = ({ bannerImage, menuName, onBannerUpload, isAdmin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    console.log('MenuBanner props:', { bannerImage, menuName, isAdmin });
    
    if (bannerImage) {
      const fullUrl = getFullImageUrl(bannerImage);
      console.log('Setting image URL:', fullUrl);
      setImageUrl(fullUrl);
      setDebugInfo(prev => ({ ...prev, fullUrl }));
      
      // Debug: Check if image exists
      fetch(fullUrl)
        .then(response => {
          console.log('Image fetch response:', response.status, response.statusText);
          if (!response.ok) {
            console.error('Image not accessible:', response.status, response.statusText);
            setImageError(true);
            setDebugInfo(prev => ({ 
              ...prev, 
              error: `Status: ${response.status}, ${response.statusText}` 
            }));
          } else {
            console.log('Image is accessible:', fullUrl);
            setImageError(false);
            setDebugInfo(prev => ({ ...prev, status: 'Image accessible' }));
          }
        })
        .catch(error => {
          console.error('Error checking image:', error);
          setImageError(true);
          setDebugInfo(prev => ({ ...prev, error: error.message }));
        });
    }
  }, [bannerImage, menuName, isAdmin]);

  const handleBannerUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit');
      return;
    }

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      alert('Please upload a JPEG, PNG, GIF, or WebP image');
      return;
    }

    try {
      setIsLoading(true);
      setImageError(false);
      await onBannerUpload(file);
    } catch (error) {
      console.error('Error uploading banner:', error);
      setImageError(true);
      alert(`Error uploading image: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (e) => {
    console.error('Image failed to load:', imageUrl);
    setImageError(true);
    setDebugInfo(prev => ({ ...prev, loadError: 'Image failed to load' }));
    e.target.onerror = null; // Prevent infinite loop
  };

  return (
    <div className="relative w-full h-64 bg-gray-900">
      {imageUrl && !imageError ? (
        <div className="relative w-full h-full">
          <img
            src={imageUrl}
            alt={menuName}
            className="absolute inset-0 w-full h-full object-cover"
            onError={handleImageError}
            style={{ display: 'block' }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white">{menuName}</h1>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-white mb-4">{menuName}</h1>
          {/* Debug info always visible during development */}
          <div className="text-sm text-gray-400">
            <p>Debug Info:</p>
            <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="absolute bottom-4 right-4 z-10">
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
            className={`cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Uploading...' : 'Change Banner'}
          </label>
        </div>
      )}
    </div>
  );
};

export default MenuBanner;
