import React from "react";
import "./Navbar.css";



const Navbar = ({ onNavigate }) => {
  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li>
          <button onClick={() => onNavigate("create")}>
            Create Product
          </button>
        </li>
        <li>
          <button onClick={() => onNavigate("list")}>
            List Products
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
