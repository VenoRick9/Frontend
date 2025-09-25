import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import "../css/Header.css";

export default function Header() {
  const location = useLocation();
  const { cart } = useContext(CartContext);

  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }


  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="custom-header d-flex justify-content-between align-items-center px-4 py-3">
      <Link to="/items" className="site-logo">
        PandaShop
      </Link>

      <div className="d-flex align-items-center">
        <Link to="/profile" className="btn btn-outline-light me-2">
          Profile
        </Link>
        <Link to="/orders" className="btn btn-outline-light me-2">
          Orders
        </Link>
        <Link to="/cart" className="btn btn-outline-light position-relative">
          Cart
          {totalItems > 0 && (
            <span className="cart-badge">{totalItems}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
