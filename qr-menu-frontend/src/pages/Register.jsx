import React, { useState } from "react";
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const { confirmPassword, ...dataToSend } = formData;
            const response = await registerAccount(dataToSend);
            setSuccess("Account successfully created!");
            console.log("Registration response:", response);
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="auth-container">
            <h1>Register</h1>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <form className="auth-form" onSubmit={handleSubmit}>
                <input type="text" name="accountName" placeholder="Username" value={formData.accountName} onChange={handleChange} required />
                <input type="email" name="mailAddress" placeholder="Email" value={formData.mailAddress} onChange={handleChange} required />
                <input type="text" name="number" placeholder="Phone Number" value={formData.number} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                <input type="password" name="confirmPassword" placeholder="Retype Password" value={formData.confirmPassword} onChange={handleChange} required />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default RegisterPage;
