import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes";
import sweetRouter from "./routes/sweet.routes";

const app = express();
const allowedOrigins = ["http://localhost:5173", `${process.env.FRONTEND_URL}`];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));

// Routes
app.use("/api/sweets", sweetRouter);
app.use("/api/auth", authRouter);

export { app };
