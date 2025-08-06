const express = require("express");
const { addFood } = require("../controllers/foodController");
const multer = require("multer");

const foodRouter = express.Router();

//Image Storage Engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

foodRouter.post("/add", upload.single("image"), addFood);

module.exports = foodRouter;
