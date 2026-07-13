import mongoose from "mongoose";

// The Order Schema tracks client orders, delivery coordinates, vendor associations, and Razorpay details.
const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true, // Array of food items, quantities, and prices
  },
  amount: {
    type: Number,
    required: true,
  },
  address: {
    type: Object, // Stores street, city, state, zip, etc.
    required: true,
  },
  coordinates: {
    // Geo-coordinates captured from Leaflet Map pin on placement
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // Connects this order to a specific vendor who owns the food items
    required: false,
  },
  status: {
    type: String,
    default: "Food Processing", // Status steps: Food Processing -> Out for Delivery -> Delivered
  },
  date: {
    type: Date,
    default: () => Date.now(), // Dynamic date generator
  },
  payment: {
    type: Boolean,
    default: false, // Tracks if checkout payment verification succeeded
  },
  razorpayOrderId: {
    type: String,
    required: false, // Set when a transaction begins
  },
  razorpayPaymentId: {
    type: String,
    required: false, // Saved upon successful signature verification
  },
  razorpaySignature: {
    type: String,
    required: false,
  },
});

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;

