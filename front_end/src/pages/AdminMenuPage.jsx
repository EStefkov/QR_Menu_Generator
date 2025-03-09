import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchCategoriesByMenuIdApi,
  fetchProductsByCategoryIdApi,
  updateProductApi,
} from "../api/adminDashboard";

// Постави реалния адрес на бек-енда
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Ако productImage започва с "/uploads", връща "http://localhost:8080/uploads/...".
 * Ако е null/undefined, връщаме празен стринг.
 */
function getFullImageUrl(productImage) {
  if (!productImage) {
    return "";
  }
  return API_BASE_URL + productImage;
}

function MenuPage() {
  const { menuId } = useParams();
  const token = localStorage.getItem("token");
  const accountType = localStorage.getItem("accountType");

  // Категории, разгънати категории и продукти
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [categoryProducts, setCategoryProducts] = useState({});

  // Модал за детайли
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Модал за редактиране (форма)
  const [editingProduct, setEditingProduct] = useState(null);

  // Полета за редактиране (temp), когато сме отворили формата
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editInfo, setEditInfo] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);

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
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));

    if (!categoryProducts[catId]) {
      try {
        const products = await fetchProductsByCategoryIdApi(token, catId);
        setCategoryProducts((prev) => ({ ...prev, [catId]: products }));
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
  };

  // Модал за детайли
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };
  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  // Модал за редактиране: при клик на "Редактирай" отваряме форма
  const handleEditProduct = (product) => {
    setEditingProduct(product);

    // Попълваме началните стойности в state
    setEditName(product.productName || "");
    setEditPrice(product.productPrice || "");
    setEditInfo(product.productInfo || "");
    setEditImageFile(null); // без файл по подразбиране
  };

  const handleCloseEditModal = () => {
    setEditingProduct(null);
  };

  // Примерна логика за записване на промени (без реално API в примера)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
  
    // Създаваме FormData, ако бекендът очаква multipart
    let formData = new FormData();
    formData.append("productName", editName);
    formData.append("productPrice", editPrice);
    formData.append("productInfo", editInfo);
  
    if (editImageFile) {
      formData.append("productImage", editImageFile);
    }
  
    try {
      await updateProductApi(token, editingProduct.id, formData);
  
      alert("Продуктът е успешно обновен!");
  
      // Затваряме модала
      setEditingProduct(null);
  
      // (По желание) презареди продуктите в категорията, за да отразим промяната веднага
      // Примерно, ако editingProduct.categoryId съществува, викаш отново fetchProductsByCategoryIdApi(...)
      const catId = editingProduct.categoryId;
      if (catId) {
        const newProducts = await fetchProductsByCategoryIdApi(token, catId);
        setCategoryProducts((prev) => ({ ...prev, [catId]: newProducts }));
      }
  
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Неуспешен ъпдейт на продукт!");
    }
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

              {/* Продуктите в тази категория (ако е разгъната) */}
              {isExpanded && (
                <div className="p-4 bg-white dark:bg-gray-800">
                  {categoryProducts[cat.id]?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {categoryProducts[cat.id].map((product) => {
                        const imageUrl = getFullImageUrl(product.productImage);
                        const hasImage = imageUrl !== "";

                        return (
                          <div
                            key={product.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow hover:shadow-md transition"
                          >
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
                                  onClick={() => handleSelectProduct(product)}
                                  className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                                >
                                  Детайли
                                </button>

                                {accountType === "ROLE_ADMIN" && (
                                  <button
                                    onClick={() => handleEditProduct(product)}
                                    className="px-4 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition"
                                  >
                                    Редактирай
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
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

      {/* Модал за "Виж детайли" */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-2 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              onClick={handleCloseModal}
            >
              X
            </button>
            <div className="flex flex-col items-center">
              {(() => {
                const imageUrl = getFullImageUrl(selectedProduct.productImage);
                const hasImage = imageUrl !== "";
                return (
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
                        alt={selectedProduct.productName}
                        className="object-cover h-full"
                      />
                    ) : (
                      <span className="text-gray-700 dark:text-gray-100 font-semibold">
                        Без снимка
                      </span>
                    )}
                  </div>
                );
              })()}
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

      {/* Модал за РЕДАКЦИЯ на продукт */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-2 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              onClick={handleCloseEditModal}
            >
              X
            </button>

            {/* ФОРМА ЗА РЕДАКЦИЯ */}
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              Редактирай продукт
            </h2>
            <form onSubmit={handleSaveProduct} className="space-y-4 w-full">
              {/* Име на продукта */}
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-200">Име на продукта</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              {/* Цена */}
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-200">Цена</label>
                <input
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              {/* Описание */}
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-200">Описание</label>
                <textarea
                  value={editInfo}
                  onChange={(e) => setEditInfo(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                ></textarea>
              </div>

              {/* Снимка */}
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-200">Нова снимка</label>
                <input
                  type="file"
                  onChange={(e) => setEditImageFile(e.target.files[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                             file:rounded file:border-0
                             file:text-sm file:font-semibold
                             file:bg-blue-50 file:text-blue-700
                             hover:file:bg-blue-100
                             dark:file:bg-gray-700 dark:file:text-gray-100
                             dark:hover:file:bg-gray-600"
                />
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Запиши
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuPage;