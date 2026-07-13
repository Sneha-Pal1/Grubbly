import jwt from "jsonwebtoken";

// The Auth Middleware intercepts incoming requests, verifies the JWT token in the headers,
// and extracts the user ID and user role to make them available to downstream routes.
const authMiddleware = async (req, res, next) => {
  const { token } = req.headers;
  
  // If no token is provided in the headers, deny request
  if (!token) {
    return res.json({ success: false, message: "Not Authorized Login Again" });
  }
  
  try {
    // Decode the token using our secret key
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    
    // Initialize req.body if it is undefined (prevents runtime errors)
    if (!req.body) {
      req.body = {};
    }
    
    // Attach the user ID and user role to the request body
    req.body.userId = token_decode.id;
    req.body.userRole = token_decode.role; // The role is signed into the JWT during registration/login
    
    next(); // Pass control to the next middleware or controller
  } catch (error) {
    console.log("Authentication Middleware Error:", error);
    res.json({
      success: false,
      message: "Session expired or invalid token. Please log in again.",
    });
  }
};

export default authMiddleware;

