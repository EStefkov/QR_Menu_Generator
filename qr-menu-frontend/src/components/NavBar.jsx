import { Link } from "react-router-dom";
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
    // Retrieve the token from localStorage
    const token = localStorage.getItem("token");
    const userData = token ? decodeToken(token) : null;

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
                    </div>
                ) : (
                    <span className="welcome-text">Welcome, Guest</span>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
