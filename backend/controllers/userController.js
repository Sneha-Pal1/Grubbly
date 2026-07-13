import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// Helper function to generate a JSON Web Token (JWT).
// We include both the user's MongoDB ID and the user's role ("customer", "vendor", "admin")
// inside the payload. This allows the backend to verify permissions without database lookups.
const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET);
};

// Login user controller
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find the user by email
    const user = await userModel.findOne({ email });

    // If user does not exist, return failure response
    if (!user) {
      return res.json({
        success: false,
        message: "User doesn't exist",
      });
    }

    // Compare the plain text password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Generate JWT token containing the user's ID and role
    const token = createToken(user._id, user.role);
    
    // Return token and user details to the frontend
    res.json({
      success: true,
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Login Error:", error);
    res.json({
      success: false,
      message: "An error occurred during login.",
    });
  }
};

// Register user controller
const registerUser = async (req, res) => {
  // Allow passing a "role" field (e.g., from vendor signup)
  const { name, password, email, role } = req.body;
  try {
    // Check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({
        success: false,
        message: "User already exists with this email.",
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password (at least 8 characters).",
      });
    }

    // Hash the password with bcrypt salt rounds = 10
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the new user into the database
    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
      role: role || "customer", // Default to "customer" if no role is supplied
    });

    const user = await newUser.save();

    // Generate JWT token containing the new user's ID and role
    const token = createToken(user._id, user.role);
    
    res.json({
      success: true,
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Registration Error:", error);
    res.json({
      success: false,
      message: "An error occurred during registration.",
    });
  }
};

export { loginUser, registerUser };

