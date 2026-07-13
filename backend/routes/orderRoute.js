import express from "express";
import authMiddleware from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleAuth.js";
import {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  getOrderDetails,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// Routes for Customers
orderRouter.post("/place", authMiddleware, placeOrder); // Places a COD or online order
orderRouter.post("/verify", verifyOrder); // Verifies online payment signatures (no token required since it checks the hash signature)
orderRouter.post("/userorders", authMiddleware, userOrders); // Retrieves order history for a logged-in user
orderRouter.get("/details/:orderId", authMiddleware, getOrderDetails); // Fetches single order details

// Routes for Admins and Vendors (Requires token validation and role-based permission verification)
orderRouter.get("/list", authMiddleware, authorizeRoles("admin", "vendor"), listOrders);
orderRouter.post("/status", authMiddleware, authorizeRoles("admin", "vendor"), updateStatus);

export default orderRouter;


