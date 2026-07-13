import mongoose from "mongoose";

// The Food Schema defines the attributes of a food dish in the catalog.
// We are extending it to associate dishes with a Vendor and support inventory stock status.
const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // References the user collection, specifically user records with the "vendor" role
    required: false, // Set to false to avoid breaking legacy seed data
  },
  inStock: {
    type: Boolean,
    default: true, // Enables vendors to toggle dish availability on/off instantly
  },
});

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;

