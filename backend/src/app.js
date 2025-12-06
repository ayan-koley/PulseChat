import express, { urlencoded, json } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(json({ limit: "16kb" }));
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

const corsConfig = {
  origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsConfig));

import healthcheckRoutes from "./routes/healthcheck.routes.js";
import authRoutes from "./routes/auth.routes.js";

app.use("/api/v1/healthcheck", healthcheckRoutes);
app.use("/api/v1/auth", authRoutes);

export default app;
