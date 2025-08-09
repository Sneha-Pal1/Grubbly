import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

const app = express();
const PORT = 3000;

dotenv.config();

//middleware
app.use(express.json());
app.use(cors());

//db connection
connectDB();

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
