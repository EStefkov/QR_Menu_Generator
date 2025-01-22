import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const MenuPage = () => {
    const { menuId } = useParams();
    const [menu, setMenu] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await fetch(`http://192.168.x.x:8080/api/menus/${menuId}`);
                if (!response.ok) throw new Error("Failed to fetch menu");
                const data = await response.json();
                setMenu(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchMenu();
    }, [menuId]);

    if (error) return <p>Error: {error}</p>;
    if (!menu) return <p>Loading...</p>;

    return (
        <div>
            <h1>Menu: {menu.category}</h1>
            <p>Created At: {menu.createdAt}</p>
            <p>Updated At: {menu.updatedAt}</p>
        </div>
    );
};

export default MenuPage;
