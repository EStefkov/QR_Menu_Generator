import { useState } from "react";
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
    <section className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Ресторанти
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Име</th>
              <th className="p-3 text-left">Телефон</th>
              <th className="p-3 text-left">Owner ID</th>
              <th className="p-3 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((restaurant) => (
              <tr
                key={restaurant.id}
                className="border-b border-gray-300 dark:border-gray-600"
              >
                <td className="p-3">{restaurant.id}</td>
                <td className="p-3">{restaurant.restorantName}</td>
                <td className="p-3">{restaurant.phoneNumber}</td>
                <td className="p-3">{restaurant.accountId}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
                      onClick={() => onEdit(restaurant)}
                    >
                      Редактирай
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
                      onClick={() => onDelete(restaurant.id)}
                    >
                      Изтрий
                    </button>
                    {restaurant.id && (
                      <button
                        className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition"
                        onClick={() => onFetchMenus(restaurant.id)}
                      >
                        Зареди менюта
                      </button>
                    )}
                  </div>

                  {/* Ако вече имаме списък с менюта за този ресторант */}
                  {menus[restaurant.id] && menus[restaurant.id].length > 0 && (
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium dark:text-gray-300">
                        Избери меню:
                      </label>
                      <select
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={selectedMenu[restaurant.id] || ""}
                        onChange={(e) =>
                          handleMenuChange(restaurant.id, e.target.value)
                        }
                      >
                        <option value="">-- Избери меню --</option>
                        {menus[restaurant.id].map((menu) => (
                          <option key={menu.id} value={menu.id}>
                            {menu.category}
                          </option>
                        ))}
                      </select>

                      {/* Бутон за взимане на QR код за текущо избраното меню */}
                      <button
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition w-fit"
                        onClick={() =>
                          handleFetchQRCode(selectedMenu[restaurant.id])
                        }
                      >
                        Вземи QR CODE
                      </button>

                      {/* Бутон за ходене към отделната страница с детайли за това меню */}
                      <button
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition w-fit"
                        onClick={() => goToMenuPage(selectedMenu[restaurant.id])}
                      >
                        Отвори цялото меню
                      </button>

                      {/* Показваме категориите (ако искаш да ги виждаш и тук) */}
                      {selectedMenu[restaurant.id] &&
                        categories[selectedMenu[restaurant.id]] &&
                        categories[selectedMenu[restaurant.id]].length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium dark:text-gray-300 mb-1">
                              Категории:
                            </p>
                            <ul className="list-disc list-inside dark:text-gray-200">
                              {categories[selectedMenu[restaurant.id]].map(
                                (cat) => (
                                  <li key={cat.id}>
                                    {cat.name} (ID: {cat.id})
                                  </li>
                                )
                              )}
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
    </section>
  );
};

export default RestaurantsTable;
