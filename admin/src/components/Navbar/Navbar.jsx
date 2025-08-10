import React from "react";
import "./Navbar.css";
import { assets } from "../../assets/admin_assets/assets";

const Navbar = () => {
  return (
    <div className="navbar">
      <img className="logoo" src={assets.logoo} alt="" />
      <img src={assets.catlogo} alt="" />
    </div>
  );
};

export default Navbar;
