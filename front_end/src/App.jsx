import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
  } from "react-router-dom";
  import { useContext, useEffect, useState, useRef } from "react";
  import NavBar from "./components/NavBar";
  import Login from "./pages/Login.jsx";
  import RegisterPage from "./pages/Register.jsx";
  import UserDashboard from "./pages/UserDashboard.jsx";
  import WaiterDashboard from "./pages/WaiterDashboard.jsx";
  import Home from "./pages/Home.jsx";
  import MenuPage from "./pages/AdminMenuPage.jsx";
  import EditMenuPage from "./pages/Menu/EditMenuPage.jsx";
  import Favorites from "./pages/Favorites.jsx";
  import { AuthContext } from "./contexts/AuthContext.jsx";
  import { CartProvider } from './contexts/CartContext';
  import { useLanguage } from './contexts/LanguageContext';
  import Cart from "./components/Cart.jsx";
  import OrderReview from "./components/OrderReview.jsx";
  import OrderConfirmation from "./components/OrderConfirmation.jsx";
  import OrderHistory from "./components/OrderHistory.jsx";
  import OrderDetail from './components/OrderDetail.jsx';
  import ProtectedRoute from './components/ProtectedRoute';
  import ProfilePage from './pages/Profile/ProfilePage';
  import RestaurantMenus from './pages/Restaurants/RestaurantMenus';
  import { getStoredToken } from './api/account';
  import ManagerDashboard from "./pages/ManagerDashboard.jsx";
  import CoManagerDashboard from "./pages/CoManagerDashboard.jsx";
  
  const Layout = ({ children }) => {
    const location = useLocation();
    const { language, changeLanguage } = useLanguage();
  
    // Don't show NavBar on login and register pages
    const hideNavBar = location.pathname === "/login" || location.pathname === "/register";
  
    // Add state to track if language reload is needed
    const [shouldReload, setShouldReload] = useState(false);
    
    // Track previous language for change detection
    const prevLanguageRef = useRef(language);
  
    // Make sure language is correctly set
    useEffect(() => {
      // Get stored language preference
      const storedLang = localStorage.getItem('language');
      
      // Apply language preference
      if (storedLang && storedLang !== language) {
        console.log(`Initializing language from localStorage in Layout: ${storedLang}`);
        changeLanguage(storedLang);
        
        // Set HTML lang attribute for accessibility
        document.documentElement.setAttribute('lang', storedLang);
      }
      
      // Apply stored theme preference
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, []);
  
    // Watch for language changes and force a reload if needed
    useEffect(() => {
      // Check if language has changed since last render
      if (prevLanguageRef.current !== language) {
        console.log(`Language changed from ${prevLanguageRef.current} to ${language}`);
        
        // Alternative approach: enable this line to force reload on language change
        // Uncomment if translations still don't update:
        // window.location.reload();
        
        // Update ref for next change
        prevLanguageRef.current = language;
      }
    }, [language]);
  
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        {!hideNavBar && <NavBar />}
        <div className="container mx-auto p-4 max-w-7xl">{children}</div>
      </div>
    );
  };
  
  const App = () => {
    const { userData } = useContext(AuthContext);
    const [currentPath, setCurrentPath] = useState(window.location.pathname);
    const isProfilePage = currentPath.includes('/profile');
    
    // Improved authentication check that prioritizes localStorage
    const isAuthenticated = !!userData.token || !!localStorage.getItem('token');
    const accountType = userData.accountType || localStorage.getItem('accountType');
    const { language } = useLanguage();
  
    // Update current path on navigation
    useEffect(() => {
      const handleLocationChange = () => {
        setCurrentPath(window.location.pathname);
      };
      
      window.addEventListener('popstate', handleLocationChange);
      return () => window.removeEventListener('popstate', handleLocationChange);
    }, []);
  
    // Set up app-wide effects
    useEffect(() => {
      // Update the HTML lang attribute whenever language changes
      document.documentElement.setAttribute('lang', language);
      
      // Set up viewport meta tag for responsive design
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
        document.head.appendChild(meta);
      }
      
      // Ensure correct theme is applied
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const storedTheme = localStorage.getItem('theme');
      
      if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      console.log(`App initialized with language: ${language}`);
    }, [language]);
  
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
                <Navigate to="/" />
              )
            }
          />
  
          {/* Admin Dashboard - Redirect to Profile */}
          <Route
            path="/admin"
            element={
              isAuthenticated && accountType === "ROLE_ADMIN" ? (
                <Navigate to="/profile" />
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
  
          {/* Manager Dashboard */}
          <Route
            path="/manager"
            element={
              isAuthenticated && (accountType === "ROLE_MANAGER" || localStorage.getItem("accountType") === "ROLE_MANAGER") ? (
                <Layout>
                  <ManagerDashboard />
                </Layout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
  
          {/* Co-Manager Dashboard */}
          <Route
            path="/comanager"
            element={
              isAuthenticated && (accountType === "ROLE_COMANAGER" || localStorage.getItem("accountType") === "ROLE_COMANAGER") ? (
                <Layout>
                  <CoManagerDashboard />
                </Layout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
  
          {/* Co-Manager Menus */}
          <Route
            path="/comanager/menus"
            element={
              <ProtectedRoute role="ROLE_COMANAGER">
                <Layout>
                  <RestaurantMenus />
                </Layout>
              </ProtectedRoute>
            }
          />
  
          {/* Co-Manager Edit Menu */}
          <Route
            path="/comanager/menu/:menuId/edit"
            element={
              <ProtectedRoute role="ROLE_COMANAGER">
                <Layout>
                  <EditMenuPage />
                </Layout>
              </ProtectedRoute>
            }
          />
  
          {/* Manager Menus - For viewing and editing restaurant menus */}
          <Route
            path="/manager/menus"
            element={
              <ProtectedRoute role="ROLE_MANAGER">
                <Layout>
                  <RestaurantMenus />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Additional route for manager menus with restaurantId parameter */}
          <Route
            path="/manager/menus/:restaurantId"
            element={
              <ProtectedRoute role="ROLE_MANAGER">
                <Layout>
                  <RestaurantMenus />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Manager Edit Menu - For editing a specific menu */}
          <Route
            path="/manager/menu/:menuId/edit"
            element={
              <ProtectedRoute role="ROLE_MANAGER">
                <Layout>
                  <EditMenuPage />
                </Layout>
              </ProtectedRoute>
            }
          />
  
          {/* Add new routes for cart functionality */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/order-review" element={<OrderReview />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          
          {/* Admin route for order history */}
          <Route 
            path="/admin/orders" 
            element={
              <ProtectedRoute role="ROLE_ADMIN">
                <OrderHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/orders/:orderId" 
            element={
              <ProtectedRoute role="ROLE_ADMIN">
                <OrderDetail />
              </ProtectedRoute>
            } 
          />
          
          {/* Restaurant menus routes */}
          <Route
            path="/admin/restaurants/:restaurantId/menus"
            element={
              <ProtectedRoute role="ROLE_ADMIN">
                <Layout>
                  <RestaurantMenus />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Alternative route for restaurant menus */}
          <Route
            path="/restaurants/:restaurantId/menus"
            element={
              <ProtectedRoute role="ROLE_ADMIN">
                <Layout>
                  <RestaurantMenus />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Menu edit page with categories and products management */}
          <Route
            path="/admin/menu/:menuId/edit"
            element={
              <ProtectedRoute role="ROLE_ADMIN">
                <Layout>
                  <EditMenuPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Profile page */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Edit Menu Page */}
          <Route
            path="/admin/restaurants/:restaurantId/menus/edit"
            element={
              <ProtectedRoute role="ROLE_ADMIN">
                <Layout>
                  <EditMenuPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    );
  };
  
  export default App;
  