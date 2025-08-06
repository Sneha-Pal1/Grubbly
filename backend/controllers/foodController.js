const foodModel = require("../models/foodModel");
const fs = require("fs");

//add food item
const addFood = async (req, res) => {
  try {
    console.log("File received:", req.file);
    console.log("Body:", req.body);

    const image_filename = req.file ? req.file.filename : null;
    const price = Number(req.body.price);

    if (isNaN(price)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid price value" });
    }

    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: price,
      category: req.body.category,
      image: image_filename,
    });

    await food.save();

    res.status(201).json({ success: true, data: food });
  } catch (error) {
    console.error("Error adding food:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addFood };
