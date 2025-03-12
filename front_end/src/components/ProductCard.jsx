// ProductCard.jsx
import React from "react";

// Постави реалния адрес на бекенда
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Хелпър функция за пълния път към снимката
function getFullImageUrl(productImage) {
  if (!productImage) {
    return "";
  }
  return API_BASE_URL + productImage;
}

const ProductCard = ({ product, onSelectProduct, onEditProduct, accountType }) => {
  const imageUrl = getFullImageUrl(product.productImage);
  const hasImage = imageUrl !== "";

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow hover:shadow-md transition">
      {/* Блок с картинка или цветен фон */}
      <div
        className={`w-full h-40 flex items-center justify-center overflow-hidden ${
          hasImage
            ? "bg-gray-50 dark:bg-gray-700"
            : "bg-blue-100 dark:bg-green-700"
        }`}
      >
        {hasImage ? (
          <img
            src={imageUrl}
            alt={product.productName}
            className="object-cover h-full"
          />
        ) : (
          <span className="text-gray-700 dark:text-gray-100 font-semibold">
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

        {/* Бутоните "Виж детайли" и (ако е админ) "Редактирай" */}
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
