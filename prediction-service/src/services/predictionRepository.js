import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { config } from "../config.js";

async function ensurePredictionsFile() {
  await fs.mkdir(path.dirname(config.predictionsFile), { recursive: true });

  try {
    await fs.access(config.predictionsFile);
  } catch {
    await fs.writeFile(config.predictionsFile, "[]");
  }
}

async function readAll() {
  await ensurePredictionsFile();
  const raw = await fs.readFile(config.predictionsFile, "utf8");
  return JSON.parse(raw);
}

async function writeAll(items) {
  await fs.writeFile(config.predictionsFile, JSON.stringify(items, null, 2));
}

export async function createPredictionRecord({ userId, prompt, inference }) {
  const items = await readAll();
  const record = {
    id: randomUUID(),
    userId,
    prompt,
    label: inference.label,
    confidence: inference.confidence,
    model: inference.model,
    urgency: inference.urgency,
    category: inference.category,
    summary: inference.summary,
    keywords: inference.keywords,
    recommendedAction: inference.recommendedAction,
    createdAt: new Date().toISOString()
  };

  items.unshift(record);
  await writeAll(items);
  return record;
}

export async function listPredictionsByUser(userId) {
  const items = await readAll();
  return items.filter((item) => item.userId === userId);
}

export async function findPredictionById(userId, id) {
  const items = await readAll();
  return items.find((item) => item.userId === userId && item.id === id) || null;
}

export function buildStats(items) {
  const totalsByLabel = items.reduce((accumulator, item) => {
    accumulator[item.label] = (accumulator[item.label] || 0) + 1;
    return accumulator;
  }, {});

  const averageConfidence =
    items.length === 0
      ? 0
      : Number(
          (
            items.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / items.length
          ).toFixed(2)
        );

  return {
    totalPredictions: items.length,
    averageConfidence,
    totalsByLabel
  };
}

