import React from "react";
import "./Footer.css";
import logoo from "../frontend_assets/logoo.png";
import facebook_icon from "../frontend_assets/facebook_icon.png";
import twitter_icon from "../frontend_assets/twitter_icon.png";
import linkedin_icon from "../frontend_assets/linkedin_icon.png";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={logoo} alt="logo" className="footer-logo" />
          <p>
            Grubbly brings your favorite meals straight to your door, fresh and
            fast. Whether it’s a quick snack or a family feast, we partner with
            the best local restaurants to deliver delicious food anytime,
            anywhere. Your cravings, our priority!
          </p>
          <div className="footer-social-icons">
            <img src={facebook_icon} alt="" />
            <img src={twitter_icon} alt="" />
            <img src={linkedin_icon} alt="" />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>HOME</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+91 9999999999</li>
            <li>contact@Grubbly.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        Copyright 2025 &copy; Grubbly.com - All Right Reserved.
      </p>
    </div>
  );
};
export default Footer;
