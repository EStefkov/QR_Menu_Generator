import { Link, useNavigate } from "react-router-dom";
import "./NavBar.css";

// Function to decode the JWT token payload
const decodeToken = (token) => {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Invalid token", e);
        return null;
    }
};

const NavBar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const userData = token ? decodeToken(token) : null;

    const handleLogout = () => {
        // Clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("accountType");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");
        localStorage.removeItem("profilePicture");
        // Navigate to home or login page
        navigate("/login");
    };

    return (
        <nav className="navbar">
            {/* Left side (Navigation Links) */}
            <div className="navbar-left">
                <Link to="/" className="nav-link">
                    Home
                </Link>
                <Link to="/menus" className="nav-link">
                    Menus
                </Link>
                <Link to="/about" className="nav-link">
                    About
                </Link>
            </div>

            {/* Right side (Profile Section) */}
            <div className="navbar-right">
                {userData ? (
                    <div className="profile-section">
                        <span className="welcome-text">
                            Welcome, {userData.firstName} {userData.lastName}
                        </span>
                        <img
                            src={userData.profilePicture}
                            alt="Profile"
                            className="profile-picture"
                        />
                        <button className="logout-button" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="auth-links">
                        <Link to="/login" className="nav-link">
                            Login
                        </Link>
                        <Link to="/register" className="nav-link">
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
