import React, { useState, useEffect } from 'react';
import { favoritesApi } from '../api/favoritesProducts';
import { useAuth } from '../AuthContext';
import ProductCard from '../components/ProductCard';
import { HiHeart } from 'react-icons/hi';

const Favorites = () => {
  const { userData } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userData.token) return;

      try {
        setLoading(true);
        const data = await favoritesApi.getFavorites();
        setFavorites(data);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load favorites. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userData.token]);

  if (!userData.token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <HiHeart className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Please Log In
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          You need to be logged in to view your favorite products.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="text-red-500 mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Error Loading Favorites
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <HiHeart className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          No Favorites Yet
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Start adding products to your favorites to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">
        Your Favorite Products
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map((favorite) => (
          <ProductCard
            key={favorite.id}
            product={{
              id: favorite.productId,
              productName: favorite.productName,
              productImage: favorite.productImage,
              productPrice: favorite.productPrice,
              productInfo: favorite.productInfo,
            }}
            onSelectProduct={() => {}}
            onEditProduct={() => {}}
            accountType={userData.accountType}
          />
        ))}
      </div>
    </div>
  );
};

export default Favorites; 