import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


const ProtectedRoute = ({ requiredRole }) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {

    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

  
    const roles = decoded?.realm_access?.roles || [];

    if (requiredRole && !roles.includes(requiredRole)) {
      return <Navigate to="/items" replace />;
    }

    return <Outlet />; 
  } catch (error) {
    console.error("Invalid JWT", error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
