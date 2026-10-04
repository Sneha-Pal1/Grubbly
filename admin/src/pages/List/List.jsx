import React, { useState, useEffect } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";

const List = ({ url, token, role }) => {
  const [List, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setLoading(true);
      setError(null);

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
        setError("Could not load items from server.");
      }
    } catch (err) {
      console.error(err);
      // Show a friendly error instead of a blank page / crash
      setError(
        "Failed to connect to the server. The backend may be starting up — please wait a moment and try again."
      );
      toast.error("Connection failed. Click 'Retry' to try again.");
    } finally {
      setLoading(false);
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

  // --- Render States ---

  if (loading) {
    return (
      <div className="list add flex-col">
        <p>All Foods List</p>
        <div style={{ textAlign: "center", padding: "40px", color: "#888", fontSize: "15px" }}>
          ⏳ Loading food items...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list add flex-col">
        <p>All Foods List</p>
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#c0392b",
            fontSize: "15px",
            lineHeight: "1.8",
          }}
        >
          <p>⚠️ {error}</p>
          <button
            onClick={fetchList}
            style={{
              marginTop: "16px",
              padding: "10px 24px",
              background: "#ff6347",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

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

        {List.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#888",
              fontSize: "15px",
            }}
          >
            📭 No food items found. Add some from the <strong>Add Items</strong> page.
          </div>
        ) : (
          List.map((item, index) => {
            return (
              <div key={index} className="list-table-format">
                <img src={`${url}/images/` + item.image} alt="" />
                <p>{item.name}</p>
                <p>{item.category}</p>
                <p>₹{item.price}</p>
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
          })
        )}
      </div>
    </div>
  );
};

export default List;
