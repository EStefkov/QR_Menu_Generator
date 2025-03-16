import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Home = () => {
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    const handleThemeChange = () => {
      const theme = localStorage.getItem("theme");
      setIsDarkMode(theme === "dark");
      document.documentElement.classList.toggle("dark", theme === "dark");
    };

    window.addEventListener("storage", handleThemeChange);

    return () => window.removeEventListener("storage", handleThemeChange);
  }, []);

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Welcome to QR Menu Manager
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          {isLoggedIn
            ? "Manage your QR menus effortlessly, day or night."
            : "Start managing your QR menus today by signing up or logging in."}
        </p>

        {!isLoggedIn && (
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Login
            </Link>
          </div>
        )}

        {isLoggedIn && (
          <Link
            to="/admin"
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;