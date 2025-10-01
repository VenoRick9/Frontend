import { useState } from "react";
import { Link } from "react-router-dom";
import api, { handleApiError } from "../api";

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        login,
        password,
      });

      const { accessToken, refreshToken } = response.data;


      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      window.location.href = "/items";
    } catch (error) {
      if (error.response) {
        handleApiError(error, "Wrong login or password");
      } else {
        alert("Something wrong with connection");
      }
    }
  };



  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ transform: "translateY(0%)" }}
    >
      <div className="card-custom shadow-lg" style={{ width: "450px" }}>
        <h2 className="text-center mb-4 brand-green">Sign in</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label className="form-label">Login</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-green w-100">
            Sign in
          </button>
        <p className="text-center mt-3">
        Don't have an account?{" "}
        <Link to="/register" className="brand-green fw-bold">
            Sign up
        </Link>
        </p>

        </form>
      </div>
    </div>
  );
}
