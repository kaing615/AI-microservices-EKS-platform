import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { config } from "./config.js";
import predictionRoutes from "./routes/predictionRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({
    service: "prediction-service",
    status: "ok"
  });
});

app.use("/api/predictions", predictionRoutes);
app.use("/", predictionRoutes);

app.use((error, _req, res, _next) => {
  console.error("prediction-service error", error);
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || "internal server error"
  });
});

app.listen(config.port, () => {
  console.log(`prediction-service listening on port ${config.port}`);
});
