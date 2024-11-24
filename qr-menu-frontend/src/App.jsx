import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import RegisterPage from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Home from "./pages/Home.jsx";
import './App.css';

const App = () => {
    const isAuthenticated = !!localStorage.getItem("token");
    const accountType = localStorage.getItem("accountType"); // Store account type from the token or API

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element= <Login /> />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={isAuthenticated && accountType === "ROLE_ADMIN" ? <AdminDashboard /> : <Navigate to="/" />} />
                <Route path="/user" element={isAuthenticated && accountType === "ROLE_USER" ? <UserDashboard /> : <Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default App;
