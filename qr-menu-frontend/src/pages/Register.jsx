import { useState } from "react";
import { registerAccount } from "../api/account.jsx"; // Adjust the path to your API file

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
        profilePicture: "",
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

        // Password validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const { confirmPassword, ...dataToSend } = formData; // Remove confirmPassword before sending
            const response = await registerAccount(dataToSend);
            setSuccess("Account successfully created!");
            console.log("Registration response:", response);
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div>
            <h1>Register</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="accountName"
                    placeholder="Username"
                    value={formData.accountName}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="mailAddress"
                    placeholder="Email"
                    value={formData.mailAddress}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="number"
                    placeholder="Phone Number"
                    value={formData.number}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Retype Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="profilePicture"
                    placeholder="Profile Picture URL"
                    value={formData.profilePicture}
                    onChange={handleChange}
                />
                <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                >
                    <option value="ROLE_USER">User</option>
                    <option value="ROLE_ADMIN">Admin</option>
                </select>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default RegisterPage;
