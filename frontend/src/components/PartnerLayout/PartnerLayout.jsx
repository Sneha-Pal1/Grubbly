import React, { useState } from "react";
import PartnerNavbar from "../PartnerNavbar/PartnerNavbar";
import PartnerSidebar from "../PartnerSidebar/PartnerSidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import PartnerAdd from "../../pages/PartnerAdd/PartnerAdd";
import PartnerList from "../../pages/PartnerList/PartnerList";
import PartnerOrders from "../../pages/PartnerOrders/PartnerOrders";
import PartnerDashboard from "../../pages/PartnerDashboard/PartnerDashboard";
import PartnerLogin from "../../pages/PartnerLogin/PartnerLogin";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./PartnerLayout.css";

const PartnerLayout = () => {
  const url = "https://grubbly-backend.onrender.com"; // Set the live deployed production backend URL
  
  // Read authorization token and user role from localStorage if they exist (maintains sessions across reloads)
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [role, setRole] = useState(localStorage.getItem("adminRole") || "");

  // If no auth token is active or role is customer, restrict access and display only the Login page
  if (!token || role === "customer") {
    return (
      <div className="partner-app-wrapper">
        <ToastContainer />
        <PartnerLogin url={url} setToken={setToken} setRole={setRole} />
      </div>
    );
  }

  return (
    <div className="partner-app-wrapper">
      <ToastContainer />
      <PartnerNavbar token={token} setToken={setToken} setRole={setRole} />
      <hr />
      <div className="partner-app-content">
        <PartnerSidebar />
        <div className="partner-main-content">
          <Routes>
            {/* Scoped Dashboard, Catalog, and Orders routes */}
            <Route path="dashboard" element={<PartnerDashboard url={url} token={token} role={role} />} />
            <Route path="add" element={<PartnerAdd url={url} token={token} role={role} />} />
            <Route path="list" element={<PartnerList url={url} token={token} role={role} />} />
            <Route path="orders" element={<PartnerOrders url={url} token={token} role={role} />} />
            
            {/* Fallback route inside partner layout context */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default PartnerLayout;
