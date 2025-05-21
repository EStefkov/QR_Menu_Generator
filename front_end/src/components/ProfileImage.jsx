import React, { useState } from 'react';

/**
 * ProfileImage component - displays a user profile image with fallback handling
 * for 403 errors and other loading issues
 */
const ProfileImage = ({ 
  src, 
  alt = 'Profile Image', 
  className = 'w-10 h-10 rounded-full',
  fallbackSrc = '/uploads/default_profile.png' 
}) => {
  const [imgSrc, setImgSrc] = useState(() => {
    // Check if the source is already a data URL
    if (src && src.startsWith('data:image')) {
      return src;
    }
    
    // Check if we have a local cached version
    const localProfilePic = localStorage.getItem('profilePictureLocal');
    if (!src && localProfilePic && localProfilePic.startsWith('data:image')) {
      console.log("Using cached profile image from localStorage");
      return localProfilePic;
    }
    
    // Use the provided src or prepend the API URL if needed
    if (src) {
      return src.startsWith('http') || src.startsWith('data:') 
        ? src 
        : `${import.meta.env.VITE_API_URL}${src}`;
    }
    
    return `${import.meta.env.VITE_API_URL}${fallbackSrc}`;
  });

  // Handle image loading errors like 403 Forbidden
  const handleError = () => {
    console.log("Error loading profile image:", src);
    
    // Try to use locally cached image first
    const localProfilePic = localStorage.getItem('profilePictureLocal');
    if (localProfilePic && localProfilePic.startsWith('data:image')) {
      console.log("Falling back to cached profile image");
      setImgSrc(localProfilePic);
      return;
    }
    
    // Fall back to default image if local cache fails
    setImgSrc(`${import.meta.env.VITE_API_URL}${fallbackSrc}`);
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

export default ProfileImage; 