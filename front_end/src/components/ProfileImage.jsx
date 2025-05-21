import React, { useState, useEffect } from 'react';

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

  // Listen for profile picture updates and refresh the component
  useEffect(() => {
    const handleUserDataUpdate = () => {
      console.log("ProfileImage: userDataUpdated event received, checking for new profile picture");
      
      // Check if we have a new local profile picture
      const localProfilePic = localStorage.getItem('profilePictureLocal');
      if (localProfilePic && localProfilePic.startsWith('data:image')) {
        console.log("ProfileImage: Found updated local profile picture");
        setImgSrc(localProfilePic);
        return;
      }
      
      // Check if we have a new remote profile picture
      const profilePicture = localStorage.getItem('profilePicture');
      if (profilePicture && profilePicture !== src) {
        console.log("ProfileImage: Found updated remote profile picture");
        const newSrc = profilePicture.startsWith('http') || profilePicture.startsWith('data:') 
          ? profilePicture 
          : `${import.meta.env.VITE_API_URL}${profilePicture}`;
        setImgSrc(newSrc);
      }
    };

    // Add event listener for user data updates
    window.addEventListener('userDataUpdated', handleUserDataUpdate);
    
    // Clean up listener on unmount
    return () => {
      window.removeEventListener('userDataUpdated', handleUserDataUpdate);
    };
  }, [src]);

  // Update image source when prop changes
  useEffect(() => {
    if (src) {
      const newSrc = src.startsWith('http') || src.startsWith('data:') 
        ? src 
        : `${import.meta.env.VITE_API_URL}${src}`;
      setImgSrc(newSrc);
    }
  }, [src]);

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