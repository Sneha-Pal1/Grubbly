import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

// Load configuration variables from the .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Wrap the Express app inside a standard Node HTTP server.
// This is necessary because Socket.io runs on top of raw HTTP protocols.
const server = http.createServer(app);

// Initialize Socket.io with the HTTP server and enable CORS for client access
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for local development (restrict in production)
    methods: ["GET", "POST"],
  },
});

// Attach the Socket.io instance to the Express app context.
// This lets us access it in other controllers using req.app.get("io").
app.set("io", io);

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
connectDB();

// REST API Endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads")); // Serves dish images
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", uptime: process.uptime(), timestamp: new Date() });
});

// Socket.io Connection Handler
io.on("connection", (socket) => {
  console.log(`🔌 New WebSocket client connected: ${socket.id}`);

  // When a customer opens a tracking page, they join a socket room matching their order ID.
  socket.on("join_order_room", (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`📦 Socket client ${socket.id} joined room: order_${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ WebSocket client disconnected: ${socket.id}`);
  });
});

// Start the server using the server wrapper (instead of app.listen)
server.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});

