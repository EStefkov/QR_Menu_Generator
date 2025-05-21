/**
 * Utility functions for handling URLs in the application
 */

/**
 * Joins a base URL with a path, ensuring proper slash handling
 * @param {string} baseUrl - The base URL (e.g., http://example.com)
 * @param {string} path - The path to append (e.g., /api/users)
 * @returns {string} The properly joined URL
 */
export const joinPaths = (baseUrl, path) => {
  if (!baseUrl || !path) {
    return baseUrl || path || '';
  }
  
  // If baseUrl doesn't end with slash and path doesn't start with slash, add it
  if (!baseUrl.endsWith('/') && !path.startsWith('/')) {
    return `${baseUrl}/${path}`;
  }
  
  // If both have slashes, remove one
  if (baseUrl.endsWith('/') && path.startsWith('/')) {
    return `${baseUrl}${path.substring(1)}`;
  }
  
  // Otherwise just join them as is
  return `${baseUrl}${path}`;
};

/**
 * Creates a full URL for an image, handling the API URL and path correctly
 * @param {string} imagePath - The image path or URL
 * @returns {string} The full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return joinPaths(import.meta.env.VITE_API_URL, '/uploads/default_profile.png');
  }
  
  // If it's already a data URL or a full URL, return as is
  if (imagePath.startsWith('data:') || imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Otherwise, join with the API URL
  return joinPaths(import.meta.env.VITE_API_URL, imagePath);
};

/**
 * Gets the URL for a profile picture with fallbacks
 * @param {Object} userData - User data object that might contain profilePicture
 * @returns {string} URL to the profile picture
 */
export const getProfilePictureUrl = (userData) => {
  // Check for userData.profilePicture first
  if (userData?.profilePicture) {
    return getImageUrl(userData.profilePicture);
  }
  
  // Then check localStorage for locally cached profile picture
  const localProfilePic = localStorage.getItem('profilePictureLocal');
  if (localProfilePic && localProfilePic.startsWith('data:image')) {
    return localProfilePic;
  }
  
  // Then check localStorage for regular profile picture
  const profilePicture = localStorage.getItem('profilePicture');
  if (profilePicture) {
    return getImageUrl(profilePicture);
  }
  
  // Fallback to default
  return joinPaths(import.meta.env.VITE_API_URL, '/uploads/default_profile.png');
}; 