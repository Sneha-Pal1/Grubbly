require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectToDB = require("./config/db.js");
const { default: foodRouter } = require("./routes/foodRoute.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to DB
connectToDB();

//api endpoints
app.use("/api/food", foodRouter);

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
