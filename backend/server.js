require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectToDB = require("./config/db.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to DB
connectToDB();

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
