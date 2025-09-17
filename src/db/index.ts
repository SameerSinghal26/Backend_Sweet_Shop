import mongoose from "mongoose";
import { DB_NAME } from "../constants";

const connectDB = async (): Promise<void> => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    console.log(
      `\nMONGODB Connected!! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MONGODB Connection Error", error);
    process.exit(1);
  }
};

export default connectDB;
