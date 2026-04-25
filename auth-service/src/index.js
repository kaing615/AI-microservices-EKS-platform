import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { config } from "./config.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({
    service: "auth-service",
    status: "ok"
  });
});

app.use("/api/auth", authRoutes);
app.use("/", authRoutes);

app.use((error, _req, res, _next) => {
  console.error("auth-service error", error);
  res.status(500).json({
    message: "internal server error"
  });
});

app.listen(config.port, () => {
  console.log(`auth-service listening on port ${config.port}`);
});
