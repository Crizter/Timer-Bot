// db.js
import mongoose from "mongoose";
import "dotenv/config";

export async function connectToCluster(uri) {
  try {
    console.log("Connecting to MongoDB using Mongoose...");
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Successfully connected to MongoDB with Mongoose!");
  } catch (error) {
    console.error("❌ Connection to MongoDB failed!", error);
    process.exit(1);
  }
}
