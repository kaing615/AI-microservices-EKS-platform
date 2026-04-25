const runtimeOrigin = typeof window !== "undefined" ? window.location.origin : "";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || runtimeOrigin || "http://localhost:4000";

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export function login(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function register(payload) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getProfile(token) {
  return request("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function createPrediction(token, payload) {
  return request("/api/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export function getPredictionHistory(token) {
  return request("/api/predictions/history", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function getPredictionStats(token) {
  return request("/api/predictions/stats", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function getGatewayDependencies() {
  return request("/health/dependencies");
}
