export const getFullImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/default_menu.png'; // Default image path
  }

  // If the path is already a full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Special case for old default product paths
  if (imagePath === 'default_product.png') {
    // This should be replaced by the menu-specific default product image
    console.warn('Using legacy default_product.png path. Update to menu-specific path.');
    return '/uploads/default_product.png';
  }

  // If the path starts with a slash, it's already relative to the public directory
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // Otherwise, add a leading slash
  return `/${imagePath}`;
}; 