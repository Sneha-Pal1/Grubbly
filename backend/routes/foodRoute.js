import express from "express";
import {
  addFood,
  listFood,
  removeFood,
  toggleStock,
} from "../controllers/foodController.js";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleAuth.js";

const foodRouter = express.Router();

// Image storage Engine setup with Multer
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

// Public routes
foodRouter.get("/list", listFood); // Allowed for customers to browse the menu

// Protected routes (Only Admins and Vendors can create/delete/modify items)
foodRouter.post("/add", authMiddleware, authorizeRoles("admin", "vendor"), upload.single("image"), addFood);
foodRouter.post("/remove", authMiddleware, authorizeRoles("admin", "vendor"), removeFood);
foodRouter.post("/toggle-stock", authMiddleware, authorizeRoles("admin", "vendor"), toggleStock);

export default foodRouter;

