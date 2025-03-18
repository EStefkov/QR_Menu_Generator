// Login.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { loginAccount } from "../api/account";
import { AuthContext } from "../AuthContext"; // отново пътят може да е друг

const Login = () => {
  const [formData, setFormData] = useState({ accountName: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Вземаме `login` функцията от AuthContext
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // loginAccount би трябвало да върне самия token (JWT)
      const token = await loginAccount(formData);
      // Вадим payload от token
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Вместо да пишем localStorage, звъним на login(...) от AuthContext
      login(token, payload);

      setMessage("Login successful!");

      if (payload.accountType === "ROLE_ADMIN") {
        navigate("/admin");
      } else if (payload.accountType === "ROLE_WAITER") {
        navigate("/waiter");
      } else {
        navigate("/user");
      }
    } catch (error) {
      setMessage("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="accountName"
            placeholder="Name or Email"
            value={formData.accountName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
        </form>
        {message && (
          <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">{message}</p>
        )}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don’t have an account? <Link to="/register" className="text-blue-500 hover:underline">Create one here</Link>.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Or go back to the <Link to="/" className="text-blue-500 hover:underline">Home Page</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
