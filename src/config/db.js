import mongoose from "mongoose";

/**
 * Establishes a connection to the MongoDB database using the MONGO_URI
 * environment variable.
 *
 * @function connectDB
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
