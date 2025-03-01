import { useState } from "react";

const CreateProductForm = ({ onCreateProduct }) => {
    const [productData, setProductData] = useState({
        productName: "",
        productPrice: "",
        productInfo: "",
        categoryId: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!productData.productName || !productData.productPrice || !productData.categoryId) {
            alert("Моля, попълнете всички задължителни полета.");
            return;
        }
        onCreateProduct(productData);
        setProductData({ productName: "", productPrice: "", productInfo: "", categoryId: "" });
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
                {/* Име на продукта */}
                <div>
                    <label htmlFor="productName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Име на продукта:
                    </label>
                    <input
                        id="productName"
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
                    <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Цена:
                    </label>
                    <input
                        id="productPrice"
                        type="number"
                        name="productPrice"
                        value={productData.productPrice}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Въведете цена..."
                    />
                </div>

                {/* Описание на продукта */}
                <div>
                    <label htmlFor="productInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Описание:
                    </label>
                    <textarea
                        id="productInfo"
                        name="productInfo"
                        value={productData.productInfo}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Описание на продукта..."
                    />
                </div>

                {/* ID на категорията */}
                <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category ID:
                    </label>
                    <input
                        id="categoryId"
                        type="number"
                        name="categoryId"
                        value={productData.categoryId}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Въведете ID..."
                    />
                </div>
            </div>

            {/* Бутон за създаване */}
            <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                disabled={!productData.productName || !productData.productPrice || !productData.categoryId}
            >
                Създай продукт
            </button>
        </form>
    );
};

export default CreateProductForm;
