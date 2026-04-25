import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { randomUUID } from "crypto";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();
const port = process.env.GATEWAY_PORT || 4000;
const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://auth-service:4001";
const predictionServiceUrl =
  process.env.PREDICTION_SERVICE_URL || "http://prediction-service:4002";

async function probeService(service, url) {
  try {
    const response = await fetch(`${url}/health`);
    if (!response.ok) {
      throw new Error(`status ${response.status}`);
    }
    const payload = await response.json();
    return {
      service,
      status: "ok",
      details: payload
    };
  } catch (error) {
    return {
      service,
      status: "degraded",
      error: error.message
    };
  }
}

app.use(cors());
app.use(morgan("dev"));
app.use((req, _res, next) => {
  req.headers["x-request-id"] = req.headers["x-request-id"] || randomUUID();
  next();
});

app.get("/health", (_req, res) => {
  res.json({
    service: "api-gateway",
    status: "ok"
  });
});

app.get("/health/dependencies", async (_req, res) => {
  const checks = await Promise.all([
    probeService("auth-service", authServiceUrl),
    probeService("prediction-service", predictionServiceUrl)
  ]);

  const degraded = checks.some((check) => check.status !== "ok");
  res.status(degraded ? 503 : 200).json({
    service: "api-gateway",
    status: degraded ? "degraded" : "ok",
    dependencies: checks
  });
});

app.get("/", (_req, res) => {
  res.json({
    service: "api-gateway",
    message: "Use /api/auth and /api/predictions through this gateway."
  });
});

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: authServiceUrl,
    changeOrigin: true,
    proxyTimeout: 5000,
    pathRewrite: (path) => `/api/auth${path}`
  })
);

app.use(
  "/api/predictions",
  createProxyMiddleware({
    target: predictionServiceUrl,
    changeOrigin: true,
    proxyTimeout: 10000,
    pathRewrite: (path) => `/api/predictions${path}`
  })
);

app.listen(port, () => {
  console.log(`api-gateway listening on port ${port}`);
});
