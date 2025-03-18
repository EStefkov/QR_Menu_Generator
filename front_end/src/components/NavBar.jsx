// NavBar.jsx
import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiX } from "react-icons/hi";
import { AuthContext } from "../AuthContext"; 
import { validateToken } from "../api/account"; // Импортираме нашата функция

const BASE_URL = import.meta.env.VITE_API_URL;

const NavBar = () => {
  const navigate = useNavigate();
  const { userData, logout } = useContext(AuthContext);

  // Тъмна/светла тема, пазим я в localStorage
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // При промяна на isDarkMode => toggle dark class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  // ➜ Тук добавяме useEffect за валидация на токена
  useEffect(() => {
    if (userData.token) {
      validateToken(userData.token)
        .then((resData) => {
          // Ако бекендът върне 200 (OK), значи токенът е валиден
          // По желание може да обновите userData, ако response връща нещо ново
          // Например: setUserData({ ...resData, token: userData.token }) 
          // Но за това ви трябва метод setUserData в AuthContext
        })
        .catch((err) => {
          // Ако е 401, 403 или друга грешка => токенът е невалиден
          console.error("Token validation error:", err);
          logout();
          navigate("/login");
        });
    }
  }, [userData.token, logout, navigate]);

  // Клик на Logout => чисти локални данни и пренасочва
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 dark:bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">MyApp</Link>

        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-gray-400 transition">Home</Link>
          {userData.accountType === "ROLE_ADMIN" && (
            <Link to="/admin" className="hover:text-gray-400 transition">
              Admin Dashboard
            </Link>
          )}
          {userData.accountType === "ROLE_USER" && (
            <>
              <Link to="/menus" className="hover:text-gray-400 transition">
                Menus
              </Link>
              <Link to="/about" className="hover:text-gray-400 transition">
                About
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="bg-gray-700 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-500 px-4 py-2 rounded-lg transition"
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

          <button onClick={toggleMenu} className="md:hidden text-2xl">
            {isOpen ? <HiX /> : <HiOutlineMenu />}
          </button>
        </div>
      </div>

      {/* Мобилно меню */}
      <div className={`md:hidden ${isOpen ? "block" : "hidden"} mt-4`}>
        <Link to="/" className="block py-2 hover:text-gray-400">Home</Link>
        {userData.accountType === "ROLE_ADMIN" && (
          <Link to="/admin" className="block py-2 hover:text-gray-400">
            Admin Dashboard
          </Link>
        )}
        {userData.accountType === "ROLE_USER" && (
          <>
            <Link to="/menus" className="block py-2 hover:text-gray-400">
              Menus
            </Link>
            <Link to="/about" className="block py-2 hover:text-gray-400">
              About
            </Link>
          </>
        )}
        {userData.firstName ? (
          <button
            className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition mt-2"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="block py-2 hover:text-gray-400">
              Login
            </Link>
            <Link to="/register" className="block py-2 hover:text-gray-400">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
