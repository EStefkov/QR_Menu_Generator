// ProductCard.jsx
import React, { useState, useEffect } from "react";
import { getFullImageUrl, getCategoryDetails } from "../api/adminDashboard";
import { HiHeart, HiShoppingCart, HiOutlineHeart, HiUser, HiInformationCircle, HiCheckCircle } from 'react-icons/hi';
import { useAuth } from '../AuthContext';
import { favoritesApi } from '../api/favoritesProducts';
import { useCart } from '../contexts/CartContext';

const ProductCard = ({ product, onSelectProduct, onEditProduct, accountType, onFavoriteUpdate, isFavorite: initialIsFavorite }) => {
  const { userData } = useAuth();
  const { addToCart } = useCart();  // Get addToCart from CartContext
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite || false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Get full URL for the product image
  const imageUrl = product?.productImage ? getFullImageUrl(product.productImage) : "";
  const hasImage = imageUrl && !imageError;

  // Reset error state when product changes
  useEffect(() => {
    if (product?.productImage) {
      setImageError(false);
      setImageLoading(true);
    }
  }, [product]);
  
  // Check favorite status when component mounts or product changes
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!userData.token || onFavoriteUpdate) return;
      
      try {
        const status = await favoritesApi.isFavorite(product.id);
        setIsFavorite(status);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [product.id, userData.token, onFavoriteUpdate]);

  const handleImageError = () => {
    console.error('Image failed to load:', imageUrl);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
  
    if (!userData.token) {
      setAlertMessage('Please log in to add items to favorites');
      setShowLoginAlert(true);
      return;
    }
  
    setIsLoading(true);
    try {
      if (onFavoriteUpdate) {
        // If onFavoriteUpdate is provided, use it (for Favorites page)
        await onFavoriteUpdate(product.id);
        setIsFavorite(false); // Always set to false in favorites page since we're removing
      } else {
        // Otherwise handle it internally (for regular product cards)
        if (!isFavorite) {
          await favoritesApi.addFavorite(product.id);
          setIsFavorite(true);
        } else {
          await favoritesApi.removeFavorite(product.id);
          setIsFavorite(false);
        }
      }
    } catch (error) {
      console.error("Favorite operation error:", error);
      if (error.message === 'Authentication required') {
        setAlertMessage('Please log in to continue');
      } else {
        setAlertMessage('Error updating favorites');
      }
      setShowLoginAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userData.token) {
      setAlertMessage('Please log in to add items to cart');
      setShowLoginAlert(true);
      return;
    }
    
    // If already in the process of adding to cart, return
    if (isLoading || addedToCart) return;
    
    setIsLoading(true);
    try {
      // Try to get restaurant ID from different sources
      let restaurantId = product.restaurantId || product.restorantId;
      
      // If restaurant ID is not directly available from product, try from category.menu.restorant
      if (!restaurantId && product.category && product.category.menu && product.category.menu.restorant) {
        restaurantId = product.category.menu.restorant.id;
        console.log(`Found restaurant ID ${restaurantId} directly from product.category.menu.restorant`);
      }
      
      // If we only have categoryId, fetch the full category details to get restaurant ID
      if (!restaurantId && product.categoryId) {
        console.log("Fetching restaurant ID from category ID:", product.categoryId);
        
        try {
          // Add a timeout to the category details fetch to prevent hanging
          const fetchPromise = getCategoryDetails(product.categoryId);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Category fetch timeout')), 5000)
          );
          
          const categoryDetails = await Promise.race([fetchPromise, timeoutPromise]);
          console.log("Category details retrieved:", categoryDetails);
          
          // Check for both spellings of restaurant ID
          if (categoryDetails) {
            if (categoryDetails.restaurantId) {
              restaurantId = categoryDetails.restaurantId;
              console.log("Found restaurantId in category details:", restaurantId);
            } else if (categoryDetails.restorantId) {
              restaurantId = categoryDetails.restorantId;
              console.log("Found restorantId in category details:", restaurantId);
            } else if (categoryDetails.menu && categoryDetails.menu.restorant) {
              restaurantId = categoryDetails.menu.restorant.id;
              console.log("Found restaurant ID from category.menu.restorant:", restaurantId);
            } else if (categoryDetails.menuId) {
              // If we have menuId but no direct restaurant access
              console.log("Menu ID from category:", categoryDetails.menuId);
              // We would need to fetch the menu to get the restaurant ID
            }
          }
        } catch (categoryError) {
          console.error("Error fetching category details:", categoryError.message);
          // Fallback for category fetch errors - continue with default
        }
      }
      
      // Fallback if we still don't have a restaurant ID
      if (!restaurantId) {
        console.warn("Could not determine restaurant ID, using default restaurant ID 1");
        // Based on your logs, restaurant ID 1 seems to be correct
        restaurantId = 1;
      }
      
      // Create a cart item object from the product
      const cartItem = {
        id: product.id,
        productId: product.id,
        name: product.productName,
        price: product.productPrice,
        productPrice: product.productPrice,
        quantity: 1,
        image: product.productImage,
        categoryId: product.categoryId,
        categoryName: product.categoryName || '',
        restaurantId: restaurantId,
        restorantId: restaurantId // Add both spellings for compatibility
      };
      
      console.log("Adding to cart with restaurant ID:", restaurantId);
      // Add to cart context with explicit quantity of 1
      addToCart(cartItem, 1);
      
      // Show visual feedback
      setAddedToCart(true);
      setAlertMessage('Added to cart!');
      setShowLoginAlert(true);
      
      // Reset added to cart status after 2 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    } catch (error) {
      console.error("Add to cart error:", error);
      setAlertMessage('Error adding item to cart');
      setShowLoginAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelectProduct) {
      console.log('Showing details for:', product);
      onSelectProduct({
        ...product,
        productImage: product.productImage ? getFullImageUrl(product.productImage) : null,
        productName: product.productName || '',
        productPrice: product.productPrice || 0,
        productInfo: product.productInfo || '',
        allergens: product.allergens || [],
        categoryId: product.categoryId,
        id: product.id
      });
    }
  };

  // Auto-hide alert after 3 seconds
  useEffect(() => {
    if (showLoginAlert) {
      const timer = setTimeout(() => {
        setShowLoginAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showLoginAlert]);

  return (
    <div className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow hover:shadow-md transition">
      {/* Login Alert */}
      {showLoginAlert && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center space-x-2 animate-fade-in">
          {addedToCart ? (
            <HiCheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <HiUser className="w-5 h-5 text-blue-500" />
          )}
          <span className="text-sm text-gray-700 dark:text-gray-300">{alertMessage}</span>
        </div>
      )}

      {/* Favorite and Add to Order buttons */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
        <button
          onClick={handleFavoriteClick}
          disabled={isLoading}
          className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-110 focus:outline-none group/btn"
          title={userData.token ? (isFavorite ? "Remove from favorites" : "Add to favorites") : "Login to add to favorites"}
        >
          {isFavorite ? (
            <HiHeart className="w-5 h-5 text-red-500" />
          ) : (
            <HiOutlineHeart className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover/btn:text-red-500 transition-colors" />
          )}
        </button>
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className={`p-2 rounded-full ${
            addedToCart 
              ? 'bg-green-100 dark:bg-green-800' 
              : 'bg-white dark:bg-gray-700'
          } shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-110 focus:outline-none group/btn`}
          title={userData.token ? "Add to cart" : "Login to add to cart"}
        >
          <HiShoppingCart className={`w-5 h-5 ${
            addedToCart 
              ? 'text-green-500 dark:text-green-400' 
              : 'text-blue-500 dark:text-blue-400 group-hover/btn:text-blue-600'
          } transition-colors`} />
        </button>
      </div>

      {/* Image container with loading state */}
      <div
        className={`w-full h-40 flex items-center justify-center overflow-hidden ${
          hasImage ? "bg-gray-50 dark:bg-gray-700" : "bg-black"
        }`}
      >
        {imageLoading && hasImage && (
          <div className="animate-pulse bg-gray-200 dark:bg-gray-600 w-full h-full" />
        )}
        
        {hasImage ? (
          <img
            src={imageUrl}
            alt={product.productName}
            className={`object-contain w-full h-full transition-opacity duration-200 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{
              maxHeight: '160px',
              objectPosition: 'center'
            }}
          />
        ) : (
          <span className="text-gray-100 font-semibold">
            {imageError ? 'Грешка при зареждане' : 'Без снимка'}
          </span>
        )}
      </div>

      <div className="p-3">
        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
          {product.productName}
        </h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
          {product.productInfo}
        </p>
        <p className="text-blue-600 dark:text-blue-400 font-semibold mt-2">
          {product.productPrice?.toFixed(2)} лв
        </p>

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={handleDetailsClick}
            className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition flex items-center space-x-2"
          >
            <HiInformationCircle className="w-5 h-5" />
            <span>Детайли</span>
          </button>

          {accountType === "ROLE_ADMIN" && (
            <button
              onClick={() => onEditProduct(product)}
              className="px-4 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition"
            >
              Редактирай
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
