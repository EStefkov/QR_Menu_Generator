// pages/MenuPage.jsx
import  { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NavBar from "../components/NavBar"; // Import NavBar component

const MenuPage = () => {
    const { menuId } = useParams();
    const [menu, setMenu] = useState(null);
    const [error, setError] = useState(null);
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchMenu = async () => {
            const url = `${API_BASE_URL}/api/menus/${menuId}`;
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
            <div >
                <h1 >Menu: {menu.category}</h1>
                <p >Created At: {menu.createdAt}</p>
                <p >Updated At: {menu.updatedAt}</p>
            </div>
        </div>
    );
};

export default MenuPage;
