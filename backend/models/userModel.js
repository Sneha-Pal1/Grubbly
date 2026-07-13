import mongoose from "mongoose";

// The User Schema defines the structure of a user in our MongoDB database.
// We are adding a "role" field to distinguish between Customers, Vendors, and Admins.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    cartData: {
      type: Object,
      default: {}, // Stores the user's shopping cart items as a key-value pair of foodId: quantity
    },
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"], // Defines the restricted set of roles
      default: "customer", // New users are registered as customers by default
    },
  },
  { minimize: false } // Prevents Mongoose from deleting empty objects like cartData
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;

