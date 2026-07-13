import React, { useState, useEffect } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";

const List = ({ url, token, role }) => {
  const [List, setList] = useState([]);

  // Helper function to decode JWT client-side without external dependencies
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

  const fetchList = async () => {
    try {
      // Build list URL (Vendor lists only their own items; Admin lists everything)
      let listUrl = `${url}/api/food/list`;
      if (role === "vendor") {
        const userId = getUserIdFromToken(token);
        if (userId) {
          listUrl += `?vendorId=${userId}`;
        }
      }

      const response = await axios.get(listUrl);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Error fetching food items");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to the server.");
    }
  };

  const removeFood = async (foodId) => {
    try {
      // Pass JWT authorization token in headers to delete items
      const response = await axios.post(
        `${url}/api/food/remove`,
        { id: foodId },
        { headers: { token } }
      );
      await fetchList();
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove food item");
    }
  };

  const toggleStock = async (foodId) => {
    try {
      // Pass JWT authorization token in headers to toggle stock status
      const response = await axios.post(
        `${url}/api/food/toggle-stock`,
        { id: foodId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update stock status");
    }
  };

  useEffect(() => {
    fetchList();
  }, [token, role]);

  return (
    <div className="list add flex-col">
      <p>All Foods List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Stock Status</b>
          <b>Action</b>
        </div>
        {List.map((item, index) => {
          return (
            <div key={index} className="list-table-format">
              <img src={`${url}/images/` + item.image} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>${item.price}</p>
              {/* Interactive stock availability toggler */}
              <div>
                <button
                  onClick={() => toggleStock(item._id)}
                  style={{
                    backgroundColor: item.inStock ? "#d4edda" : "#f8d7da",
                    color: item.inStock ? "#155724" : "#721c24",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  {item.inStock ? "In Stock" : "Out of Stock"}
                </button>
              </div>
              <p onClick={() => removeFood(item._id)} className="cursor">
                X
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default List;

