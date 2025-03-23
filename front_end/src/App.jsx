import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
  } from "react-router-dom";
  import { useContext } from "react";
  import NavBar from "./components/NavBar";
  import Login from "./pages/Login.jsx";
  import RegisterPage from "./pages/Register.jsx";
  import AdminDashboard from "./pages/AdminDashboard.jsx";
  import UserDashboard from "./pages/UserDashboard.jsx";
  import WaiterDashboard from "./pages/WaiterDashboard.jsx";
  import Home from "./pages/Home.jsx";
  import MenuPage from "./pages/AdminMenuPage.jsx";
  import Favorites from "./pages/Favorites.jsx";
  import { AuthContext } from "./AuthContext.jsx";
  
  const Layout = ({ children }) => {
    const location = useLocation();
    // Don't show NavBar on login and register pages
    const hideNavBar = location.pathname === "/login" || location.pathname === "/register";
  
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        {!hideNavBar && <NavBar />}
        <div className="container mx-auto p-4 max-w-7xl">{children}</div>
      </div>
    );
  };
  
  const App = () => {
    const { userData } = useContext(AuthContext);
    const isAuthenticated = !!userData.token;
    const accountType = userData.accountType;
  
    return (
      <Router>
        <Routes>
          {/* Home / Public */}
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
  
          {/* Login / Register */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />
  
          {/* Menu page by ID */}
          <Route
            path="/menu/:menuId"
            element={
              <Layout>
                <MenuPage />
              </Layout>
            }
          />
  
          {/* Favorites */}
          <Route
            path="/favorites"
            element={
              isAuthenticated ? (
                <Layout>
                  <Favorites />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
  
          {/* Admin Dashboard */}
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
  
          {/* User Dashboard */}
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
  
          {/* Waiter Dashboard */}
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
  