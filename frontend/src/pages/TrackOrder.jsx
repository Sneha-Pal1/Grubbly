import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";
import axios from "axios";
import io from "socket.io-client";
import "./TrackOrder.css";

const TrackOrder = () => {
  const { orderId } = useParams(); // Retrieves orderId from the URL path /track/:orderId
  const { url, token } = useContext(StoreContext);
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("Food Processing"); // Local status state hooked to websocket
  const [loading, setLoading] = useState(true);

  const mapRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const animationIntervalRef = useRef(null);

  // Status steps mapping for the visual timeline indicator
  const steps = ["Food Processing", "Out For Delivery", "Delivered"];

  // Fetch the latest order details upon page loading
  const fetchOrderDetails = async () => {
    try {
      const res = await axios.get(`${url}/api/order/details/${orderId}`, {
        headers: { token },
      });
      if (res.data.success) {
        const orderData = res.data.data;
        setOrder(orderData);
        setStatus(orderData.status);
      } else {
        alert("Failed to load order details.");
        navigate("/myorders");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      navigate("/myorders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchOrderDetails();
  }, [orderId, token]);

  // WebSocket Connection Hook for Live Status Updates
  useEffect(() => {
    // Connect to backend WebSocket server
    const socket = io(url);

    console.log(`🔌 Connecting to WebSockets for order ${orderId}...`);
    socket.emit("join_order_room", orderId); // Notify server to route notifications for this order to this socket

    // Listen for live order status changes broadcasted by the admin/vendor
    socket.on("status_update", (eventData) => {
      console.log("📣 Real-time WebSocket update received:", eventData);
      if (eventData.orderId === orderId) {
        setStatus(eventData.status);
      }
    });

    // Cleanup connection on unmount
    return () => {
      socket.disconnect();
      console.log("🔌 Disconnected WebSockets.");
    };
  }, [orderId, url]);

  // Leaflet Map Initialization and Rider Simulation Effect
  useEffect(() => {
    if (!order || !window.L || loading) return;

    // Use order coordinate pin if available, otherwise fallback to default coordinates
    const customerLatLng = order.coordinates && order.coordinates.lat 
      ? [order.coordinates.lat, order.coordinates.lng]
      : [12.9716, 77.5946];

    // Mock a restaurant coordinates slightly offset (about 1km away)
    const restaurantLatLng = [
      customerLatLng[0] + 0.006, 
      customerLatLng[1] - 0.007
    ];

    // Initialize the Leaflet Map container if not already instantiated
    if (!mapRef.current) {
      console.log("🗺️ Rendering Track Map...");
      const map = window.L.map("track-map").setView(customerLatLng, 14);
      mapRef.current = map;

      // Add OpenStreetMap tiles
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Create Custom Icons for Map Pins
      const restIcon = window.L.divIcon({
        className: "custom-map-icon rest-icon",
        html: "<span>🏪</span>",
        iconSize: [30, 30],
      });

      const custIcon = window.L.divIcon({
        className: "custom-map-icon cust-icon",
        html: "<span>🏠</span>",
        iconSize: [30, 30],
      });

      const riderIcon = window.L.divIcon({
        className: "custom-map-icon rider-icon",
        html: "<span>🛵</span>",
        iconSize: [35, 35],
      });

      // Place Restaurant & Customer Markers
      window.L.marker(restaurantLatLng, { icon: restIcon }).addTo(map).bindPopup("Restaurant Kitchen");
      window.L.marker(customerLatLng, { icon: custIcon }).addTo(map).bindPopup("Your Home");

      // Draw dotted path polyline showing delivery route
      const pathLine = window.L.polyline([restaurantLatLng, customerLatLng], {
        color: "#ff6347",
        dashArray: "5, 10",
        weight: 3
      }).addTo(map);

      // Center map view bounds to cover both markers
      map.fitBounds(pathLine.getBounds(), { padding: [40, 40] });

      // Place the rider marker initially at the restaurant
      const riderMarker = window.L.marker(restaurantLatLng, { icon: riderIcon }).addTo(map).bindPopup("Delivery Rider");
      riderMarkerRef.current = riderMarker;
    }

    // SIMULATE RIDER MOVEMENT BASED ON ACTIVE STATUS
    const rider = riderMarkerRef.current;
    if (rider) {
      // Clear previous animations if any
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }

      // Case A: Food is Processing
      if (status === "Food Processing") {
        rider.setLatLng(restaurantLatLng); // Keep rider parked at restaurant
        rider.getPopup().setContent("Rider: Waiting for food preparation...").openOn(mapRef.current);
      } 
      // Case B: Delivered
      else if (status === "Delivered") {
        rider.setLatLng(customerLatLng); // Move rider directly to customer
        rider.getPopup().setContent("Rider: Order Delivered! Bon Appétit!").openOn(mapRef.current);
      } 
      // Case C: Out For Delivery
      else if (status === "Out For Delivery" || status === "Out for Delivery") {
        rider.getPopup().setContent("Rider: Out for Delivery! Moving to your location...").openOn(mapRef.current);
        
        let progress = 0; // Move from 0 (restaurant) to 1 (customer)
        const totalSteps = 100;

        // Animate rider along the polyline path incrementally
        animationIntervalRef.current = setInterval(() => {
          progress += 1;
          if (progress >= totalSteps) {
            clearInterval(animationIntervalRef.current);
            rider.setLatLng(customerLatLng);
            rider.getPopup().setContent("Rider: Arrived at your location!");
          } else {
            // Linear interpolation to find current coordinate step
            const currentLat = restaurantLatLng[0] + (customerLatLng[0] - restaurantLatLng[0]) * (progress / totalSteps);
            const currentLng = restaurantLatLng[1] + (customerLatLng[1] - restaurantLatLng[1]) * (progress / totalSteps);
            rider.setLatLng([currentLat, currentLng]);
          }
        }, 150); // Updates position every 150ms
      }
    }

    // Cleanup animation interval on effect updates
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [order, status, loading]);

  if (loading) {
    return <div className="track-order-loading">Loading live delivery status...</div>;
  }

  // Get index of current step to color the timeline progress
  const currentStepIndex = steps.findIndex(
    (step) => step.toLowerCase() === status.toLowerCase()
  );

  return (
    <div className="track-order-page">
      <div className="track-header">
        <h2>Order Tracking</h2>
        <p>Order ID: <b>{orderId}</b></p>
      </div>

      <div className="track-container">
        {/* LEFT COLUMN: TIMELINE PROGRESS */}
        <div className="track-info">
          <h3>Delivery Status</h3>
          <div className="status-timeline">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isActive = idx === currentStepIndex;
              
              return (
                <div key={idx} className={`timeline-step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}>
                  <div className="step-circle">
                    {idx === 0 ? "🍳" : idx === 1 ? "🛵" : "🎁"}
                  </div>
                  <div className="step-content">
                    <p className="step-title">{step}</p>
                    <p className="step-desc">
                      {idx === 0 && "Restaurant is preparing your delicious meal."}
                      {idx === 1 && "Rider has picked up the food and is on the way."}
                      {idx === 2 && "Food reached your address. Thank you for ordering!"}
                    </p>
                  </div>
                  {idx < steps.length - 1 && <div className="step-connector"></div>}
                </div>
              );
            })}
          </div>

          <div className="order-details-card">
            <h4>Order Details</h4>
            <div className="details-row">
              <span>Customer:</span>
              <span>{order?.address?.firstname} {order?.address?.lastname}</span>
            </div>
            <div className="details-row">
              <span>Deliver To:</span>
              <span>{order?.address?.street}, {order?.address?.city}</span>
            </div>
            <div className="details-row">
              <span>Paid Status:</span>
              <span className={`paid-tag ${order?.payment ? "paid" : "unpaid"}`}>
                {order?.payment ? "PAID ONLINE" : "CASH ON DELIVERY"}
              </span>
            </div>
            <hr />
            <div className="items-list">
              {order?.items?.map((item, index) => (
                <div key={index} className="item-row">
                  <span>{item.name} <b>x{item.quantity}</b></span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <hr />
            <div className="details-row total">
              <span>Total Amount (incl. delivery):</span>
              <span>₹{order?.amount}</span>
            </div>
            <button className="back-button" onClick={() => navigate("/myorders")}>
              Back to My Orders
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: MAP VIEW */}
        <div className="track-map-container">
          <div id="track-map"></div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
