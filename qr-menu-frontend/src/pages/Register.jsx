import React, { useState } from "react";
import { registerAccount } from "../api/account.jsx";

const Register = () => {
    const [formData, setFormData] = useState({
        accountName: "",
        mailAddress: "",
        number: "",
        password: "",
        accountType: "ROLE_USER",
    });
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await registerAccount(formData);
            setMessage(response);
        } catch (error) {
            setMessage(error);
        }
    };

    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <input name="accountName" placeholder="Name" onChange={handleChange} required />
                <input name="mailAddress" placeholder="Email" onChange={handleChange} required />
                <input name="number" placeholder="Phone Number" onChange={handleChange} />
                <input name="password" placeholder="Password" type="password" onChange={handleChange} required />
                <select name="accountType" onChange={handleChange}>
                    <option value="ROLE_USER">User</option>
                    <option value="ROLE_ADMIN">Admin</option>
                </select>
                <button type="submit">Register</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Register;
