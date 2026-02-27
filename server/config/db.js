import mongoose from "mongoose";

// Connect to MongoDB
export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not defined in .env");
    }

    mongoose.connection.on("connected", () =>
      console.log("✅ Database Connected Successfully")
    );

    await mongoose.connect(process.env.MONGO_URI);

  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};