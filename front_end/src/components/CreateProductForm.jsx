import { useState, useEffect } from "react";
import { createProductApi } from "../api/adminDashboard"; // Ето я единствената функция, която ще ползваме

const CreateProductForm = ({ 
  token,
  fetchRestaurants,
  fetchMenus,
  fetchCategories,
  onSuccess
}) => {

  const [restaurants, setRestaurants] = useState([]);
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [selectedMenu, setSelectedMenu] = useState("");

  // Държим локално файла (ако се избере)
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  // Полетата на продукта
  const [productData, setProductData] = useState({
    productName: "",
    productPrice: "",
    productInfo: "",
    categoryId: "",
    menuId: "",
  });

  // 1) Зареждаме ресторанти при mount
  useEffect(() => {
    fetchRestaurants().then(setRestaurants);
  }, []);

  // 2) При смяна на ресторант -> зареждаме менюта
  useEffect(() => {
    if (selectedRestaurant) {
      fetchMenus(selectedRestaurant).then(setMenus);
      setSelectedMenu("");
      setCategories([]);
    }
  }, [selectedRestaurant]);

  // 3) При смяна на меню -> зареждаме категории
  useEffect(() => {
    if (selectedMenu) {
      fetchCategories(selectedMenu).then(setCategories);
      // Записваме menuId в productData
      setProductData(prev => ({ ...prev, menuId: selectedMenu }));
    }
  }, [selectedMenu]);

  // Обработва промяна в инпутите (име, цена, описание, категория)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Качване на файл
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImageFile(file);
    } else {
      alert("Моля, изберете валиден формат на изображение (JPG, PNG, JPEG)");
      setSelectedImageFile(null);
    }
  };

  // Сабмит
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация на задължителни полета
    if (!productData.productName || !productData.productPrice || !productData.categoryId || !productData.menuId) {
      alert("Моля, попълнете всички задължителни полета.");
      return;
    }

    try {
      // Подготвяме FormData
      const formData = new FormData();
      formData.append("productName", productData.productName);
      formData.append("productPrice", productData.productPrice);
      formData.append("productInfo", productData.productInfo);
      formData.append("categoryId", productData.categoryId);
      formData.append("menuId", productData.menuId);

      // Ако е избран файл, добавяме го; ако не – бекендът ще сложи "default_product.png"
      if (selectedImageFile) {
        formData.append("productImage", selectedImageFile);
      }

      // Извикваме само createProductApi (унифицирано)
      const createdProduct = await createProductApi(token, formData);
      console.log("Продукт създаден:", createdProduct);

      // Нулираме формата
      setProductData({
        productName: "",
        productPrice: "",
        productInfo: "",
        categoryId: "",
        menuId: "",
        productImage:""
      });
      setSelectedImageFile(null);

      // Уведомяваме родителя, за да презареди списък/данни (ако е нужно)
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error("Грешка при създаване на продукт:", error);
      alert("Неуспешен опит за създаване на продукт!");
    }
  };
  

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-md mx-auto mt-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Създай нов продукт
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {/* Избор на ресторант */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Избери ресторант:
          </label>
          <select 
            value={selectedRestaurant} 
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">-- Избери ресторант --</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.restorantName}
              </option>
            ))}
          </select>
        </div>

        {/* Избор на меню */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Избери меню:
          </label>
          <select 
            value={selectedMenu} 
            onChange={(e) => setSelectedMenu(e.target.value)}
            disabled={!selectedRestaurant}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">-- Избери меню --</option>
            {menus.map((menu) => (
              <option key={menu.id} value={menu.id}>
                {menu.category}
              </option>
            ))}
          </select>
        </div>

        {/* Избор на категория */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Избери категория:
          </label>
          <select 
            name="categoryId" 
            value={productData.categoryId} 
            onChange={handleChange}
            disabled={!selectedMenu}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">-- Избери категория --</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Име на продукта */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Име на продукта:
          </label>
          <input 
            type="text" 
            name="productName" 
            value={productData.productName} 
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Въведете име..." 
          />
        </div>

        {/* Цена на продукта */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Цена:
          </label>
          <input 
            type="number" 
            name="productPrice" 
            value={productData.productPrice} 
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Въведете цена..." 
          />
        </div>

        {/* Описание */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Описание:
          </label>
          <textarea 
            name="productInfo" 
            value={productData.productInfo} 
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Описание на продукта..." 
          />
        </div>

        {/* Качване на снимка */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Качи снимка:
          </label>

          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageFileChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
          />
          <small className="text-gray-600 dark:text-gray-400">Ако не изберете файл, ще се ползва "default_product.png".</small>
        </div>
      </div>

      <button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        disabled={
          !productData.productName ||
          !productData.productPrice ||
          !productData.categoryId ||
          !productData.menuId
        }
      >
        Създай продукт
      </button>
    </form>
  );
};

export default CreateProductForm;
