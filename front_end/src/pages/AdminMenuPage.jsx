// AdminMenuPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchCategoriesByMenuIdApi,
  fetchProductsByCategoryIdApi,
  updateProductApi,
  deleteProductApi,
  uploadMenuImageApi,
  getFullImageUrl
} from "../api/adminDashboard";

import CategorySection from "../components/CategorySection";
import DetailsModal from "../components/DetailsModal";
import EditProductModal from "../components/EditProductModal";
import MenuBanner from "../components/MenuBanner";

const AdminMenuPage = () => {
  const { menuId } = useParams();
  const token = localStorage.getItem("token");
  const accountType = localStorage.getItem("accountType");

  // Държим реалния пълен URL (а не просто /uploads/...):
  const [menuData, setMenuData] = useState({
    name: "Меню",
    menuImage: null, // Тук ще държим вече готовия URL
  });

  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [categoryProducts, setCategoryProducts] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editInfo, setEditInfo] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);

  // Зареждаме данните при mount
  useEffect(() => {
    if (menuId) {
      loadMenuData();
      loadCategories();
    }
  }, [menuId]);

  // Тук вече получаваме DTO с menuImage = "/uploads/menuImages/10/xyz.jpg"
  // Преобразуваме го чрез getFullImageUrl и го слагаме в state.
  const loadMenuData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/menus/${menuId}`, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        
        // data.menuImage е "/uploads/menuImages/10/..."
        // Превръщаме го в пълен URL
        const fullUrl = data.menuImage ? getFullImageUrl(data.menuImage) : null;

        setMenuData({
          name: data.category || "Меню",
          menuImage: fullUrl // Тук вече е пълният адрес
        });
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
    }
  };

  // Качваме банера => вземаме новия път => правим го на пълен URL => ъпдейтваме state
  const handleBannerUpload = async (file) => {
    try {
      const data = await uploadMenuImageApi(token, menuId, file);
      // data.menuImage = "/uploads/menuImages/..."
      const fullUrl = getFullImageUrl(data.menuImage);

      setMenuData(prev => ({
        ...prev,
        menuImage: fullUrl
      }));
      alert('Банерът е качен успешно!');
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

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };
  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditName(product.productName || "");
    setEditPrice(product.productPrice || "");
    setEditInfo(product.productInfo || "");
    setEditImageFile(null);
  };
  const handleCloseEditModal = () => {
    setEditingProduct(null);
  };

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

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Наистина ли искате да изтриете този продукт?")) {
      return;
    }
    try {
      await deleteProductApi(token, productId);
      alert("Продуктът беше изтрит успешно!");
      setEditingProduct(null);
      // При нужда може да презаредиш категорията
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Грешка при изтриване на продукта.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen">
      {/* Подаваме вече готовия пълен URL към MenuBanner */}
      <MenuBanner
        bannerImage={menuData.menuImage} 
        menuName={menuData.name}
        onBannerUpload={handleBannerUpload}
        isAdmin={accountType === "ROLE_ADMIN"}
      />

      <div className="p-4 sm:p-6">
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
