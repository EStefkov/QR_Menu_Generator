import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import RegisterPage from "./pages/Register.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import WaiterDashboard from "./pages/WaiterDashboard.jsx";
import Home from "./pages/Home.jsx";
import MenuPage from "./pages/MenuPage.jsx";
import "./App.css";

const App = () => {
    const isAuthenticated = !!localStorage.getItem("token");
    const accountType = localStorage.getItem("accountType"); // Retrieve account type from localStorage

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/menus/:menuId" element={<MenuPage />} />
                <Route
                    path="/admin"
                    element={
                        isAuthenticated && accountType === "ROLE_ADMIN" ? (
                            <AdminDashboard />
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                />
                <Route
                    path="/user"
                    element={
                        isAuthenticated && accountType === "ROLE_USER" ? (
                            <UserDashboard />
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                />
                <Route
                    path="/waiter"
                    element={
                        isAuthenticated && accountType === "ROLE_WAITER" ? (
                            <WaiterDashboard />
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
