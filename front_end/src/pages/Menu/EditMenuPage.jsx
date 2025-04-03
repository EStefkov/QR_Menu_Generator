import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiSave, HiPlus, HiTrash, HiPencil, HiDocumentAdd, HiRefresh, HiX } from 'react-icons/hi';
import { restaurantApi } from '../../api/restaurantApi';
import { useLanguage } from '../../contexts/LanguageContext';

// TabPanel component for the tabs
const TabPanel = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index} className="py-4">
      {value === index && children}
    </div>
  );
};

// ProductForm component for adding new products
const ProductForm = ({ categoryId, onSuccess, onCancel }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    productName: '',
    productPrice: '',
    productInfo: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Add allergens state
  const [allergens, setAllergens] = useState([]);
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [loadingAllergens, setLoadingAllergens] = useState(true);
  
  // Fetch allergens on component mount
  useEffect(() => {
    const fetchAllergens = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/allergens`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch allergens');
        }
        
        const data = await response.json();
        setAllergens(data);
      } catch (err) {
        console.error('Error loading allergens:', err);
      } finally {
        setLoadingAllergens(false);
      }
    };
    
    fetchAllergens();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add allergen toggle handler
  const handleAllergenToggle = (allergenId) => {
    setSelectedAllergens(prev => {
      if (prev.includes(allergenId)) {
        return prev.filter(id => id !== allergenId);
      } else {
        return [...prev, allergenId];
      }
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setImagePreview(null);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.productPrice) {
      setError(t('validation.requiredFields') || 'Name and price are required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const submitData = new FormData();
      submitData.append('productName', formData.productName);
      submitData.append('productPrice', formData.productPrice);
      submitData.append('productInfo', formData.productInfo || '');
      submitData.append('categoryId', categoryId);
      
      if (selectedImage) {
        submitData.append('productImage', selectedImage);
      }
      
      // Add allergens to form data
      selectedAllergens.forEach(allergenId => {
        submitData.append('allergenIds', allergenId);
      });
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create product (${response.status})`);
      }
      
      const newProduct = await response.json();
      onSuccess(newProduct);
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-auto overflow-y-auto max-h-[90vh]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {t('products.addNew') || 'Add New Product'}
            </h3>
            <button 
              onClick={onCancel}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('products.name') || 'Product Name'} *
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('products.namePlaceholder') || 'Enter product name'}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('products.price') || 'Price'} *
              </label>
              <input
                type="text"
                name="productPrice"
                value={formData.productPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('products.pricePlaceholder') || 'Enter price'}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('products.description') || 'Description'}
              </label>
              <textarea
                name="productInfo"
                value={formData.productInfo}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('products.descriptionPlaceholder') || 'Enter product description'}
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('products.image') || 'Product Image'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-24 object-contain rounded-md"
                  />
                </div>
              )}
            </div>
            
            {/* Allergens section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('products.allergens') || 'Allergens (optional)'}
              </label>
              
              {loadingAllergens ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('loading') || 'Loading...'}
                </div>
              ) : allergens.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('products.noAllergensAvailable') || 'No allergens available or failed to load.'}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {allergens.map(allergen => (
                    <label key={allergen.id} className="inline-flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        checked={selectedAllergens.includes(allergen.id)}
                        onChange={() => handleAllergenToggle(allergen.id)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200">
                        {allergen.allergenName}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting 
                  ? t('common.saving') || 'Saving...' 
                  : t('common.save') || 'Save'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const EditMenuPage = () => {
  const { menuId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Get state passed from the navigation
  const { restaurantId, restaurantName, backUrl } = location.state || {};
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Menu state
  const [menu, setMenu] = useState(null);
  const [menuName, setMenuName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Categories state
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  // Products state
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  
  useEffect(() => {
    fetchMenuData();
  }, [menuId]);
  
  const fetchMenuData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch menu data
      const menuData = await restaurantApi.getMenuById(menuId);
      setMenu(menuData);
      setMenuName(menuData.category || menuData.name || '');
      
      // Fetch categories for this menu
      const categoriesData = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/menu/${menuId}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      }).then(res => res.json());
      
      setCategories(categoriesData || []);
      
      // If we have categories, fetch products for the first category
      if (categoriesData && categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0]);
        await fetchProductsForCategory(categoriesData[0].id);
      }
    } catch (err) {
      console.error('Error fetching menu data:', err);
      setError(err.message || 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProductsForCategory = async (categoryId) => {
    try {
      const productsData = await fetch(`${import.meta.env.VITE_API_URL}/api/products/category/${categoryId}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      }).then(res => res.json());
      
      setProducts(productsData || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };
  
  const handleSaveMenu = async () => {
    if (!menuName.trim()) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      await restaurantApi.updateMenu(menuId, {
        category: menuName,
        name: menuName,
        restaurantId: parseInt(restaurantId, 10)
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating menu:', err);
      setError(err.message || 'Failed to update menu');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setIsAddingCategory(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newCategoryName,
          menuId: parseInt(menuId, 10)
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create category (${response.status})`);
      }
      
      const newCategory = await response.json();
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
      setSelectedCategory(newCategory);
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err.message || 'Failed to create category');
    } finally {
      setIsAddingCategory(false);
    }
  };
  
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm(t('categories.confirmDelete') || 'Are you sure you want to delete this category?')) return;
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
      // If the deleted category was selected, select another one if available
      if (selectedCategory && selectedCategory.id === categoryId) {
        const remainingCategories = categories.filter(cat => cat.id !== categoryId);
        if (remainingCategories.length > 0) {
          setSelectedCategory(remainingCategories[0]);
          await fetchProductsForCategory(remainingCategories[0].id);
        } else {
          setSelectedCategory(null);
          setProducts([]);
        }
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Failed to delete category');
    }
  };
  
  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    await fetchProductsForCategory(category.id);
  };

  const handleAddProduct = () => {
    if (!selectedCategory) return;
    setShowAddProduct(true);
  };
  
  const handleProductCreated = async (newProduct) => {
    // Add the new product to our products list
    setProducts(prev => [...prev, newProduct]);
    
    // Close the form
    setShowAddProduct(false);
    
    // Optionally show a success message
    alert(t('products.createSuccess') || 'Product created successfully!');
  };
  
  const handleDeleteProduct = async (productId) => {
    // Show confirmation dialog
    if (!window.confirm(t('products.confirmDelete') || 'Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      // Call the API to delete the product
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete product (${response.status})`);
      }
      
      // Remove the product from the products list
      setProducts(prev => prev.filter(product => product.id !== productId));
      
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(t('errors.failedToDeleteProduct') || 'Failed to delete product. Please try again.');
    }
  };
  
  const handleGoBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-5 rounded-lg">
          <h3 className="font-bold text-lg mb-2">{t('errors.loadFailed') || 'Failed to load data'}</h3>
          <p>{error}</p>
          <button
            onClick={fetchMenuData}
            className="mt-4 flex items-center bg-red-100 hover:bg-red-200 dark:bg-red-800/30 dark:hover:bg-red-700/30 text-red-800 dark:text-red-300 font-medium py-2 px-4 rounded-lg"
          >
            <HiRefresh className="w-5 h-5 mr-2" />
            {t('common.retry') || 'Retry'}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={handleGoBack}
            className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <HiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {t('menus.editMenu') || 'Edit Menu'}
            </h1>
            {restaurantName && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {restaurantName}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block p-4 ${
                activeTab === 0
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab(0)}
            >
              {t('menus.details') || 'Menu Details'}
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 ${
                activeTab === 1
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab(1)}
            >
              {t('categories.manage') || 'Categories & Products'}
            </button>
          </li>
        </ul>
      </div>
      
      {/* Menu Details Tab */}
      <TabPanel value={activeTab} index={0}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('menus.details') || 'Menu Details'}
          </h2>
          
          {saveSuccess && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md">
              {t('menus.saveSuccess') || 'Menu updated successfully!'}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('menus.name') || 'Menu Name'} *
            </label>
            <input
              type="text"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={t('menus.namePlaceholder') || 'Enter menu name'}
            />
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleSaveMenu}
              disabled={isSaving || !menuName.trim()}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiSave className="mr-2 h-5 w-5" />
              {isSaving ? t('common.saving') || 'Saving...' : t('common.save') || 'Save'}
            </button>
          </div>
        </div>
      </TabPanel>
      
      {/* Categories & Products Tab */}
      <TabPanel value={activeTab} index={1}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Categories Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              {t('categories.title') || 'Categories'}
            </h2>
            
            {/* Add new category form */}
            <div className="flex items-center mb-4">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('categories.namePlaceholder') || 'New category name'}
              />
              <button
                onClick={handleAddCategory}
                disabled={isAddingCategory || !newCategoryName.trim()}
                className="px-3 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiPlus className="h-5 w-5" />
              </button>
            </div>
            
            {/* Categories list */}
            <div className="space-y-2 mt-4">
              {categories.length > 0 ? (
                categories.map(category => (
                  <div 
                    key={category.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                      selectedCategory && selectedCategory.id === category.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {category.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <HiTrash className="h-5 w-5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  {t('categories.noCategories') || 'No categories yet'}
                </div>
              )}
            </div>
          </div>
          
          {/* Products Section */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {selectedCategory ? `${t('products.title') || 'Products'}: ${selectedCategory.name}` : t('products.title') || 'Products'}
              </h2>
              
              {selectedCategory && (
                <button
                  onClick={handleAddProduct}
                  className="flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <HiDocumentAdd className="mr-2 h-5 w-5" />
                  {t('products.addNew') || 'Add Product'}
                </button>
              )}
            </div>
            
            {selectedCategory ? (
              products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map(product => (
                    <div 
                      key={product.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-start"
                    >
                      {product.imageUrl && (
                        <img 
                          src={product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.VITE_API_URL}${product.imageUrl}`}
                          alt={product.productName}
                          className="w-20 h-20 object-cover rounded-md mr-4"
                        />
                      )}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {product.productName}
                          </h3>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            ${product.productPrice}
                          </span>
                        </div>
                        {product.productInfo && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                            {product.productInfo}
                          </p>
                        )}
                        <div className="flex mt-2">
                          <button
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          >
                            <HiPencil className="h-5 w-5" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <HiTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="mb-4">{t('products.noProducts') || 'No products in this category'}</p>
                  <button
                    onClick={handleAddProduct}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <HiPlus className="mr-2 h-5 w-5" />
                    {t('products.addFirst') || 'Add your first product'}
                  </button>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>{t('products.selectCategory') || 'Select a category to manage products'}</p>
              </div>
            )}
          </div>
        </div>
      </TabPanel>
      
      {/* Create Product Form */}
      {showAddProduct && selectedCategory && (
        <ProductForm 
          categoryId={selectedCategory.id}
          onSuccess={handleProductCreated}
          onCancel={() => setShowAddProduct(false)}
        />
      )}
    </div>
  );
};

export default EditMenuPage; 