import React, { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="brand">
          <span className="brand-icon">🍿</span>
          <span className="gradient-text">CineMatch</span>
        </Link>

        <ul className="nav-menu">
          <li>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/recommend" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              AI Recommendations
            </NavLink>
          </li>
          {user && (
            <li>
              <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                My History
              </NavLink>
            </li>
          )}
        </ul>

        <div className="nav-auth">
          {user ? (
            <>
              <span className="username-tag">
                👤 {user.username}
              </span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">
                Login
              </Link>
              <Link to="/register" className="gradient-btn" style={{ padding: "8px 20px", borderRadius: "20px", fontSize: "14px" }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
