import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NavBar from "../components/NavBar";

const MenuPage = () => {
    const { menuId } = useParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    // 1) Зареждаме всички продукти за това меню
    const fetchProductsForMenu = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/menu/${menuId}`);
            if (!response.ok) throw new Error("Failed to fetch products for menu");
            const data = await response.json();
            setProducts(data); // масив от { id, productName, productPrice, productInfo, categoryId }
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    // 2) Зареждаме категориите за това меню (ако нямате такъв endpoint, добавете го)
    const fetchCategoriesForMenu = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/categories/menu/${menuId}`);
            if (!response.ok) throw new Error("Failed to fetch categories for menu");
            const data = await response.json();
            setCategories(data); // масив от { id, categoryName, ... }
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    // Връзваме двата fetch-a в един useEffect
    useEffect(() => {
        fetchProductsForMenu();
        fetchCategoriesForMenu();
    }, [menuId]);

    if (error) return <p>Error: {error}</p>;
    // Ако искаме да изчакаме, докато заредят продуктите и категориите:
    if (!products.length && !categories.length) return <p>Loading...</p>;

    // 3) Групиране на продуктите по категория
    //    Ще съпоставим всяка categoryId със съответната категория в categories
    //    и ще създадем структура [{ category: {...}, products: [...] }, { ... }, ...]
    const groupedByCategory = categories.map((cat) => {
        // филтрираме продуктите, които принадлежат към cat.id
        const catProducts = products.filter((p) => p.categoryId === cat.id);
        return {
            category: cat,        // { id, categoryName, ... }
            products: catProducts // масив от продукти
        };
    });

    return (
        <div>
            <NavBar />
            <h1>Menu ID: {menuId}</h1>

            {/* 4) Рендерираме всяка категория и нейните продукти */}
            {groupedByCategory.map((group) => (
                <div key={group.category.id} style={{ margin: "20px 0" }}>
                    <h2>{group.category.categoryName}</h2>
                    {group.products && group.products.length > 0 ? (
                        group.products.map((prod) => (
                            <div key={prod.id} style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}>
                                <h4>{prod.productName}</h4>
                                <p>Price: {prod.productPrice}</p>
                                <p>{prod.productInfo}</p>
                            </div>
                        ))
                    ) : (
                        <p>Няма продукти в тази категория.</p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MenuPage;
