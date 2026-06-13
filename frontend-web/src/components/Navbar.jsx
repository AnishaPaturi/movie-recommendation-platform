import React from "react";
import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
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
          <li>
            <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              My History
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
