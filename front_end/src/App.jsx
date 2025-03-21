import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
  } from "react-router-dom";
  import NavBar from "./components/NavBar";
  import Login from "./pages/Login.jsx";
  import RegisterPage from "./pages/Register.jsx";
  import AdminDashboard from "./pages/AdminDashboard.jsx";
  import UserDashboard from "./pages/UserDashboard.jsx";
  import WaiterDashboard from "./pages/WaiterDashboard.jsx";
  import Home from "./pages/Home.jsx";
  import MenuPage from "./pages/AdminMenuPage.jsx";
  import { useAuth } from "./AuthContext.jsx";
  
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
  
  const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );
  
  const App = () => {
    const { userData, isLoading } = useAuth();
    const isAuthenticated = !!userData;
    const accountType = userData?.accountType;
  
    if (isLoading) {
      return <LoadingSpinner />;
    }
  
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
  