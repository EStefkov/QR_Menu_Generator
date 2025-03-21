// AdminMenuPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchCategoriesByMenuIdApi,
  fetchProductsByCategoryIdApi,
  updateProductApi,
  deleteProductApi
} from "../api/adminDashboard";

import CategorySection from "../components/CategorySection";
import DetailsModal from "../components/DetailsModal";
import EditProductModal from "../components/EditProductModal";
import MenuBanner from "../components/MenuBanner";

const AdminMenuPage = () => {
  const { menuId } = useParams();
  const token = localStorage.getItem("token");
  const accountType = localStorage.getItem("accountType");

  // Добавяме state за банера и името на менюто
  const [menuData, setMenuData] = useState({
    name: "Меню",
    bannerImage: null
  });

  // Категории и разгъната им част
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  // Продукти за всяка категория
  const [categoryProducts, setCategoryProducts] = useState({});
  // За двата модала (детайли/редакция)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Полета за редактиране (когато отворим EditProductModal)
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editInfo, setEditInfo] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);

  // Зареждаме данните за менюто и категориите при mount
  useEffect(() => {
    if (menuId) {
      loadMenuData();
      loadCategories();
    }
  }, [menuId]);

  const loadMenuData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/menus/${menuId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMenuData({
          name: data.name || "Меню",
          bannerImage: data.bannerImage
        });
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
    }
  };

  const handleBannerUpload = async (file) => {
    const formData = new FormData();
    formData.append('banner', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/menus/${menuId}/banner`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setMenuData(prev => ({
          ...prev,
          bannerImage: data.bannerImage
        }));
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Грешка при качване на банера');
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchCategoriesByMenuIdApi(token, menuId);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Разгъване/сгъване на категория + зареждане на продуктите, ако ги нямаме
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

  // Отваряне на модала за детайли
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  // Затваряне на модала с детайли
  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  // Отваряне на формата за редактиране
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditName(product.productName || "");
    setEditPrice(product.productPrice || "");
    setEditInfo(product.productInfo || "");
    setEditImageFile(null);
  };

  // Затваряне на формата за редактиране
  const handleCloseEditModal = () => {
    setEditingProduct(null);
  };

  // Запазване на редактирания продукт
  const handleSaveProduct = async (e) => {
    e.preventDefault();

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
      setEditingProduct(null);

      // Презареждаме продуктите след ъпдейта
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

  // Функция за изтриване на продукта
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Наистина ли искате да изтриете този продукт?")) {
      return;
    }
    try {
      await deleteProductApi(token, productId);
      alert("Продуктът беше изтрит успешно!");

      // Затваряме EditProductModal
      setEditingProduct(null);

      // (По желание) презареждаме списъка с продукти
      // Ако имаш данни за categoryId (editingProduct.categoryId), може да презаредиш конкретно нея
      // Но, тъй като editingProduct вече е null, трябва да го запазим временно, 
      // или да си предадем productId => catId по друг начин.
      // Пример, ако си пазил oldCategoryId, може:
      //   const newProducts = await fetchProductsByCategoryIdApi(token, oldCategoryId);
      //   setCategoryProducts((prev) => ({ ...prev, [oldCategoryId]: newProducts }));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Грешка при изтриване на продукта.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen">
      {/* Add MenuBanner at the top */}
      <MenuBanner
        bannerImage={menuData.bannerImage}
        menuName={menuData.name}
        onBannerUpload={handleBannerUpload}
        isAdmin={accountType === "ROLE_ADMIN"}
      />

      <div className="p-4 sm:p-6">
        {/* Списък с категории */}
        <div className="space-y-4">
          {categories.length === 0 && (
            <p className="text-gray-600 dark:text-gray-300">
              Няма категории за това меню или все още не са заредени.
            </p>
          )}

          {categories.map((cat) => {
            const isExpanded = expandedCategories[cat.id] || false;
            const products = categoryProducts[cat.id] || [];

            return (
              <CategorySection
                key={cat.id}
                category={cat}
                products={products}
                isExpanded={isExpanded}
                onToggleCategory={handleToggleCategory}
                onSelectProduct={handleSelectProduct}
                onEditProduct={handleEditProduct}
                accountType={accountType}
              />
            );
          })}
        </div>

        {/* Модал за "Виж детайли" */}
        {selectedProduct && (
          <DetailsModal product={selectedProduct} onClose={handleCloseModal} />
        )}

        {/* Модал за РЕДАКЦИЯ */}
        {editingProduct && (
          <EditProductModal
            editingProduct={editingProduct}
            editName={editName}
            editPrice={editPrice}
            editInfo={editInfo}
            setEditName={setEditName}
            setEditPrice={setEditPrice}
            setEditInfo={setEditInfo}
            setEditImageFile={setEditImageFile}
            onDelete={handleDeleteProduct}
            onSave={handleSaveProduct}
            onClose={handleCloseEditModal}
          />
        )}
      </div>
    </div>
  );
};

export default AdminMenuPage;
