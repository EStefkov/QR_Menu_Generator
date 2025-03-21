import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // за да навигираме до MenuPage
import {fetchCategoriesByMenuIdApi} from "../api/adminDashboard";

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
                      onClick={() => onEdit(restaurant)}
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
                          Избери меню:
                        </label>
                      </div>
                      <select
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                        value={selectedMenu[restaurant.id] || ""}
                        onChange={(e) => handleMenuChange(restaurant.id, e.target.value)}
                      >
                        <option value="">-- Избери меню --</option>
                        {menus[restaurant.id].map((menu) => (
                          <option key={menu.id} value={menu.id}>
                            {menu.category}
                          </option>
                        ))}
                      </select>

                      <div className="flex flex-wrap gap-2">
                        <button
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                          onClick={() => handleFetchQRCode(selectedMenu[restaurant.id])}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                          Вземи QR CODE
                        </button>
                        <button
                          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                          onClick={() => goToMenuPage(selectedMenu[restaurant.id])}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Отвори цялото меню
                        </button>
                      </div>

                      {/* Показваме категориите (ако искаш да ги виждаш и тук) */}
                      {selectedMenu[restaurant.id] &&
                        categories[selectedMenu[restaurant.id]] &&
                        categories[selectedMenu[restaurant.id]].length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Категории:
                              </p>
                            </div>
                            <ul className="space-y-2">
                              {categories[selectedMenu[restaurant.id]].map((cat) => (
                                <li key={cat.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  {cat.name}
                                  <span className="text-xs text-gray-500 dark:text-gray-500">(ID: {cat.id})</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
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
    </section>
  );
};

export default RestaurantsTable;
