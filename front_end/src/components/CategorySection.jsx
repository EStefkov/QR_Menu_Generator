// CategorySection.jsx
import React from "react";
import ProductCard from "./ProductCard";
 const CategorySection = ({
  category,
  products,
  isExpanded,
  onToggleCategory,
  onSelectProduct,
  onEditProduct,
  accountType,
}) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
      <button
        onClick={() => onToggleCategory(category.id)}
        className="w-full flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
      >
        <span className="font-semibold text-gray-800 dark:text-gray-100">
          {category.name}
        </span>
        <span className="text-gray-600 dark:text-gray-300">
          {isExpanded ? "–" : "+"}
        </span>
      </button>

      {/* Продуктите в тази категория (ако е разгъната) */}
      {isExpanded && (
        <div className="p-4 bg-white dark:bg-gray-800">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  onEditProduct={onEditProduct}
                  accountType={accountType}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              Няма продукти в тази категория.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySection;
