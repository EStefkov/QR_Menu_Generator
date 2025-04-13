import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiSave, HiPlus, HiTrash, HiPencil, HiDocumentAdd, HiRefresh, HiX } from 'react-icons/hi';
import { restaurantApi } from '../../api/restaurantApi';
import { useLanguage } from '../../contexts/LanguageContext';
import { ImSpinner8 } from 'react-icons/im';
import { BsPencil, BsTrash, BsImage } from 'react-icons/bs';

// TabPanel component for the tabs
const TabPanel = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index} className="py-4">
      {value === index && children}
    </div>
  );
};

// ProductForm component for adding new products
const ProductForm = ({ categoryId, onSuccess, onCancel, editProduct }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    productName: editProduct?.productName || '',
    productPrice: editProduct?.productPrice || '',
    productInfo: editProduct?.productInfo || ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    editProduct?.productImage 
      ? `${import.meta.env.VITE_API_URL}${editProduct.productImage}` 
      : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Add allergens state
  const [allergens, setAllergens] = useState([]);
  const [selectedAllergens, setSelectedAllergens] = useState(editProduct?.allergens?.map(a => a.id) || []);
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
          throw new Error(t('errors.failedToFetchAllergens') || 'Failed to fetch allergens');
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
  }, [t]);
  
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
      
      let response;
      
      if (editProduct) {
        // Update existing product
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${editProduct.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: submitData
        });
      } else {
        // Create new product
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: submitData
        });
      }
      
      if (!response.ok) {
        throw new Error(t('errors.failedToCreateProduct', { status: response.status }) || `Failed to ${editProduct ? 'update' : 'create'} product (${response.status})`);
      }
      
      const productData = await response.json();
      onSuccess(productData);
    } catch (err) {
      console.error(`Error ${editProduct ? 'updating' : 'creating'} product:`, err);
      setError(err.message || t('errors.productCreationFailed') || `Failed to ${editProduct ? 'update' : 'create'} product`);
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
              {editProduct 
                ? t('products.editProduct') || 'Edit Product' 
                : t('products.addNew') || 'Add New Product'
              }
            </h3>
            <button 
              onClick={onCancel}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label={t('common.close') || 'Close'}
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
                  {t('common.loading') || 'Loading...'}
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
                        aria-label={t('products.toggleAllergen', { allergen: allergen.allergenName }) || `Toggle ${allergen.allergenName} allergen`}
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
  const { restaurantId, restaurantName, backUrl, fromManager, returnPath, activeTab: initialActiveTab } = location.state || {};
  
  // Tab state - use the initialActiveTab if provided
  const [activeTab, setActiveTab] = useState(initialActiveTab === 'categories' ? 1 : 0);
  
  // Menu state
  const [menu, setMenu] = useState(null);
  const [menuName, setMenuName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Image state
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [defaultProductImage, setDefaultProductImage] = useState(null);
  const [defaultProductPreview, setDefaultProductPreview] = useState(null);
  
  // Categories state
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  // Products state
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  
  useEffect(() => {
    fetchMenuData();
  }, [menuId]);
  
  // Handle banner image change
  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert(t('images.sizeLimit') || 'Image size should be less than 5MB');
      return;
    }
    
    if (!file.type.match('image.*')) {
      alert(t('images.formatError') || 'Please select an image file');
      return;
    }
    
    setBannerImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle default product image change
  const handleDefaultImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert(t('images.sizeLimit') || 'Image size should be less than 5MB');
      return;
    }
    
    if (!file.type.match('image.*')) {
      alert(t('images.formatError') || 'Please select an image file');
      return;
    }
    
    setDefaultProductImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setDefaultProductPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const fetchMenuData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch menu data
      const menuData = await restaurantApi.getMenuById(menuId);
      console.log("Fetched menu data:", menuData);
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
      const menuData = {
        category: menuName,
        name: menuName,
        restaurantId: parseInt(restaurantId, 10)
      };
      
      // Use the restaurantApi method to update menu with images
      const updatedMenu = await restaurantApi.updateMenuWithImages(menuId, menuData, bannerImage, defaultProductImage);
      
      // Update the local menu state with the response
      setMenu(updatedMenu);
      
      // Clear image states
      setBannerImage(null);
      setDefaultProductImage(null);
      
      // Show success message
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
    if (productToEdit) {
      // Update the existing product in the list
      setProducts(prev => prev.map(p => p.id === newProduct.id ? newProduct : p));
      setProductToEdit(null);
    } else {
      // Add the new product to our products list
      setProducts(prev => [...prev, newProduct]);
    }
    
    // Close the form
    setShowAddProduct(false);
    
    // Optionally show a success message
    const message = productToEdit 
      ? (t('products.updateSuccess') || 'Product updated successfully!')
      : (t('products.createSuccess') || 'Product created successfully!');
    alert(message);
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
  
  const handleApplyDefaultImageToAllProducts = async () => {
    const defaultImage = menu?.defaultProductImage || menu?.defaultProductImageUrl;
    if (!defaultImage) {
      alert(t('menus.noDefaultImageToApply') || 'No default image available to apply');
      return;
    }
    
    if (products.length === 0) {
      alert(t('products.noProducts') || 'No products available to apply default image');
      return;
    }
    
    if (!window.confirm(t('menus.confirmApplyToAll') || 'Are you sure you want to apply the default image to all products without images?')) {
      return;
    }
    
    try {
      console.log("Applying default image to all products");
      let updatedCount = 0;
      
      // Update products without images
      const updatedProducts = await Promise.all(
        products.map(async (product) => {
          if (!product.productImage) {
            console.log(`Applying default image to product ${product.id}`);
            updatedCount++;
            
            try {
              await restaurantApi.applyDefaultImageToProduct(product.id, menuId);
              return {
                ...product,
                productImage: defaultImage
              };
            } catch (err) {
              console.error(`Failed to apply default image to product ${product.id}:`, err);
              return product;
            }
          }
          return product;
        })
      );
      
      setProducts(updatedProducts);
      
      alert(
        t('menus.defaultImageAppliedToAll', { count: updatedCount }) || 
        `Default image applied to ${updatedCount} product${updatedCount !== 1 ? 's' : ''}`
      );
    } catch (err) {
      console.error('Error applying default image to all products:', err);
      alert(t('errors.applyDefaultImageFailed') || 'Failed to apply default image to all products');
    }
  };
  
  const handleApplyDefaultImageToProduct = async (productId) => {
    const defaultImage = menu?.defaultProductImage || menu?.defaultProductImageUrl;
    if (!defaultImage) {
      alert(t('menus.noDefaultImageToApply') || 'No default image available to apply');
      return;
    }
    
    if (!window.confirm(t('products.confirmDefaultImage') || 'Are you sure you want to replace this product\'s image with the default image?')) {
      return;
    }
    
    try {
      console.log("Applying default image to product:", productId);
      console.log("Default image path:", defaultImage);
      
      // Use the restaurantApi method to apply default image to product
      await restaurantApi.applyDefaultImageToProduct(productId, menuId);
      
      // Update the product in our local state
      setProducts(prevProducts => 
        prevProducts.map(product => {
          if (product.id === productId) {
            console.log("Updating product in state with default image");
            // Create a new product object to avoid mutating state directly
            const updatedProduct = {...product};
            // Set the product image path directly to the menu's default image path
            updatedProduct.productImage = defaultImage;
            console.log("New product image path:", updatedProduct.productImage);
            return updatedProduct;
          }
          return product;
        })
      );
      
      alert(t('products.defaultImageApplied') || 'Default image applied successfully');
    } catch (err) {
      console.error('Error applying default image:', err);
      alert(err.message || t('errors.failedToApplyImage') || 'Failed to apply default image');
    }
  };
  
  // Add function to handle product edit
  const handleEditProduct = (product) => {
    setProductToEdit(product);
    setShowAddProduct(true);
  };

  // Display Products section for selected category
  const renderProductsSection = () => {
    return (
      <div className="space-y-6">
        {/* Categories Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {t('categories.title') || 'Categories'}
            </h3>
            
            {/* Add Category Form */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={t('categories.newPlaceholder') || 'New category name'}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
              <button
                onClick={handleAddCategory}
                disabled={isAddingCategory || !newCategoryName.trim()}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isAddingCategory ? (
                  <ImSpinner8 className="animate-spin h-4 w-4" />
                ) : (
                  <HiPlus className="h-4 w-4" />
                )}
                <span className="ml-1">{t('categories.add') || 'Add'}</span>
              </button>
            </div>
          </div>

          {/* Categories List */}
          {categories.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              {t('categories.empty') || 'No categories yet. Create your first category.'}
            </div>
          ) : (
            <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
              {categories.map((category) => (
                <div key={category.id} className="mr-2 flex">
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className={`py-2 px-4 text-sm font-medium ${
                      selectedCategory && selectedCategory.id === category.id
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border border-b-0 border-gray-200 dark:border-gray-700 rounded-t-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-transparent'
                    }`}
                  >
                    {category.name}
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="ml-1 p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                    title={t('categories.delete') || 'Delete category'}
                  >
                    <HiX className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {selectedCategory 
                ? `${t('products.title') || 'Products'} ${t('products.in') || 'in'} ${selectedCategory.name}`
                : t('products.title') || 'Products'
              }
            </h3>
            
            {selectedCategory && (
              <button
                onClick={handleAddProduct}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <HiPlus className="mr-1 -ml-1 h-4 w-4" />
                {t('products.add') || 'Add Product'}
              </button>
            )}
          </div>

          {!selectedCategory ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t('products.selectCategory') || 'Select a category to manage products'}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>{t('products.noProducts') || 'No products in this category'}</p>
              <button
                onClick={handleAddProduct}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <HiPlus className="mr-2 -ml-1 h-5 w-5" />
                {t('products.addFirst') || 'Add your first product'}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('products.name') || 'Name'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('products.price') || 'Price'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('products.description') || 'Description'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('common.actions') || 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {product.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {product.productPrice}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
                        {product.productInfo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                        >
                          {t('common.edit') || 'Edit'}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          {t('common.delete') || 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Product Form Modal */}
        {showAddProduct && selectedCategory && (
          <ProductForm 
            categoryId={selectedCategory.id} 
            onSuccess={handleProductCreated} 
            onCancel={() => {
              setShowAddProduct(false);
              setProductToEdit(null);
            }} 
            editProduct={productToEdit}
          />
        )}
      </div>
    );
  };

  const renderMenuDetailsSection = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
          {t('menus.menuDetails') || 'Menu Details'}
        </h2>
        
        <div className="space-y-6">
          {/* Menu Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('menus.name') || 'Menu Name'}
            </label>
            <input
              type="text"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={t('menus.namePlaceholder') || 'Enter menu name'}
            />
          </div>

          {/* Banner Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('menus.bannerImage') || 'Banner Image'}
            </label>
            <div className="mt-1 flex items-center">
              {bannerPreview || menu?.bannerImage ? (
                <div className="relative">
                  <img
                    src={bannerPreview || `${import.meta.env.VITE_API_URL}${menu?.bannerImage}`}
                    alt="Menu banner"
                    className="h-40 w-auto object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBannerPreview(null);
                      setBannerImage(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <HiDocumentAdd className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">{t('common.clickToUpload') || 'Click to upload'}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('common.imageTypes') || 'PNG, JPG or GIF (max. 5MB)'}
                      </p>
                    </div>
                    <input
                      id="banner-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleBannerImageChange}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Default Product Image */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('menus.defaultProductImage') || 'Default Product Image'}
              </label>
              
              <div className="flex gap-2">
                {products.length > 0 && menu?.defaultProductImage && (
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                    onClick={handleApplyDefaultImageToAllProducts}
                  >
                    <svg className="mr-1 -ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('menus.applyToAllProducts') || 'Apply to All Products'}
                  </button>
                )}
              </div>
            </div>
            <div className="mt-1 flex items-center">
              {defaultProductPreview || menu?.defaultProductImage || menu?.defaultProductImageUrl ? (
                <div className="relative">
                  <img
                    src={defaultProductPreview || `${import.meta.env.VITE_API_URL}${menu?.defaultProductImage || menu?.defaultProductImageUrl}`}
                    alt="Default product"
                    className="h-40 w-auto object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setDefaultProductPreview(null);
                      setDefaultProductImage(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <HiDocumentAdd className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">{t('common.clickToUpload') || 'Click to upload'}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('common.imageTypes') || 'PNG, JPG or GIF (max. 5MB)'}
                      </p>
                    </div>
                    <input
                      id="default-product-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleDefaultImageChange}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleSaveMenu}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <ImSpinner8 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  {t('common.saving') || 'Saving...'}
                </>
              ) : (
                <>
                  <HiSave className="-ml-1 mr-2 h-5 w-5" />
                  {t('common.save') || 'Save'}
                </>
              )}
            </button>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md flex items-center">
              <div className="flex-shrink-0">
                <HiSave className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {t('common.saveSuccess') || 'Changes saved successfully'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleGoBack = () => {
    // Use returnPath if provided, otherwise try backUrl or default paths
    if (returnPath) {
      navigate(returnPath);
    } else if (backUrl) {
      navigate(backUrl);
    } else if (fromManager) {
      navigate('/manager/menus'); 
    } else if (restaurantId) {
      navigate(`/admin/restaurants/${restaurantId}/menus`);
    } else {
      navigate('/admin');
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
              {t('menus.products') || 'Products'}
            </button>
          </li>
        </ul>
      </div>
      
      {/* Tab content */}
      {activeTab === 0 ? renderMenuDetailsSection() : renderProductsSection()}
    </div>
  );
}

export default EditMenuPage;