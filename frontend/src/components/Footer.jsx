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
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora,
            cumque ratione. Nihil corporis, eos ratione, obcaecati voluptates ex
            similique hic qui rerum numquam ad quisquam consequuntur labore
            quasi quis nobis?
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
            <li>contact@tomato.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        Copyright 2025 &copy; Tomato.com - All Right Reserved.
      </p>
    </div>
  );
};
export default Footer;
