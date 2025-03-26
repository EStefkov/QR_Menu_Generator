// DetailsModal.jsx
import React from "react";

// Постави реалния адрес на бекенда
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Хелпър функция да върнем пълен URL за снимката на продукта
function getFullImageUrl(productImage) {
  if (!productImage) {
    return "";
  }
  // If the image URL already starts with http or https, return it as is
  if (productImage.startsWith('http://') || productImage.startsWith('https://')) {
    return productImage;
  }
  // Otherwise, prepend the API base URL
  return API_BASE_URL + productImage;
}

// Примерен мап за алерген -> иконка (път до PNG/SVG файлове в public/allergens/)
const allergenIconMap = {
  "Gluten": "/allergens/Gluten.png",
  "Crustaceans": "/allergens/Crustaceans.png",
  "Eggs": "/allergens/Egg.png",
  "Fish": "/allergens/Fish.png",
  "Peanuts": "/allergens/Peanut.png",
  "Soybeans": "/allergens/Soya.png",
  "Milk": "/allergens/Milk.png",
  "Nuts": "/allergens/Nuts.png",
  "Celery": "/allergens/Celery.png",
  "Mustard": "/allergens/Mustard.png",
  "Sesame": "/allergens/Sesame.png",
  "Sulphur dioxide and sulphites": "/allergens/Sulphites.png",
  "Lupin": "/allergens/Lupin.png",
  "Molluscs": "/allergens/Molluscs.png"
};

const DetailsModal = ({ product, onClose }) => {
  const imageUrl = getFullImageUrl(product.productImage);
  const hasImage = imageUrl !== "";

  // product.allergens може да е масив от обекти, напр. [{ id:1, allergenName: 'Gluten' }, ...]
  // или директно [{ allergenName: 'Gluten' }] - зависи как е върнато от API.
  const allergens = product.allergens || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-2 relative">
        <button
          className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          onClick={onClose}
        >
          X
        </button>

        <div className="flex flex-col items-center">
          <div
            className={`w-full h-48 mb-4 flex items-center justify-center overflow-hidden ${
              hasImage
                ? "bg-gray-100 dark:bg-gray-700"
                : "bg-green-100 dark:bg-green-700"
            }`}
          >
            {hasImage ? (
              <img
                src={imageUrl}
                alt={product.productName}
                className="object-contain w-full h-full"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = ""; // Clear the src to show the fallback
                }}
              />
            ) : (
              <span className="text-gray-700 dark:text-gray-100 font-semibold">
                Без снимка
              </span>
            )}
          </div>

          {/* Име, инфо, цена */}
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
            {product.productName}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            {product.productInfo}
          </p>
          <p className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-4">
            {product.productPrice?.toFixed(2)} лв
          </p>

          {/* Секция за алергени */}
          {allergens.length > 0 && (
            <div className="w-full mb-4">
              <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
                Алергени
              </h4>
              <div className="flex flex-wrap gap-2">
                {allergens.map((allergen) => {
                  // Handle both string and object formats
                  const allergenName = typeof allergen === 'string' ? allergen : (allergen.allergenName || allergen.name);
                  const iconPath = allergenIconMap[allergenName];
                  return (
                    <div
                      key={typeof allergen === 'string' ? allergen : (allergen.id || allergenName)}
                      className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 rounded p-2"
                    >
                      {iconPath ? (
                        <img
                          src={iconPath}
                          alt={allergenName}
                          className="w-6 h-6"
                        />
                      ) : null}
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {allergenName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {allergens.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">
              Няма въведени алергени за този продукт.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
