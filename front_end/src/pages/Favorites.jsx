import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { favoritesApi } from '../api/favoritesProducts';
import { useAuth } from '../AuthContext';
import ProductCard from '../components/ProductCard';
import { HiHeart, HiSearch, HiFilter } from 'react-icons/hi';
import DetailsModal from '../components/DetailsModal';

const Favorites = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const itemsPerPage = 12;

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
        
        // Ensure all required fields are present
        const favoritesWithDefaults = data.map(favorite => ({
          ...favorite,
          productName: favorite.productName || '',
          productPrice: favorite.productPrice || 0,
          productInfo: favorite.productInfo || '',
          allergens: favorite.allergens || [],
          categoryId: favorite.categoryId || null,
          productImage: favorite.productImage || null
        }));
        
        console.log('Processed favorites:', favoritesWithDefaults);
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
    } catch (error) {
      console.error('Error removing favorite:', error);
      setError('Failed to remove favorite. Please try again.');
    }
  };

  const handleSelectProduct = (product) => {
    console.log('Selected product for details:', product);
    // Ensure all required fields are present
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

  // Filter favorites based on search term and price range
  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = favorite.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const price = favorite.productPrice;
    const matchesPrice = (!priceRange.min || price >= Number(priceRange.min)) &&
                        (!priceRange.max || price <= Number(priceRange.max));
    return matchesSearch && matchesPrice;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredFavorites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFavorites = filteredFavorites.slice(startIndex, startIndex + itemsPerPage);

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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedFavorites.map((favorite) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
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