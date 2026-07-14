import React from "react";
import "./PartnerSidebar.css";
import { assets } from "../../assets/admin_assets/assets";
import { NavLink } from "react-router-dom";

const PartnerSidebar = () => {
  return (
    <div className="partner-sidebar">
      <div className="partner-sidebar-options">
        <NavLink to="/partner/dashboard" className="partner-sidebar-option">
          <img src={assets.order_icon} alt="Dashboard" style={{ filter: "hue-rotate(45deg)" }} />
          <p>Dashboard</p>
        </NavLink>
        <NavLink to="/partner/add" className="partner-sidebar-option">
          <img src={assets.add_icon} alt="Add Items" />
          <p>Add Items</p>
        </NavLink>
        <NavLink to="/partner/list" className="partner-sidebar-option">
          <img src={assets.order_icon} alt="List Items" />
          <p>List Items</p>
        </NavLink>
        <NavLink to="/partner/orders" className="partner-sidebar-option">
          <img src={assets.add_icon} alt="Orders" />
          <p>Orders</p>
        </NavLink>
      </div>
    </div>
  );
};

export default PartnerSidebar;
