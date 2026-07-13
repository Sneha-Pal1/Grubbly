import userModel from "../models/userModel.js";

/**
 * Middleware to authorize specific roles (e.g., admin, vendor).
 * This middleware runs AFTER authMiddleware has validated the JWT token and set req.body.userId and req.body.userRole.
 * 
 * @param {Array<string>} roles - Array of permitted roles (e.g., ["admin", "vendor"])
 */
export const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      const { userId, userRole } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User ID missing from request.",
        });
      }

      // If userRole isn't set (due to legacy token), look up the user in the database
      let role = userRole;
      if (!role) {
        const user = await userModel.findById(userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found.",
          });
        }
        role = user.role;
        req.body.userRole = role; // Cache it in req.body
      }

      // Check if the user's role is authorized
      if (!roles.includes(role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Access denied for role "${role}". Required: ${roles.join(" or ")}`,
        });
      }

      next(); // Role matches, proceed to the controller
    } catch (error) {
      console.error("Role Authorization Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error in Role Authorization.",
      });
    }
  };
};
