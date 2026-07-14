import mongoose from "mongoose";
import dotenv from "dotenv";
import foodModel from "./models/foodModel.js";

// Load environment variables from .env file
dotenv.config();

const runMigration = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("Error: MONGODB_URI is not defined in backend/.env file.");
      process.exit(1);
    }

    console.log("Connecting to MongoDB Database...");
    await mongoose.connect(mongoUri);
    console.log("Database connection successful.");

    console.log("Executing migration: Incrementing all food prices by +100...");
    const result = await foodModel.updateMany({}, { $inc: { price: 100 } });
    
    console.log(`Success: Modified ${result.modifiedCount} food item prices in database.`);
    
    await mongoose.disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed with error:", error);
    process.exit(1);
  }
};

runMigration();
