// pages/MenuPage.jsx
import  { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NavBar from "../components/NavBar"; // Import NavBar component

const MenuPage = () => {
    const { menuId } = useParams();
    const [menu, setMenu] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMenu = async () => {
            const url = `http://localhost:8080/api/menus/${menuId}`;
            console.log("Fetching menu from:", url);

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch menu");
                const data = await response.json();
                setMenu(data);
            } catch (err) {
                console.error("Error fetching menu:", err);
                setError(err.message);
            }
        };
        fetchMenu();
    }, [menuId]);

    if (error) return <p>Error: {error}</p>;
    if (!menu) return <p>Loading...</p>;

    return (
        <div>
            <NavBar /> {/* Include NavBar */}
            <div className="p-4">
                <h1 className="text-2xl font-bold">Menu: {menu.category}</h1>
                <p className="text-sm text-gray-500">Created At: {menu.createdAt}</p>
                <p className="text-sm text-gray-500">Updated At: {menu.updatedAt}</p>
            </div>
        </div>
    );
};

export default MenuPage;
