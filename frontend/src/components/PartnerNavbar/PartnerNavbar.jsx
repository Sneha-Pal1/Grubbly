import React from "react";
import "./PartnerNavbar.css";
import { assets } from "../../assets/admin_assets/assets";

const PartnerNavbar = ({ token, setToken, setRole }) => {
  const logoutHandler = () => {
    // Clear all authorization states and local storage details
    setToken("");
    setRole("");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminName");
  };

  return (
    <div className="partner-navbar">
      <img className="logoo" src={assets.logoo} alt="Grubbly Partner" />
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
        <img className="profile" src={assets.catlogo} alt="Profile" />
      </div>
    </div>
  );
};

export default PartnerNavbar;
