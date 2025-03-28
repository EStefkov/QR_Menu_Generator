import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

function ProtectedRoute({ children, role }) {
  const { userData } = useContext(AuthContext);
  
  // Check if the user is logged in
  if (!userData || !userData.token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  // If a specific role is required, check if the user has that role
  if (role && userData.accountType !== role) {
    // Redirect to home if the user doesn't have the required role
    return <Navigate to="/" replace />;
  }
  
  // If user is authenticated and has the required role (if any), render the children
  return children;
}

export default ProtectedRoute; 