import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchCategoriesByMenuIdApi,
  fetchProductsByCategoryIdApi
} from "../api/adminDashboard";

function MenuPage() {
  const { menuId } = useParams();
  const token = localStorage.getItem("token");

  // Държим списъка с категории
  const [categories, setCategories] = useState([]);
  // Дали категорията е „отворена“ (expanded) – map (или set)
  const [expandedCategories, setExpandedCategories] = useState({});
  // Продуктите за всяка категория: { [catId]: [продукти] }
  const [categoryProducts, setCategoryProducts] = useState({});
  // Когато потребителят кликне върху конкретен продукт – отваряме модал
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (menuId) {
      loadCategories();
    }
  }, [menuId]);

  const loadCategories = async () => {
    try {
      const data = await fetchCategoriesByMenuIdApi(token, menuId);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleToggleCategory = async (catId) => {
    // Ако вече е „отворена“, тогава при повторен клик я затваряме:
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));

    // Ако досега не сме зареждали продуктите за тази категория, извлечи ги:
    if (!categoryProducts[catId]) {
      try {
        const products = await fetchProductsByCategoryIdApi(token, catId);
        setCategoryProducts((prev) => ({
          ...prev,
          [catId]: products,
        }));
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Меню № {menuId}
      </h1>

      {/* Списък с категории */}
      <div className="space-y-4">
        {categories.length === 0 && (
          <p className="text-gray-600 dark:text-gray-300">
            Няма категории за това меню или все още не са заредени.
          </p>
        )}

        {categories.map((cat) => {
          const isExpanded = expandedCategories[cat.id] || false;
          return (
            <div
              key={cat.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              {/* Заглавие на категорията */}
              <button
                onClick={() => handleToggleCategory(cat.id)}
                className="w-full flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {cat.name}
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  {isExpanded ? "–" : "+"}
                </span>
              </button>

              {/* Контейнер за продуктите в тази категория (ако е отворена) */}
              {isExpanded && (
                <div className="p-4 bg-white dark:bg-gray-800">
                  {categoryProducts[cat.id]?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {categoryProducts[cat.id].map((product) => (
                        <div
                          key={product.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow hover:shadow-md transition"
                        >
                          <div className="w-full h-40 bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                            {/* Продуктово изображение */}
                            <img
                              src={product.productImage || "/placeholder.png"}
                              alt={product.productName}
                              className="object-cover h-full"
                            />
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
                            <button
                              onClick={() => handleSelectProduct(product)}
                              className="mt-3 inline-block px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                            >
                              Виж детайли
                            </button>
                          </div>
                        </div>
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
        })}
      </div>

      {/* Модал за детайли на продукт */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          {/* Content */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-2 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              onClick={handleCloseModal}
            >
              X
            </button>
            <div className="flex flex-col items-center">
              {/* Голяма снимка */}
              <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedProduct.productImage || "/placeholder.png"}
                  alt={selectedProduct.productName}
                  className="object-cover h-full"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {selectedProduct.productName}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {selectedProduct.productInfo}
              </p>
              <p className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                {selectedProduct.productPrice?.toFixed(2)} лв
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuPage;
