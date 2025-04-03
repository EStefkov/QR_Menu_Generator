import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // за да навигираме до MenuPage
import {fetchCategoriesByMenuIdApi, updateRestaurantApi} from "../api/adminDashboard";
import { HiX, HiCheckCircle, HiExclamationCircle } from "react-icons/hi";

const RestaurantsTable = ({
  restaurants,
  onEdit,
  onDelete,
  onFetchMenus,
  menus,
  onFetchQRCode,
  token,
}) => {
  const navigate = useNavigate();

  // Локално пазим "коe меню е избрано" за всеки ресторант (map: restaurantId => menuId)
  const [selectedMenu, setSelectedMenu] = useState({});
  // Локално пазим категориите за всяко меню (map: menuId => масив от категории)
  const [categories, setCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRestaurant, setEditRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Filter restaurants based on search term
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => 
      restaurant.restorantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.phoneNumber.includes(searchTerm) ||
      restaurant.id.toString().includes(searchTerm)
    );
  }, [restaurants, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRestaurants = filteredRestaurants.slice(startIndex, startIndex + itemsPerPage);

  // Когато потребителят избере конкретно меню от dropdown
  const handleMenuChange = async (restaurantId, menuId) => {
    // Запомняме, че за този ресторант е избрано това меню
    setSelectedMenu((prev) => ({ ...prev, [restaurantId]: menuId }));

    if (!menuId) {
      // Нулиране, ако потребителят е избрал празен option
      return;
    }
    try {
      // Зареждаме категориите за това меню (ако искаш да ги показваш още тук)
      const data = await fetchCategoriesByMenuIdApi(token, menuId);
      setCategories((prev) => ({ ...prev, [menuId]: data }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Неуспешно зареждане на категории.");
    }
  };

  const handleFetchQRCode = (menuId) => {
    if (!menuId) {
      console.error("Invalid menu ID:", menuId);
      return;
    }
    onFetchQRCode(token, menuId); // Вика външната функция, която връща QR кода
  };

  // Навигиране към отделната страница за менюто
  // (там ще се визуализират категории/продукти в по-голям детайл)
  const goToMenuPage = (menuId) => {
    if (!menuId) return;
    navigate(`/menu/${menuId}`); // /menu/123
  };

  // Функции за работа с модалния прозорец за редактиране
  const handleEditClick = (restaurant) => {
    setEditRestaurant({
      ...restaurant,
      restorantName: restaurant.restorantName || '',
      address: restaurant.address || '',
      phoneNumber: restaurant.phoneNumber || '',
      accountId: restaurant.accountId || ''
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditRestaurant(null);
    setMessage({ type: '', text: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditRestaurant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveRestaurant = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Вземаме само необходимите полета за обновяване - без accountId
      const restaurantToUpdate = {
        restorantName: editRestaurant.restorantName,
        address: editRestaurant.address,
        phoneNumber: editRestaurant.phoneNumber
        // accountId вече не се изпраща за обновяване
      };

      await updateRestaurantApi(token, editRestaurant.id, restaurantToUpdate);

      // Ако съществува onEdit функцията, я викаме с обновените данни
      if (onEdit) {
        onEdit({
          ...editRestaurant,
          ...restaurantToUpdate
        });
      }

      setMessage({
        type: 'success',
        text: 'Ресторантът е обновен успешно'
      });

      setTimeout(() => {
        handleCloseModal();
        // Опресняваме списъка
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error updating restaurant:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Грешка при обновяване на ресторанта'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ресторанти</h2>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:flex-none">
            <input
              type="text"
              placeholder="Търсене по име, телефон или ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Items Per Page Selector */}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
          >
            <option value={5}>5 на страница</option>
            <option value={10}>10 на страница</option>
            <option value={20}>20 на страница</option>
            <option value={50}>50 на страница</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
              <th className="p-4 text-left text-sm font-semibold">ID</th>
              <th className="p-4 text-left text-sm font-semibold">Име</th>
              <th className="p-4 text-left text-sm font-semibold">Телефон</th>
              <th className="p-4 text-left text-sm font-semibold">Owner ID</th>
              <th className="p-4 text-left text-sm font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRestaurants.map((restaurant) => (
              <tr
                key={restaurant.id}
                className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
              >
                <td className="p-4 text-gray-700 dark:text-gray-300">{restaurant.id}</td>
                <td className="p-4 text-gray-700 dark:text-gray-300">{restaurant.restorantName}</td>
                <td className="p-4 text-gray-700 dark:text-gray-300">{restaurant.phoneNumber}</td>
                <td className="p-4 text-gray-700 dark:text-gray-300">
                    {restaurant.accountId ? restaurant.accountId : 'No Owner'}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                      onClick={() => handleEditClick(restaurant)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Редактирай
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                      onClick={() => onDelete(restaurant.id)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Изтрий
                    </button>
                    <button
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                      onClick={() => navigate(`/restaurants/${restaurant.id}/menus`)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Управление на менюта
                    </button>
                    {restaurant.id && (
                      <button
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                        onClick={() => onFetchMenus(restaurant.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        Зареди менюта
                      </button>
                    )}
                  </div>

                  {/* Ако вече имаме списък с менюта за този ресторант */}
                  {menus[restaurant.id] && menus[restaurant.id].length > 0 && (
                    <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Меню:
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {menus[restaurant.id].map((menu) => (
                          <div key={menu.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">{menu.category || menu.name}</h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">ID: {menu.id}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-3">
                              <button
                                onClick={() => goToMenuPage(menu.id)}
                                className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 dark:text-blue-300 rounded transition-colors"
                              >
                                Преглед
                              </button>
                              <button
                                onClick={() => handleFetchQRCode(menu.id)}
                                className="text-xs px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/30 dark:hover:bg-purple-800/30 dark:text-purple-300 rounded transition-colors"
                              >
                                QR код
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 px-4">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Показване на {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredRestaurants.length)} от {filteredRestaurants.length} ресторанта
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="px-3 py-1 text-gray-700 dark:text-gray-300">
            Страница {currentPage} от {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Edit Restaurant Modal */}
      {showEditModal && editRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Редактиране на ресторант
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {message.text && (
              <div className={`p-4 mb-6 rounded-lg flex items-center ${
                message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 
                'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
              }`}>
                {message.type === 'success' ? 
                <HiCheckCircle className="w-5 h-5 mr-2" /> : 
                <HiExclamationCircle className="w-5 h-5 mr-2" />
                }
                {message.text}
              </div>
            )}

            <form onSubmit={handleSaveRestaurant} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Restaurant ID */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ID Ресторант
                  </label>
                  <input 
                    type="text" 
                    value={editRestaurant.id}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white transition cursor-not-allowed"
                  />
                </div>

                {/* Restaurant Name */}
                <div className="md:col-span-2">
                  <label 
                    htmlFor="restorantName" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Име на ресторанта
                  </label>
                  <input 
                    type="text" 
                    id="restorantName" 
                    name="restorantName" 
                    value={editRestaurant.restorantName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label 
                    htmlFor="address" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Адрес
                  </label>
                  <input 
                    type="text" 
                    id="address" 
                    name="address" 
                    value={editRestaurant.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label 
                    htmlFor="phoneNumber" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Телефон
                  </label>
                  <input 
                    type="text" 
                    id="phoneNumber" 
                    name="phoneNumber" 
                    value={editRestaurant.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>

                {/* Owner ID */}
                <div>
                  <label 
                    htmlFor="accountId" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    ID на собственика
                  </label>
                  <input 
                    type="text" 
                    id="accountId" 
                    name="accountId" 
                    value={editRestaurant.accountId || 'Няма собственик'}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white transition cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
                >
                  Отказ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Запазване...' : 'Запази промените'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default RestaurantsTable;
