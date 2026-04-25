import os
from collections import Counter
from typing import Dict, List

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="ai-inference-service", version="1.0.0")
MODEL_NAME = os.getenv("AI_MODEL_NAME", "demo-sentiment-v1")


class InferenceRequest(BaseModel):
    prompt: str = Field(min_length=5, max_length=2000)


def extract_keywords(prompt: str) -> List[str]:
    words = [
        word.strip(".,!?()[]{}:;\"'").lower()
        for word in prompt.split()
        if len(word.strip(".,!?()[]{}:;\"'")) > 3
    ]
    return [word for word, _count in Counter(words).most_common(5)]


def classify_category(normalized: str) -> str:
    rules = {
        "performance": ["latency", "slow", "fast", "speed", "performance"],
        "deployment": ["deploy", "release", "rollback", "pipeline", "build"],
        "security": ["security", "token", "auth", "attack", "vulnerability"],
        "operations": ["incident", "error", "downtime", "availability", "restart"],
    }
    for category, terms in rules.items():
        if any(term in normalized for term in terms):
            return category
    return "general"


def detect_urgency(normalized: str) -> str:
    high_terms = ["urgent", "immediately", "down", "failed", "critical", "outage"]
    medium_terms = ["soon", "warning", "slow", "issue"]
    if any(term in normalized for term in high_terms):
        return "high"
    if any(term in normalized for term in medium_terms):
        return "medium"
    return "low"


def summarize_prompt(prompt: str) -> str:
    trimmed = " ".join(prompt.split())
    if len(trimmed) <= 120:
        return trimmed
    return f"{trimmed[:117]}..."


def recommended_action(label: str, urgency: str, category: str) -> str:
    if urgency == "high":
        return "Escalate to the on-call engineer and inspect the latest deployment and logs."
    if label == "negative":
        return f"Investigate the likely {category} issue and capture metrics before rollback."
    if label == "positive":
        return "Promote the change gradually and keep monitoring error rate and latency."
    return "Review the request context and monitor for further signals before acting."


def run_demo_inference(prompt: str) -> Dict[str, float | str | list[str]]:
    normalized = prompt.lower()
    positive_terms = ["love", "great", "fast", "good", "excellent", "success"]
    negative_terms = ["bad", "slow", "hate", "error", "issue", "failed"]

    score = 0
    for term in positive_terms:
        if term in normalized:
            score += 1
    for term in negative_terms:
        if term in normalized:
            score -= 1

    if score >= 1:
        label = "positive"
        confidence = 0.91
    elif score <= -1:
        label = "negative"
        confidence = 0.89
    else:
        label = "neutral"
        confidence = 0.72

    urgency = detect_urgency(normalized)
    category = classify_category(normalized)
    summary = summarize_prompt(prompt)
    keywords = extract_keywords(prompt)

    return {
        "label": label,
        "confidence": confidence,
        "urgency": urgency,
        "category": category,
        "summary": summary,
        "keywords": keywords,
        "recommendedAction": recommended_action(label, urgency, category),
    }


@app.get("/health")
def health():
    return {"service": "ai-inference-service", "status": "ok", "model": MODEL_NAME}


@app.get("/models")
def models():
    return {
        "items": [
            {
                "name": MODEL_NAME,
                "type": "demo-rule-based",
                "status": "available",
            }
        ]
    }


@app.post("/infer")
def infer(payload: InferenceRequest):
    result = run_demo_inference(payload.prompt)
    return {
        "model": MODEL_NAME,
        "prompt": payload.prompt,
        **result,
    }
