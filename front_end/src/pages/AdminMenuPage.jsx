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

  const [menuData, setMenuData] = useState({
    name: "Меню",
    menuImage: null,
    id: null,
    error: null,
    textColor: 'text-white'
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

  useEffect(() => {
    if (menuId) {
      loadMenuData();
      loadCategories();
    }
  }, [menuId]);

  const loadMenuData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/menus/${menuId}`, 
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          } 
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const updatedMenuData = {
        name: data.category || "Меню",
        menuImage: data.menuImage || null,
        id: data.id,
        error: null,
        textColor: data.textColor || 'text-white'
      };

      setMenuData(updatedMenuData);

    } catch (error) {
      setMenuData(prev => ({
        ...prev,
        error: error.message
      }));
    }
  };

  const handleBannerUpload = async (file) => {
    try {
      const data = await uploadMenuImageApi(token, menuId, file);

      if (!data.menuImage) {
        throw new Error('No menuImage in upload response');
      }

      setMenuData(prev => ({
        ...prev,
        menuImage: data.menuImage
      }));

      setTimeout(async () => {
        await loadMenuData();
      }, 1000);

      alert('Банерът е качен успешно!');
    } catch (error) {
      alert(`Грешка при качване на банера: ${error.message}`);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchCategoriesByMenuIdApi(token, menuId);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      alert("Грешка при зареждане на категориите");
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
        const formattedProducts = products.map(product => ({
          ...product,
          productImage: product.productImage ? getFullImageUrl(product.productImage) : null,
          productName: product.productName || '',
          productPrice: product.productPrice || 0,
          productInfo: product.productInfo || '',
          allergens: product.allergens || [],
          categoryId: product.categoryId,
          id: product.id
        }));
        setCategoryProducts((prev) => ({ ...prev, [catId]: formattedProducts }));
      } catch (error) {
        console.error('Error loading products:', error);
        alert("Грешка при зареждане на продуктите");
      }
    }
  };

  const handleSelectProduct = (product) => {
    const formattedProduct = {
      ...product,
      productImage: product.productImage ? getFullImageUrl(product.productImage) : null,
      productName: product.productName || '',
      productPrice: product.productPrice || 0,
      productInfo: product.productInfo || '',
      allergens: product.allergens || [],
      categoryId: product.categoryId,
      id: product.id
    };
    setSelectedProduct(formattedProduct);
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

      const catId = editingProduct.categoryId;
      if (catId) {
        const newProducts = await fetchProductsByCategoryIdApi(token, catId);
        setCategoryProducts((prev) => ({ ...prev, [catId]: newProducts }));
      }
    } catch (error) {
      console.error('Error updating product:', error);
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
    } catch (error) {
      console.error('Error deleting product:', error);
      alert("Грешка при изтриване на продукта.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen">
      <MenuBanner
        bannerImage={menuData.menuImage} 
        menuName={menuData.name}
        onBannerUpload={handleBannerUpload}
        isAdmin={accountType === "ROLE_ADMIN"}
        menuId={menuId}
        initialTextColor={menuData.textColor}
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

        {selectedProduct && (
          <DetailsModal product={selectedProduct} onClose={handleCloseModal} />
        )}

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
