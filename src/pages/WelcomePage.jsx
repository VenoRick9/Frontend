
import { useNavigate } from "react-router-dom";
import "../css/WelcomePage.css";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
    
      <div className="decorative-elements">
        <div className="leaf"></div>
        <div className="leaf"></div>
        <div className="leaf"></div>
        <div className="leaf"></div>
      </div>

      <div className="welcome-content">
        <h1 className="welcome-title">Welcome to PandaShop</h1>
        <p className="welcome-subtitle">
          Your favorite online marketplace with the best prices and fastest delivery. 
          Join our community today!
        </p>
        
        <div className="button-group">
          <button
            onClick={() => navigate("/login")}
            className="btn-wel btn-login"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="btn-wel btn-register"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}