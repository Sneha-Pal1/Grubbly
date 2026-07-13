import foodModel from "../models/foodModel.js";
import fs from "fs";

/**
 * Controller to add a new food item.
 * Associates the item with the vendor ID of the user creating it.
 */
const addFood = async (req, res) => {
  // Check if a file was uploaded
  if (!req.file) {
    return res.json({ success: false, message: "Image upload failed. Please upload a dish image." });
  }

  let image_filename = `${req.file.filename}`;

  // Create a new Food record. Attach the vendorId from req.body.userId (populated by authMiddleware)
  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_filename,
    vendorId: req.body.userId, // Automatically link the food to the logged-in vendor
  });

  try {
    await food.save();
    res.json({
      success: true,
      message: "Food item added successfully",
    });
  } catch (error) {
    console.log("Error adding food:", error);
    res.json({
      success: false,
      message: "Failed to add food item",
    });
  }
};

/**
 * Controller to list food items.
 * Can be filtered by vendorId (for vendor dashboards) or returns all items (for general catalog).
 */
const listFood = async (req, res) => {
  try {
    let query = {};
    
    // If a vendorId query parameter is provided, filter the results
    if (req.query.vendorId) {
      query.vendorId = req.query.vendorId;
    }

    const foods = await foodModel.find(query);
    res.json({
      success: true,
      data: foods,
    });
  } catch (error) {
    console.log("Error listing food:", error);
    res.json({
      success: false,
      message: "Failed to fetch food catalog",
    });
  }
};

/**
 * Controller to remove a food item.
 * Ensures the vendor owns the item or the user is an admin before deletion.
 */
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) {
      return res.json({ success: false, message: "Food item not found." });
    }

    // Role verification: Vendors can only delete their own items, Admins can delete anything
    if (req.body.userRole !== "admin" && String(food.vendorId) !== req.body.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this item." });
    }

    // Delete image from server filesystem
    fs.unlink(`uploads/${food.image}`, (err) => {
      if (err) console.log("Failed to delete local image file:", err.message);
    });

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({
      success: true,
      message: "Food item removed successfully",
    });
  } catch (error) {
    console.log("Error removing food:", error);
    res.json({
      success: false,
      message: "Failed to remove food item",
    });
  }
};

/**
 * Controller to toggle food stock status (inStock: true/false).
 */
const toggleStock = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) {
      return res.json({ success: false, message: "Food item not found." });
    }

    // Role verification
    if (req.body.userRole !== "admin" && String(food.vendorId) !== req.body.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized to modify this item." });
    }

    // Invert the inStock value
    food.inStock = !food.inStock;
    await food.save();

    res.json({
      success: true,
      message: `Stock status updated to ${food.inStock ? "In Stock" : "Out of Stock"}`,
      inStock: food.inStock,
    });
  } catch (error) {
    console.log("Error toggling stock status:", error);
    res.json({
      success: false,
      message: "Failed to toggle stock status",
    });
  }
};

export { addFood, listFood, removeFood, toggleStock };

