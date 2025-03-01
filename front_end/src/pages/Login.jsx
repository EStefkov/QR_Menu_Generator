import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAccount } from "../api/account";

const Login = () => {
    const [formData, setFormData] = useState({ accountName: "", password: "" });
    const [message, setMessage] = useState("");
    const navigate = useNavigate(); // Use navigate for redirection

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await loginAccount(formData); // Call login API
            const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
            localStorage.setItem("token", token); // Store JWT token
            localStorage.setItem("accountType", payload.accountType); // Store account type
            localStorage.setItem("firstName", payload.firstName); // Store user info
            localStorage.setItem("lastName", payload.lastName);
            localStorage.setItem("profilePicture", payload.profilePicture);

            setMessage("Login successful!");

            // Redirect based on account type
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
        <div className="auth-container">
            <h1>Login</h1>
            <form className="auth-form" onSubmit={handleSubmit}>
                <input
                    name="accountName"
                    placeholder="Name or Email"
                    value={formData.accountName}
                    onChange={handleChange}
                    required
                />
                <input
                    name="password"
                    placeholder="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Login</button>
            </form>
            {message && <p className="message">{message}</p>}
            <div className="helper-text">
                <p>
                    Don’t have an account? <Link to="/register">Create one here</Link>.
                </p>
                <p>
                    Or go back to the <Link to="/">Home Page</Link>.
                </p>
            </div>
        </div>
    );
};

export default Login;
