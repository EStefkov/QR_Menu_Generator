// EditProductModal.jsx
import React from "react";

const EditProductModal = ({
  editingProduct,   // за да вземем product.id или други данни
  editName,
  editPrice,
  editInfo,
  setEditName,
  setEditPrice,
  setEditInfo,
  setEditImageFile,
  onSave,
  onDelete,         // нов проп
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-2 relative">
        <button
          className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          onClick={onClose}
        >
          X
        </button>

        {/* ФОРМА ЗА РЕДАКЦИЯ */}
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Редактирай продукт
        </h2>
        <form onSubmit={onSave} className="space-y-4 w-full">
          {/* Име на продукта */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-200">
              Име на продукта
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          {/* Цена */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-200">
              Цена
            </label>
            <input
              type="number"
              step="0.01"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-200">
              Описание
            </label>
            <textarea
              value={editInfo}
              onChange={(e) => setEditInfo(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            ></textarea>
          </div>

          {/* Снимка */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-200">
              Нова снимка
            </label>
            <input
              type="file"
              onChange={(e) => setEditImageFile(e.target.files[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                         file:rounded file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100
                         dark:file:bg-gray-700 dark:file:text-gray-100
                         dark:hover:file:bg-gray-600"
            />
          </div>

          {/* Бутоните "Запиши" и "Изтрий" */}
          <div className="flex justify-between items-center mt-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
            >
              Запиши
            </button>

            {/* При клик викаме onDelete с конкретния productId */}
            <button
              type="button"
              onClick={() => onDelete(editingProduct.id)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
            >
              Изтрий
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
