import React, { useContext, useEffect, useState, useRef } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url, clearCart } =
    useContext(StoreContext);

  const navigate = useNavigate();
  const mapRef = useRef(null); // Ref to hold the Leaflet map instance (prevents re-initialization bugs)
  const markerRef = useRef(null); // Ref to hold the draggable marker instance

  const [paymentMethod, setPaymentMethod] = useState("cod"); // Tracks user's choice: "cod" or "razorpay"
  const [coords, setCoords] = useState({ lat: 12.9716, lng: 77.5946 }); // Default map center (Bangalore coordinate center)

  // Standard delivery address form data state
  const [data, setData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  // Effect to load and set up the Leaflet interactive map
  useEffect(() => {
    // If not logged in or cart is empty, redirect
    if (!token || getTotalCartAmount() === 0) {
      navigate("/cart");
      return;
    }

    // Load map only if Leaflet script 'window.L' is available and map is not initialized yet
    if (window.L && !mapRef.current) {
      console.log("🗺️ Initializing Leaflet map selector...");
      
      // Initialize map on the container div with ID 'map-select'
      const map = window.L.map("map-select").setView([coords.lat, coords.lng], 13);
      
      // Load and display openstreetmap tile layer
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Create a draggable pin marker so users can move it around
      const marker = window.L.marker([coords.lat, coords.lng], { draggable: true }).addTo(map);
      
      markerRef.current = marker;
      mapRef.current = map;

      /**
       * Calls Nominatim reverse geocoding API to parse latitude/longitude into postal address fields.
       */
      const reverseGeocodeAddress = async (lat, lng) => {
        setCoords({ lat, lng });
        try {
          console.log(`🔍 Reverse geocoding coords: lat=${lat}, lng=${lng}...`);
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const resJson = await res.json();
          
          if (resJson && resJson.address) {
            const addr = resJson.address;
            
            // Auto-populate address fields dynamically based on geocoding data
            setData((prev) => ({
              ...prev,
              street: addr.road || addr.suburb || addr.neighbourhood || "",
              city: addr.city || addr.town || addr.village || "",
              state: addr.state || "",
              zipcode: addr.postcode || "",
              country: addr.country || "",
            }));
            console.log("📍 Autofilled address details from map coordinate selection.");
          }
        } catch (error) {
          console.error("❌ Geocoding API failed:", error);
        }
      };

      // Handler when marker drag ends
      marker.on("dragend", () => {
        const position = marker.getLatLng();
        reverseGeocodeAddress(position.lat, position.lng);
      });

      // Handler when map is clicked
      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        reverseGeocodeAddress(e.latlng.lat, e.latlng.lng);
      });

      // Try fetching user's live browser geolocation to center the map
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            const newLatLng = new window.L.LatLng(userLat, userLng);
            
            map.setView(newLatLng, 14);
            marker.setLatLng(newLatLng);
            reverseGeocodeAddress(userLat, userLng);
          },
          (geoError) => console.log("⚠️ Geolocation access denied, using default map center.")
        );
      }
    }

    // Clean up map container when component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [token]);

  /**
   * Main form submit controller. Handles order compiling and payment routing.
   */
  const placeOrder = async (event) => {
    event.preventDefault();

    // Compile cart items structure
    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item, quantity: cartItems[item._id] };
        orderItems.push(itemInfo);
      }
    });

    // Compile full order package
    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2, // Total + delivery fee
      coordinates: coords, // Attached pinned map coordinates
      paymentMethod, // "cod" or "razorpay"
    };

    try {
      console.log("📤 Submitting order to backend...", orderData);
      let response = await axios.post(url + "/api/order/place", orderData, {
        headers: { token },
      });

      if (response.data.success) {
        // CASE A: CASH ON DELIVERY
        if (paymentMethod === "cod") {
          clearCart();
          alert("Success! Your order is placed with Cash on Delivery.");
          navigate("/myorders");
        } 
        // CASE B: ONLINE PAYMENT VIA RAZORPAY
        else if (paymentMethod === "razorpay") {
          const { razorpayOrder, key_id, orderId } = response.data;
          
          // Configure the Razorpay overlay checkout modal settings
          const options = {
            key: key_id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: "Grubbly",
            description: "Online Food Delivery Payment",
            order_id: razorpayOrder.id,
            
            // Success handler executed by Razorpay JS script upon successful bank authorization
            handler: async function (paymentRes) {
              try {
                console.log("💳 Razorpay authorized. Requesting signature verification...", paymentRes);
                
                const verifyResponse = await axios.post(
                  url + "/api/order/verify",
                  {
                    orderId: orderId,
                    razorpay_order_id: paymentRes.razorpay_order_id,
                    razorpay_payment_id: paymentRes.razorpay_payment_id,
                    razorpay_signature: paymentRes.razorpay_signature,
                  },
                  { headers: { token } }
                );

                if (verifyResponse.data.success) {
                  clearCart();
                  alert("🎉 Payment Successful! Order placed.");
                  navigate("/myorders");
                } else {
                  alert("⚠️ Payment verification failed: " + verifyResponse.data.message);
                }
              } catch (verifyError) {
                console.error("Verification endpoint error:", verifyError);
                alert("Error during payment signature verification.");
              }
            },
            modal: {
              ondismiss: function () {
                alert("Payment dialog closed. Order remains pending.");
              }
            },
            prefill: {
              name: `${data.firstname} ${data.lastname}`,
              email: data.email,
              contact: data.phone,
            },
            theme: {
              color: "#ff6347", // Grubbly tomato brand highlight color
            }
          };

          // Instantiate and open the Razorpay Checkout Modal
          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      } else {
        alert("Error placing order: " + response.data.message);
      }
    } catch (err) {
      console.error("Order submit failed:", err);
      alert("Order placement process failed. Please try again.");
    }
  };

  return (
    <form onSubmit={placeOrder} className="place-order">
      {/* LEFT FORM FIELDS */}
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            required
            name="firstname"
            onChange={onChangeHandler}
            value={data.firstname}
            type="text"
            placeholder="First Name"
          />
          <input
            required
            name="lastname"
            onChange={onChangeHandler}
            value={data.lastname}
            type="text"
            placeholder="Last Name"
          />
        </div>
        <input
          required
          name="email"
          onChange={onChangeHandler}
          value={data.email}
          type="email"
          placeholder="Email address"
        />
        
        {/* Leaflet Pinning Map Container */}
        <p className="map-instruction">📍 Click on the map or drag the marker to pin your exact location:</p>
        <div id="map-select"></div>

        <input
          required
          name="street"
          onChange={onChangeHandler}
          value={data.street}
          type="text"
          placeholder="Street"
        />
        <div className="multi-fields">
          <input
            required
            name="city"
            onChange={onChangeHandler}
            value={data.city}
            type="text"
            placeholder="City"
          />
          <input
            required
            name="state"
            onChange={onChangeHandler}
            value={data.state}
            type="text"
            placeholder="State"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="zipcode"
            onChange={onChangeHandler}
            value={data.zipcode}
            type="text"
            placeholder="Zip code"
          />
          <input
            required
            name="country"
            onChange={onChangeHandler}
            value={data.country}
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          name="phone"
          onChange={onChangeHandler}
          value={data.phone}
          type="tel"
          placeholder="Phone"
        />
      </div>

      {/* RIGHT TOTALS & PAYMENT SECTION */}
      <div className="place-order-right">
        <h2>Cart Total</h2>
        <div>
          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>₹{getTotalCartAmount()}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <b>Total</b>
            <b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
          </div>
          
          {/* Payment Method Selector Cards */}
          <p className="payment-section-title">Payment Method</p>
          <div className="payment-methods">
            <div
              type="button"
              className={`payment-method-card ${paymentMethod === "cod" ? "active" : ""}`}
              onClick={() => setPaymentMethod("cod")}
            >
              <span className="icon">💵</span>
              <p>Cash on Delivery</p>
            </div>
            <div
              type="button"
              className={`payment-method-card ${paymentMethod === "razorpay" ? "active" : ""}`}
              onClick={() => setPaymentMethod("razorpay")}
            >
              <span className="icon">💳</span>
              <p>Pay Online</p>
            </div>
          </div>

          <button type="submit" className="cart-total-button">
            {paymentMethod === "cod" ? "PLACE ORDER (COD)" : "PROCEED TO PAYMENT"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;

