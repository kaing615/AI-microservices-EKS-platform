import { config } from "../config.js";

export async function requestInference(prompt) {
  const response = await fetch(`${config.inferenceServiceUrl}/infer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const error = new Error(errorPayload.detail || "inference service failed");
    error.statusCode = 502;
    throw error;
  }

  return response.json();
}
