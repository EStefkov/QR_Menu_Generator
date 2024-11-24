import { useState } from "react";
import { loginAccount } from "../api/account";

const Login = () => {
    const [formData, setFormData] = useState({ accountName: "", password: "" });
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await loginAccount(formData);
            const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
            localStorage.setItem("token", token);
            localStorage.setItem("accountType", payload.accountType); // Store account type from token
            setMessage("Login successful!");

            // Redirect based on account type
            window.location.href = payload.accountType === "ROLE_ADMIN" ? "/admin" : "/user";
        } catch (error) {
            setMessage(error);
        }
    };


    return (
        <div className="auth-container">
            <h1>Login</h1>
            <form className="auth-form" onSubmit={handleSubmit}>
                <input name="accountName" placeholder="Name or Email" onChange={handleChange} required />
                <input name="password" placeholder="Password" type="password" onChange={handleChange} required />
                <button type="submit">Login</button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default Login;
