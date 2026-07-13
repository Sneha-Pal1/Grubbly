import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Dashboard.css";

const Dashboard = ({ url, token, role }) => {
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Decodes the JWT token in vanilla JS to retrieve the logged-in user's ID
  const getUserIdFromToken = (jwtToken) => {
    try {
      if (!jwtToken) return null;
      const base64Url = jwtToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload).id;
    } catch (error) {
      console.error("JWT decoding failed:", error);
      return null;
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = { token };

      // 1. Fetch Orders List
      // The backend automatically filters orders for Vendors based on the token role.
      const ordersRes = await axios.get(`${url}/api/order/list`, { headers });
      let fetchedOrders = [];
      if (ordersRes.data.success) {
        fetchedOrders = ordersRes.data.data;
        setOrders(fetchedOrders);
      }

      // 2. Fetch Food Items List
      // If the user is a Vendor, query only foods belonging to their vendorId
      let foodUrl = `${url}/api/food/list`;
      if (role === "vendor") {
        const userId = getUserIdFromToken(token);
        if (userId) {
          foodUrl += `?vendorId=${userId}`;
        }
      }

      const foodsRes = await axios.get(foodUrl);
      if (foodsRes.data.success) {
        setFoods(foodsRes.data.data);
      }
    } catch (error) {
      console.error("Error loading dashboard metrics:", error);
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, role]);

  if (loading) {
    return <div style={{ padding: "30px", fontSize: "16px" }}>Analyzing stats...</div>;
  }

  // COMPUTE ANALYTICS METRICS
  // Total Revenue: Sum of amounts from paid orders
  const totalRevenue = orders
    .filter((order) => order.payment === true)
    .reduce((sum, order) => sum + order.amount, 0);

  const totalOrders = orders.length;
  const activeDishes = foods.length;
  const outOfStockDishes = foods.filter((food) => !food.inStock).length;

  return (
    <div className="dashboard">
      <h2>Welcome back!</h2>
      <p className="dashboard-subtitle">
        Here is what's happening with your kitchen today ({role === "admin" ? "Platform Admin" : "Kitchen Vendor"}).
      </p>

      {/* METRICS METERS GRID */}
      <div className="metrics-grid">
        <div className="metric-card revenue">
          <span className="metric-title">Total Revenue</span>
          <span className="metric-value">${totalRevenue.toFixed(2)}</span>
          <span className="metric-desc">From successfully paid transactions</span>
        </div>
        <div className="metric-card orders">
          <span className="metric-title">Orders Placed</span>
          <span className="metric-value">{totalOrders}</span>
          <span className="metric-desc">Total orders route to your kitchen</span>
        </div>
        <div className="metric-card dishes">
          <span className="metric-title">Menu Catalog</span>
          <span className="metric-value">{activeDishes}</span>
          <span className="metric-desc">Active dishes registered in menu</span>
        </div>
        <div className="metric-card stockout">
          <span className="metric-title">Stock Out</span>
          <span className="metric-value">{outOfStockDishes}</span>
          <span className="metric-desc">Dishes marked out of stock</span>
        </div>
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="recent-section">
        <h3>Recent Orders</h3>
        <div className="orders-table-wrapper">
          {orders && orders.length > 0 ? (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Dish Summary</th>
                  <th>Total Amount</th>
                  <th>Payment Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 600, fontSize: "12px", color: "#666" }}>
                      {order._id.substring(0, 8)}...
                    </td>
                    <td>
                      {order.address?.firstname} {order.address?.lastname}
                    </td>
                    <td>
                      {order.items?.map((item) => `${item.name} x${item.quantity}`).join(", ")}
                    </td>
                    <td>${order.amount}</td>
                    <td>
                      <span className={`payment-tag ${order.payment ? "paid" : "cod"}`}>
                        {order.payment ? "PAID" : "COD"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          order.status === "Delivered"
                            ? "delivered"
                            : order.status === "Out For Delivery"
                            ? "delivery"
                            : "processing"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: "#777", textAlign: "center", padding: "20px 0" }}>No orders received yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
