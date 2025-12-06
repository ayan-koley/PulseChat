import mongoose from "mongoose";

const connectDb = async () => {
  try {
    mongoose.connect(process.env.DATABASE_URL);
    console.log("✅ mongodb connect successfully ");
  } catch (error) {
    console.error("❌ mongodb connection error", error);
    process.exit(1);
  }
};

export default connectDb;
