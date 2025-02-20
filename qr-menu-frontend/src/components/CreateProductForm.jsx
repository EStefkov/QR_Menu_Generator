// CreateProductForm.jsx
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
        // Извикваме пропса onCreateProduct, който ще дойде от AdminDashboard
        onCreateProduct(productData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Създай нов продукт</h2>
            <div>
                <label>Продукт име:</label>
                <input
                    type="text"
                    name="productName"
                    value={productData.productName}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Цена:</label>
                <input
                    type="number"
                    name="productPrice"
                    value={productData.productPrice}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Описание:</label>
                <input
                    type="text"
                    name="productInfo"
                    value={productData.productInfo}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Category ID:</label>
                <input
                    type="number"
                    name="categoryId"
                    value={productData.categoryId}
                    onChange={handleChange}
                />
            </div>
            <button type="submit">Създай продукт</button>
        </form>
    );
};

export default CreateProductForm;
