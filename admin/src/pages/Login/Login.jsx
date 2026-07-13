import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Login.css";

const Login = ({ url, setToken, setRole }) => {
  const [currState, setCurrState] = useState("Login"); // Tracks toggle state: "Login" or "Register (Vendor)"
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    let endpoint = "/api/user/login";
    let payload = {
      email: formData.email,
      password: formData.password,
    };

    if (currState === "Register") {
      endpoint = "/api/user/register";
      payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "vendor", // Automatically register new admin portal signups as vendors
      };
    }

    try {
      console.log(`📤 Sending auth request to endpoint ${endpoint}...`);
      const response = await axios.post(url + endpoint, payload);

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Authorization check: Make sure role is either 'admin' or 'vendor'
        if (user.role !== "admin" && user.role !== "vendor") {
          toast.error("Access Denied: You do not have permissions to access the dashboard.");
          return;
        }

        // Save token and role details
        setToken(token);
        setRole(user.role);
        
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminRole", user.role);
        localStorage.setItem("adminName", user.name);
        
        toast.success(`Welcome back, ${user.name}! (${user.role.toUpperCase()})`);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("Failed to connect to the authentication server.");
    }
  };

  return (
    <div className="admin-login">
      <div className="login-container">
        <h2>
          Grubbly <span className="brand">Portal</span>
        </h2>
        <p>{currState === "Login" ? "Sign in to manage your kitchen" : "Create a new vendor partner account"}</p>
        
        <form onSubmit={onSubmitHandler} className="login-form">
          {currState === "Register" && (
            <div className="form-group">
              <label htmlFor="name">Restaurant Name</label>
              <input
                required
                id="name"
                name="name"
                onChange={onChangeHandler}
                value={formData.name}
                type="text"
                placeholder="e.g., Pizza Palace"
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              required
              id="email"
              name="email"
              onChange={onChangeHandler}
              value={formData.email}
              type="email"
              placeholder="name@restaurant.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              required
              id="password"
              name="password"
              onChange={onChangeHandler}
              value={formData.password}
              type="password"
              placeholder="Min. 8 characters"
            />
          </div>

          <button type="submit" className="login-button">
            {currState === "Login" ? "Login" : "Sign Up"}
          </button>
        </form>

        {currState === "Login" ? (
          <p className="register-tip">
            Want to partner with us?{" "}
            <span style={{ color: "#ff6347", cursor: "pointer", fontWeight: 600 }} onClick={() => setCurrState("Register")}>
              Register Vendor Account
            </span>
          </p>
        ) : (
          <p className="register-tip">
            Already registered?{" "}
            <span style={{ color: "#ff6347", cursor: "pointer", fontWeight: 600 }} onClick={() => setCurrState("Login")}>
              Sign In Here
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
