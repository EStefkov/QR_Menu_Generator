// NavBar.jsx
import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiX } from "react-icons/hi";
import { AuthContext } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import { validateToken } from "../api/account";

const BASE_URL = import.meta.env.VITE_API_URL;

const NavBar = () => {
  const navigate = useNavigate();
  const { userData, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (userData.token) {
      validateToken(userData.token)
        .then((resData) => {
          // Token validation logic
        })
        .catch((err) => {
          console.error("Token validation error:", err);
          logout();
          navigate("/login");
        });
    }
  }, [userData.token, logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-4 shadow-lg transition-colors duration-200">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          QR Menu
        </Link>

        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Home
          </Link>
          {userData.accountType === "ROLE_ADMIN" && (
            <Link to="/admin" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Admin Dashboard
            </Link>
          )}
          {userData.accountType === "ROLE_USER" && (
            <>
              <Link to="/menus" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Menus
              </Link>
              <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                About
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? "🌞" : "🌙"}
          </button>

          {userData.firstName ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium hidden md:block">
                {userData.firstName} {userData.lastName}
              </span>
              <img
                src={`${BASE_URL}${userData.profilePicture}`}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-blue-500 dark:border-blue-400"
              />
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex space-x-4">
              <Link 
                to="/login" 
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden text-2xl p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <HiX /> : <HiOutlineMenu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="py-4 space-y-2">
          <Link to="/" className="block py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Home
          </Link>
          {userData.accountType === "ROLE_ADMIN" && (
            <Link to="/admin" className="block py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Admin Dashboard
            </Link>
          )}
          {userData.accountType === "ROLE_USER" && (
            <>
              <Link to="/menus" className="block py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Menus
              </Link>
              <Link to="/about" className="block py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                About
              </Link>
            </>
          )}
          {userData.firstName ? (
            <button
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors mt-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <div className="space-y-2">
              <Link 
                to="/login" 
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="block w-full text-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
