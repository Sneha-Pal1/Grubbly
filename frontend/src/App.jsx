import React, { useState } from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import PlaceOrder from "./pages/PlaceOrder";
import Footer from "./components/Footer";
import LoginPopup from "./components/LoginPopup";
import Verify from "./pages/Verify";
import MyOrders from "./pages/MyOrders";
import TrackOrder from "./pages/TrackOrder"; // Import the WebSocket and map order tracking page
import PartnerLayout from "./components/PartnerLayout/PartnerLayout";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  
  // Scoped check to hide customer layout elements when browsing the partner portal
  const isPartnerRoute = location.pathname.startsWith("/partner");

  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <div className={isPartnerRoute ? "" : "app"}>
        {!isPartnerRoute && <Navbar setShowLogin={setShowLogin} />}
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/myorders" element={<MyOrders />} />
          {/* Active delivery tracking map route */}
          <Route path="/track/:orderId" element={<TrackOrder />} />

          {/* Consolidated Vendor & Admin Dashboard Portal Route */}
          <Route path="/partner/*" element={<PartnerLayout />} />
        </Routes>
      </div>
      {!isPartnerRoute && <Footer />}
    </>
  );
};

export default App;

