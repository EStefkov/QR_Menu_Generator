// AdminMenuPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchCategoriesByMenuIdApi,
  fetchProductsByCategoryIdApi,
  updateProductApi,
  deleteProductApi,
  uploadMenuImageApi,
  getFullImageUrl
} from "../api/adminDashboard";
import { AuthContext } from "../contexts/AuthContext";

import CategorySection from "../components/CategorySection";
import DetailsModal from "../components/DetailsModal";
import EditProductModal from "../components/EditProductModal";
import MenuBanner from "../components/MenuBanner";
import { toast } from "react-hot-toast";

const AdminMenuPage = () => {
  const { menuId } = useParams();
  const navigate = useNavigate();
  const { saveRedirectUrl } = useContext(AuthContext);
  const token = localStorage.getItem("token");
  const accountType = localStorage.getItem("accountType");

  const [menuData, setMenuData] = useState({
    name: "Меню",
    menuImage: null,
    defaultProductImage: null,
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
  }, [menuId, token, navigate, saveRedirectUrl]);

  const loadMenuData = async () => {
    try {
      // Allow any user to view the menu (not just logged-in users)
      const headers = token 
        ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        : { 'Accept': 'application/json' };
        
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/menus/${menuId}`, 
        { headers }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const updatedMenuData = {
        name: data.category || "Меню",
        menuImage: data.menuImage || null,
        defaultProductImage: data.defaultProductImage || null,
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

  const handleDefaultProductImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading default product image for menu:', menuId);
      console.log('Using token:', token);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/menus/${menuId}/default-product-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with status:', response.status);
        console.error('Error response:', errorText);
        throw new Error('Failed to upload default product image');
      }

      const updatedMenu = await response.json();
      setMenuData(prev => ({
        ...prev,
        defaultProductImage: updatedMenu.defaultProductImage
      }));
      
      toast.success('Default product image updated successfully');
      
      // Reload menu data to get the updated image
      await loadMenuData();
    } catch (error) {
      console.error('Error uploading default product image:', error);
      toast.error('Failed to upload default product image');
      throw error;
    }
  };

  const loadCategories = async () => {
    try {
      // Use a different approach for non-logged in users
      const headers = token 
        ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        : { 'Accept': 'application/json' };
        
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/categories/menu/${menuId}`, 
        { headers }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const handleToggleCategory = async (catId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));

    if (!categoryProducts[catId]) {
      try {
        // Use a different approach for non-logged in users
        const headers = token 
          ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
          : { 'Accept': 'application/json' };
          
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/category/${catId}`, 
          { headers }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
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
        setCategoryProducts((prev) => ({ ...prev, [catId]: [] }));
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
        onDefaultProductImageUpload={handleDefaultProductImageUpload}
        defaultProductImage={menuData.defaultProductImage}
        isAdmin={token && accountType === "ROLE_ADMIN"}
        menuId={menuId}
        initialTextColor={menuData.textColor}
      />

      {/* Add a login prompt for non-logged in users */}
      {!token && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 mb-4 rounded-lg flex justify-between items-center">
          <p className="text-blue-700 dark:text-blue-300">
            Log in to save this menu or place orders.
          </p>
          <button
            onClick={() => {
              const currentPath = `/menu/${menuId}`;
              saveRedirectUrl(currentPath);
              navigate('/login');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log In
          </button>
        </div>
      )}

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
