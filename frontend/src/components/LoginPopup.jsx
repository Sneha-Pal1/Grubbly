import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import cross_icon from "../frontend_assets/cross_icon.png";
import { StoreContext } from "../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const [currState, setCurrState] = useState("Login");
  const [loginRole, setLoginRole] = useState("customer");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    let newUrl = url;
    let payload = {
      email: data.email,
      password: data.password,
    };

    if (currState === "Login") {
      newUrl += "/api/user/login";
    } else {
      newUrl += "/api/user/register";
      payload.name = data.name;
      payload.role = loginRole;
    }

    const response = await axios.post(newUrl, payload);

    if (response.data.success) {
      const { token, user } = response.data;
      setToken(token);
      localStorage.setItem("token", token);
      setShowLogin(false);

      // If user logs in with a vendor or admin role, redirect them to the partner portal
      if (user && (user.role === "vendor" || user.role === "admin")) {
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminRole", user.role);
        localStorage.setItem("adminName", user.name);
        navigate("/partner/dashboard");
      }
    } else {
      alert(response.data.message);
    }
  };

  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img onClick={() => setShowLogin(false)} src={cross_icon} alt="" />
        </div>
        <div className="login-popup-role-selector">
          <button
            type="button"
            className={loginRole === "customer" ? "active" : ""}
            onClick={() => setLoginRole("customer")}
          >
            Customer
          </button>
          <button
            type="button"
            className={loginRole === "vendor" ? "active" : ""}
            onClick={() => setLoginRole("vendor")}
          >
            Vendor
          </button>
        </div>
        <div className="login-popup-inputs">
          {currState === "Login" ? (
            <></>
          ) : (
            <input
              name="name"
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              placeholder="your name"
              required
            />
          )}
          <input
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder="your email"
            required
          />
          <input
            name="password"
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            placeholder="password"
            required
          />
        </div>
        <button type="submit">
          {currState === "Sign Up" ? "Create account" : "Login"}
        </button>
        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
        {currState === "Login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => setCurrState("Sign Up")}>Click Here</span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span onClick={() => setCurrState("Login")}>Login Here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
