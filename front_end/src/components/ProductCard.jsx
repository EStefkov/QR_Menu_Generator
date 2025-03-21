// ProductCard.jsx
import React, { useState, useEffect } from "react";
import { getFullImageUrl } from "../api/adminDashboard";

const ProductCard = ({ product, onSelectProduct, onEditProduct, accountType }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

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

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow hover:shadow-md transition">
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
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {product.productInfo}
        </p>
        <p className="text-blue-600 dark:text-blue-400 font-semibold mt-2">
          {product.productPrice?.toFixed(2)} лв
        </p>

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => onSelectProduct(product)}
            className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
          >
            Детайли
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
