import dotenv from "dotenv";
import connectDB from "./db";
import { app } from "./app";

dotenv.config({});

const PORT = process.env.PORT || 8080;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed!!!", err);
  });
