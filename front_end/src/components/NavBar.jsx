import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiX } from "react-icons/hi";

// Function to decode the JWT token payload

const BASE_URL = import.meta.env.VITE_API_URL;
const decodeToken = (token) => {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Invalid token", e);
        return null;
    }
};

const NavBar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const userData = token ? decodeToken(token) : null;
    const accountType = userData?.accountType || "";

    // Тема (светла/тъмна)
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDarkMode]);

    // Тогъл за темата
    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    // State за мобилното меню
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("accountType");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");
        localStorage.removeItem("profilePicture");
        navigate("/login");
    };

    return (
        <nav className="bg-gray-900 dark:bg-gray-800 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                {/* Лого / Име */}
                <Link to="/" className="text-xl font-bold">MyApp</Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex space-x-6">
                    <Link to="/" className="hover:text-gray-400 transition">Home</Link>
                    {accountType === "ROLE_ADMIN" && (
                        <Link to="/admin" className="hover:text-gray-400 transition">Admin Dashboard</Link>
                    )}
                    {accountType === "ROLE_USER" && (
                        <>
                            <Link to="/menus" className="hover:text-gray-400 transition">Menus</Link>
                            <Link to="/about" className="hover:text-gray-400 transition">About</Link>
                        </>
                    )}
                </div>

                {/* Десни иконки (бутон за тема и профил) */}
                <div className="flex items-center space-x-4">
                    {/* Бутон за смяна на темата */}
                    <button
                        onClick={toggleTheme}
                        className="bg-gray-700 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-500 px-4 py-2 rounded-lg transition"
                    >
                        {isDarkMode ? "🌞" : "🌙"}
                    </button>

                    {userData ? (
                        <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium hidden md:block">
                                {userData.firstName} {userData.lastName}
                            </span>
                            <img
            src={`${BASE_URL}${userData.profilePicture}`}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-gray-300"
        />
                            <button
                                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="hidden md:flex space-x-4">
                            <Link to="/login" className="hover:text-gray-400 transition">Login</Link>
                            <Link to="/register" className="hover:text-gray-400 transition">Register</Link>
                        </div>
                    )}

                    {/* Бургер меню бутон */}
                    <button onClick={toggleMenu} className="md:hidden text-2xl">
                        {isOpen ? <HiX /> : <HiOutlineMenu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden ${isOpen ? "block" : "hidden"} mt-4`}>
                <Link to="/" className="block py-2 hover:text-gray-400">Home</Link>
                {accountType === "ROLE_ADMIN" && (
                    <Link to="/admin" className="block py-2 hover:text-gray-400">Admin Dashboard</Link>
                )}
                {accountType === "ROLE_USER" && (
                    <>
                        <Link to="/menus" className="block py-2 hover:text-gray-400">Menus</Link>
                        <Link to="/about" className="block py-2 hover:text-gray-400">About</Link>
                    </>
                )}
                {userData ? (
                    <>
                        <span className="block py-2">{userData.firstName} {userData.lastName}</span>
                        <button
                            className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition mt-2"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="block py-2 hover:text-gray-400">Login</Link>
                        <Link to="/register" className="block py-2 hover:text-gray-400">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
