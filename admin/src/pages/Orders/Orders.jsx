import React from "react";
import "./Orders.css";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { assets } from "../../assets/admin_assets/assets";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const url = "http://localhost:3000"; // Set the backend URL directly

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(url + "/api/order/list");
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
  useEffect(() => {
    fetchAllOrders();
  }, []);
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
                  {order.address.firstName + "" + order.address.lastName}
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
              </div>
              <p>Items : {order.items.length}</p>
              <p>${order.amount}</p>
              <select>
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
    </div>
  );
};

export default Orders;
