import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Login from "./pages/Login.jsx";
import RegisterPage from "./pages/Register.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import WaiterDashboard from "./pages/WaiterDashboard.jsx";
import Home from "./pages/Home.jsx";
import MenuPage from "./pages/MenuPage.jsx";

const Layout = ({ children }) => {
    const location = useLocation();
    
    // Не показваме NavBar на страниците за вход и регистрация
    const hideNavBar = location.pathname === "/login" || location.pathname === "/register";

    return (
        <div className="min-h-screen bg-gray-100">
            {!hideNavBar && <NavBar />}
            <div className="container mx-auto p-4">{children}</div>
        </div>
    );
};

const App = () => {
    const isAuthenticated = !!localStorage.getItem("token");
    const accountType = localStorage.getItem("accountType");

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <Layout>
                            <Home />
                        </Layout>
                    }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                    path="/menus/:menuId"
                    element={
                        <Layout>
                            <MenuPage />
                        </Layout>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        isAuthenticated && accountType === "ROLE_ADMIN" ? (
                            <Layout>
                                <AdminDashboard />
                            </Layout>
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                />
                <Route
                    path="/user"
                    element={
                        isAuthenticated && accountType === "ROLE_USER" ? (
                            <Layout>
                                <UserDashboard />
                            </Layout>
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                />
                <Route
                    path="/waiter"
                    element={
                        isAuthenticated && accountType === "ROLE_WAITER" ? (
                            <Layout>
                                <WaiterDashboard />
                            </Layout>
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
