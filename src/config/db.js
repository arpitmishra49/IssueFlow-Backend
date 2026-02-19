import mongoose from "mongoose";

/**
 * Connects to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true,
    });

    console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
