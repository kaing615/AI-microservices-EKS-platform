import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  buildStats,
  createPredictionRecord,
  findPredictionById,
  listPredictionsByUser
} from "../services/predictionRepository.js";
import { requestInference } from "../services/inferenceClient.js";

const router = Router();

router.use(authenticate);

router.post("/", async (req, res, next) => {
  try {
    const prompt = req.body.prompt?.trim();
    if (!prompt) {
      return res.status(400).json({ message: "prompt is required" });
    }

    if (prompt.length < 5) {
      return res.status(400).json({ message: "prompt must be at least 5 characters" });
    }

    const inference = await requestInference(prompt);
    const record = await createPredictionRecord({
      userId: req.user.sub,
      prompt,
      inference
    });

    return res.status(201).json({
      message: "prediction created",
      ...record
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/history", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 20);
    const items = await listPredictionsByUser(req.user.sub);
    return res.json({
      items: items.slice(0, limit)
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    const items = await listPredictionsByUser(req.user.sub);
    return res.json(buildStats(items));
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await findPredictionById(req.user.sub, req.params.id);
    if (!item) {
      return res.status(404).json({ message: "prediction not found" });
    }
    return res.json(item);
  } catch (error) {
    return next(error);
  }
});

export default router;

