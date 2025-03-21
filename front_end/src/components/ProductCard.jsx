// ProductCard.jsx
import React, { useState } from "react";
import { getFullImageUrl } from "../api/adminDashboard";

const ProductCard = ({ product, onSelectProduct, onEditProduct, accountType }) => {
  const [imageError, setImageError] = useState(false);

  // Ако productImage го има, вземи пълния URL чрез getFullImageUrl, иначе върни празен низ
  const imageUrl = product?.productImage ? getFullImageUrl(product.productImage) : "";
  // hasImage е true само ако имаме URL и досега не е имало грешка при зареждане
  const hasImage = imageUrl && !imageError;

  const handleImageError = () => {
    console.error('Failed to load image:', imageUrl);
    // При грешка казваме, че изображението е невалидно
    setImageError(true);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow hover:shadow-md transition">
      {/* Блок с картинка или черен фон */}
      <div
        className={`w-full h-40 flex items-center justify-center overflow-hidden ${
          hasImage ? "bg-gray-50 dark:bg-gray-700" : "bg-black"
        }`}
      >
        {hasImage ? (
          <img
            src={imageUrl}
            alt={product.productName}
            className="object-contain w-full h-full"
            onError={handleImageError}
            style={{
              maxHeight: '160px',
              objectPosition: 'center'
            }}
          />
        ) : (
          <span className="text-gray-100 font-semibold">
            Без снимка
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
