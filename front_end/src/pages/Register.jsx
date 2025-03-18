import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerAccount } from "../api/account";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    accountName: "",
    mailAddress: "",
    number: "",
    password: "",
    confirmPassword: "",
    accountType: "ROLE_USER",
    firstName: "",
    lastName: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const { confirmPassword, ...dataToSend } = formData;
      await registerAccount(dataToSend);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Register</h1>

        {error && <p className="text-center mb-4 text-sm text-red-500">{error}</p>}
        {success && <p className="text-center mt-4 text-sm text-green-500">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="accountName"
            placeholder="Username"
            value={formData.accountName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="mailAddress"
            placeholder="Email"
            value={formData.mailAddress}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="number"
            placeholder="Phone Number"
            value={formData.number}
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
          <input
            type="password"
            name="confirmPassword"
            placeholder="Retype Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Register
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login here</Link>.
          </p>
          <p>
            Or go back to the <Link to="/" className="text-blue-500 hover:underline">Home Page</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;