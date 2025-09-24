import { Link, useLocation } from "react-router-dom";
import "../Header.css";

export default function Header() {
  const location = useLocation();

  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <header className="custom-header d-flex justify-content-between align-items-center px-4 py-3">
    
      <Link to="/items" className="site-logo">
        🛒 ShopEasy
      </Link>

    
      <div>
        <Link to="/profile" className="btn btn-outline-light me-2">
          Profile
        </Link>
        <Link to="/cart" className="btn btn-outline-light">
          Cart
        </Link>
      </div>
    </header>
  );
}
