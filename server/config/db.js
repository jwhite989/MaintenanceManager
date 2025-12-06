import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB: ${connection.connection.host}`);
  } catch (error) {
    console.error({ message: "Failed to connect to MongoDB" });
    process.exit(1);
  }
};

export default connectDB;
