import React, { useEffect, useState } from "react";
import "./MyOrders.css";
import { useContext } from "react";
import { StoreContext } from "../context/StoreContext";
import axios from "axios";
import parcel_icon from "../frontend_assets/parcel_icon.png";
import { useNavigate } from "react-router-dom"; // Import navigation hook to route to track order page

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const navigate = useNavigate(); // Instantiate navigate controller

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setData(response.data.data);
        console.log(response.data.data);
      } else {
        console.error("Failed to fetch orders:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {data.map((order, index) => {
          return (
            <div key={index} className="my-orders-order">
              <img src={parcel_icon} alt="" />
              <p>
                {order.items
                  .map((item, itemIndex) => {
                    if (itemIndex === order.items.length - 1) {
                      return item.name + " x " + item.quantity;
                    } else {
                      return item.name + " x " + item.quantity + ", ";
                    }
                  })
                  .join("")}
              </p>
              <p>${order.amount}.00</p>
              <p>Items: {order.items.length}</p>
              <p>
                <span>&#x25cf;</span> <b>{order.status}</b>
              </p>
              {/* Redirect customer to the live interactive WebSockets tracking map screen */}
              <button onClick={() => navigate(`/track/${order._id}`)}>Track Order</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;

