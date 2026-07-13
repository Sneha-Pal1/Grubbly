import React, { useState, useEffect, useRef } from "react";
import "./Orders.css";
import { toast } from "react-toastify";
import axios from "axios";
import { assets } from "../../assets/admin_assets/assets";

const Orders = ({ url, token }) => {
  const [orders, setOrders] = useState([]);
  const [activeMapCoords, setActiveMapCoords] = useState(null); // Holds { lat, lng, name } for modal view
  const adminMapRef = useRef(null);

  const fetchAllOrders = async () => {
    try {
      // Fetch orders using JWT token authorization header
      const response = await axios.get(url + "/api/order/list", {
        headers: { token },
      });
      if (response.data.success) {
        setOrders(response.data.data);
        console.log(response.data.data);
      } else {
        toast.error("Error fetching orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to connect to the server");
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      // Pass token headers to status updates
      const response = await axios.post(
        url + "/api/order/status",
        {
          orderId,
          status: event.target.value,
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Order status updated successfully!");
        await fetchAllOrders();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Network error while updating status");
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllOrders();
    }
  }, [token]);

  // Leaflet Map Initialization Effect when the Modal opens
  useEffect(() => {
    if (activeMapCoords && window.L) {
      // Delay slightly to allow modal container to render completely in the DOM
      const timer = setTimeout(() => {
        if (adminMapRef.current) {
          adminMapRef.current.remove(); // Remove old map instance to prevent duplicate binding bugs
        }

        const map = window.L.map("admin-map").setView(
          [activeMapCoords.lat, activeMapCoords.lng],
          15
        );
        adminMapRef.current = map;

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Place marker at customer delivery pin coordinates
        window.L.marker([activeMapCoords.lat, activeMapCoords.lng])
          .addTo(map)
          .bindPopup(`Deliver to: ${activeMapCoords.name}`)
          .openPopup();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [activeMapCoords]);

  return (
    <div className="order add">
      <h3>Order Page</h3>
      <div className="order-list">
        {orders && orders.length > 0 ? (
          orders.map((order, index) => (
            <div key={index} className="order-item">
              <img src={assets.parcel_icon} alt="" />
              <div>
                <p className="order-item-food">
                  {order.items &&
                    order.items.map((item, itemIndex) => {
                      if (itemIndex === order.items.length - 1) {
                        return item.name + " x " + item.quantity;
                      } else {
                        return item.name + " x " + item.quantity + " , ";
                      }
                    })}
                </p>
                <p className="order-item-name">
                  {order.address.firstname + " " + order.address.lastname}
                </p>
                <div className="order-item-address">
                  <p>{order.address.street + ","}</p>
                  <p>
                    {order.address.city +
                      " , " +
                      order.address.state +
                      " , " +
                      order.address.country +
                      " , " +
                      order.address.zipcode}
                  </p>
                </div>
                <p className="order-item-phone">{order.address.phone}</p>
                
                {/* Visual coordinate mapper button */}
                {order.coordinates && order.coordinates.lat && (
                  <button
                    onClick={() =>
                      setActiveMapCoords({
                        lat: order.coordinates.lat,
                        lng: order.coordinates.lng,
                        name: `${order.address.firstname} ${order.address.lastname}`,
                      })
                    }
                    style={{
                      marginTop: "12px",
                      backgroundColor: "#ff6347",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontFamily: "'Outfit', sans-serif"
                    }}
                  >
                    📍 View Delivery Location Map
                  </button>
                )}
              </div>
              <p>Items : {order.items.length}</p>
              <p>${order.amount}</p>
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
              >
                <option value="Food Processing">Food Processing</option>
                <option value="Out For Delivery">Out For Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          ))
        ) : (
          <p>No orders found</p>
        )}
      </div>

      {/* DELIVERY COORDINATE OVERLAY MODAL */}
      {activeMapCoords && (
        <div className="map-modal-overlay" onClick={() => setActiveMapCoords(null)}>
          <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Delivery Location Map</h4>
            <div id="admin-map" style={{ height: "300px", width: "100%", borderRadius: "8px" }}></div>
            <button onClick={() => setActiveMapCoords(null)} className="close-map-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

