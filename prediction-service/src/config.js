import "dotenv/config";
import path from "path";

export const config = {
  port: Number(process.env.PREDICTION_PORT || 4002),
  jwtSecret: process.env.JWT_SECRET || "change-me",
  inferenceServiceUrl:
    process.env.AI_INFERENCE_SERVICE_URL || "http://ai-inference-service:8000",
  predictionsFile:
    process.env.PREDICTIONS_FILE || path.resolve(process.cwd(), "data/predictions.json")
};
