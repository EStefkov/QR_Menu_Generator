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

  // Handle menu-specific default product images
  // This matches patterns like "/uploads/4/default_product.png" or "uploads/4/default_product.jpg"
  if (/\/uploads\/\d+\/default_product(\.\w+)?$/.test(imagePath) || 
      /^uploads\/\d+\/default_product(\.\w+)?$/.test(imagePath)) {
    // The path is already in the correct format, just ensure it has a leading slash
    return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  }

  // If the path starts with a slash, it's already relative to the public directory
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // Otherwise, add a leading slash
  return `/${imagePath}`;
}; 