import React, { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const url = "https://grubbly-backend.onrender.com"; // Set the live deployed production backend URL
  
  // Read authorization token and user role from localStorage if they exist (maintains sessions across reloads)
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [role, setRole] = useState(localStorage.getItem("adminRole") || "");

  // If no auth token is active, restrict access and display only the Login page
  if (!token) {
    return (
      <div>
        <ToastContainer />
        <Login url={url} setToken={setToken} setRole={setRole} />
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <Navbar token={token} setToken={setToken} setRole={setRole} />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          {/* Main Scoped Analytics Dashboard Route */}
          <Route path="/dashboard" element={<Dashboard url={url} token={token} role={role} />} />
          
          {/* Catalog & Inventory Management Routes */}
          <Route path="/add" element={<Add url={url} token={token} role={role} />} />
          <Route path="/list" element={<List url={url} token={token} role={role} />} />
          
          {/* Order Updates and Map Delivery View Routes */}
          <Route path="/orders" element={<Orders url={url} token={token} role={role} />} />
          
          {/* Redirect any unspecified paths back to the main dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;

