import React, { useState } from "react";
import { loginAccount } from "../api/account.jsx";

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
            localStorage.setItem("token", token);
            setMessage("Login successful!");
        } catch (error) {
            setMessage(error);
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input name="accountName" placeholder="Name or Email" onChange={handleChange} required />
                <input name="password" placeholder="Password" type="password" onChange={handleChange} required />
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;
