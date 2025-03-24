import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { favoritesApi } from '../api/favoritesProducts';
import { useAuth } from '../AuthContext';
import ProductCard from '../components/ProductCard';
import { HiHeart, HiSearch, HiFilter, HiChevronDown, HiChevronRight } from 'react-icons/hi';
import DetailsModal from '../components/DetailsModal';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper function to get full image URL
function getFullImageUrl(productImage) {
  if (!productImage) {
    return "";
  }
  if (productImage.startsWith('http://') || productImage.startsWith('https://')) {
    return productImage;
  }
  return API_BASE_URL + productImage;
}

const Favorites = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [menuFavorites, setMenuFavorites] = useState({});

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userData.token) {
        navigate('/login');
        return;
      }
      try {
        setLoading(true);
        const data = await favoritesApi.getFavorites();
        console.log('Fetched favorites with complete details:', data);
        
        const favoritesWithDefaults = data.map(favorite => ({
          ...favorite,
          productName: favorite.productName || '',
          productPrice: favorite.productPrice || 0,
          productInfo: favorite.productInfo || '',
          allergens: favorite.allergens || [],
          categoryId: favorite.categoryId || null,
          productImage: favorite.productImage ? getFullImageUrl(favorite.productImage) : null
        }));
        
        console.log('Processed favorites with image URLs:', favoritesWithDefaults);
        
        // Group favorites by menu name
        const groupedFavorites = favoritesWithDefaults.reduce((acc, favorite) => {
          const menuName = favorite.menuName || 'Uncategorized';
          if (!acc[menuName]) {
            acc[menuName] = [];
          }
          acc[menuName].push(favorite);
          return acc;
        }, {});

        setMenuFavorites(groupedFavorites);
        setFavorites(favoritesWithDefaults);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        if (err.message === 'No authentication token found') {
          navigate('/login');
        } else {
          setError('Failed to load favorites. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userData.token, navigate]);

  const handleFavoriteUpdate = async (productId) => {
    try {
      await favoritesApi.removeFavorite(productId);
      setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== productId));
      // Update menuFavorites as well
      setMenuFavorites(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(menuName => {
          updated[menuName] = updated[menuName].filter(fav => fav.id !== productId);
        });
        return updated;
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      setError('Failed to remove favorite. Please try again.');
    }
  };

  const handleSelectProduct = (product) => {
    console.log('Selected product for details:', product);
    const formattedProduct = {
      ...product,
      productName: product.productName || '',
      productPrice: product.productPrice || 0,
      productInfo: product.productInfo || '',
      allergens: product.allergens || [],
      categoryId: product.categoryId || null,
      productImage: product.productImage || null
    };
    console.log('Formatted product for details:', formattedProduct);
    setSelectedProduct(formattedProduct);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = favorite.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const price = favorite.productPrice;
    const matchesPrice =
      (!priceRange.min || price >= Number(priceRange.min)) &&
      (!priceRange.max || price <= Number(priceRange.max));
    return matchesSearch && matchesPrice;
  });

  if (!userData.token) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Favorites
          </h1>
          <div className="flex items-center space-x-2">
            <HiHeart className="w-6 h-6 text-red-500" />
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {filteredFavorites.length} items
            </span>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <HiFilter className="text-gray-400" />
              <input
                type="number"
                placeholder="Min price"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max price"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <HiHeart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No favorites found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(menuFavorites).map(([menuName, menuItems]) => {
              const filteredMenuItems = menuItems.filter(item => {
                const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase());
                const price = item.productPrice;
                const matchesPrice =
                  (!priceRange.min || price >= Number(priceRange.min)) &&
                  (!priceRange.max || price <= Number(priceRange.max));
                return matchesSearch && matchesPrice;
              });

              if (filteredMenuItems.length === 0) return null;

              return (
                <div key={menuName} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <button
                    onClick={() => toggleMenu(menuName)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {menuName}
                    </h2>
                    {expandedMenus[menuName] ? (
                      <HiChevronDown className="w-6 h-6 text-gray-500" />
                    ) : (
                      <HiChevronRight className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedMenus[menuName] && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMenuItems.map((favorite) => (
                          <ProductCard
                            key={favorite.id || favorite.productId}
                            product={favorite}
                            onSelectProduct={handleSelectProduct}
                            onEditProduct={() => {}}
                            accountType={userData.role}
                            onFavoriteUpdate={handleFavoriteUpdate}
                            isFavorite={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Details Modal */}
        {selectedProduct && (
          <DetailsModal product={selectedProduct} onClose={handleCloseModal} />
        )}
      </div>
    </div>
  );
};

export default Favorites;
