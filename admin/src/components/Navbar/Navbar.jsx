import React from "react";
import "./Navbar.css";
import { assets } from "../../assets/admin_assets/assets";

// The Navbar component displays the branding logo and includes a logout trigger if the user is authenticated.
const Navbar = ({ token, setToken, setRole }) => {
  const logoutHandler = () => {
    // Clear all authorization states and local storage details
    setToken("");
    setRole("");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminName");
  };

  return (
    <div className="navbar">
      <img className="logoo" src={assets.logoo} alt="" />
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {token && (
          <button 
            onClick={logoutHandler} 
            style={{ 
              backgroundColor: "#ff6347", 
              color: "white", 
              border: "none", 
              padding: "6px 12px", 
              borderRadius: "4px", 
              cursor: "pointer", 
              fontWeight: 500,
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            Logout
          </button>
        )}
        <img className="profile" src={assets.catlogo} alt="" />
      </div>
    </div>
  );
};

export default Navbar;

