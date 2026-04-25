import { useEffect, useState } from "react";
import {
  createPrediction,
  getGatewayDependencies,
  getPredictionHistory,
  getPredictionStats,
  getProfile,
  login,
  register,
} from "./services/api";

const initialAuth = {
  email: "user@example.com",
  password: "user123",
  name: "Demo User",
};

const defaultPrompt = "The deployment is fast and successful";

export default function App() {
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(initialAuth);
  const [token, setToken] = useState(
    () => localStorage.getItem("platform-token") || "",
  );
  const [profile, setProfile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [dependencies, setDependencies] = useState(null);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Login with the demo user to start.");
  const [messageType, setMessageType] = useState("info");
  const [authFeedback, setAuthFeedback] = useState("");
  const [authFeedbackType, setAuthFeedbackType] = useState("error");
  const trimmedPrompt = prompt.trim();
  const isPromptValid = trimmedPrompt.length >= 5;
  const trimmedName = authForm.name.trim();
  const trimmedEmail = authForm.email.trim();
  const trimmedPassword = authForm.password;
  const loginValidationError =
    !trimmedEmail || !trimmedPassword
      ? "Email and password are required."
      : !trimmedEmail.includes("@")
        ? "Email format is invalid."
        : "";
  const registerValidationError =
    !trimmedName || !trimmedEmail || !trimmedPassword
      ? "Name, email, and password are required."
      : !trimmedEmail.includes("@")
        ? "Email format is invalid."
        : trimmedPassword.length < 6
          ? "Password must be at least 6 characters."
          : "";
  const canLogin = !loading && !loginValidationError;
  const canRegister = !loading && !registerValidationError;
  const dependencyItems = dependencies?.dependencies || [];
  const healthyDependencyCount = dependencyItems.filter(
    (item) => item.status === "ok",
  ).length;
  const latestPrediction = history[0] || result;
  const totalPredictions = stats?.totalPredictions || 0;
  const averageConfidence = stats?.averageConfidence || 0;

  function titleCase(value = "") {
    if (!value) {
      return "Unknown";
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  useEffect(() => {
    getGatewayDependencies()
      .then(setDependencies)
      .catch((error) =>
        setDependencies({
          status: "degraded",
          dependencies: [
            { service: "gateway", status: "degraded", error: error.message },
          ],
        }),
      );
  }, []);

  useEffect(() => {
    if (!token) {
      setProfile(null);
      setHistory([]);
      setStats(null);
      localStorage.removeItem("platform-token");
      return;
    }

    localStorage.setItem("platform-token", token);

    Promise.all([
      getProfile(token),
      getPredictionHistory(token),
      getPredictionStats(token),
    ])
      .then(([profileData, historyData, statsData]) => {
        setProfile(profileData.user);
        setHistory(historyData.items);
        setStats(statsData);
      })
      .catch((error) => {
        setMessageType("error");
        setMessage(error.message);
      });
  }, [token]);

  function updateMessage(type, value) {
    setMessageType(type);
    setMessage(value);
  }

  function updateForm(event) {
    const { name, value } = event.target;
    setAuthFeedback("");
    setAuthFeedbackType("error");
    setAuthForm((current) => ({ ...current, [name]: value }));
  }

  async function handleLogin(event) {
    event.preventDefault();
    if (loginValidationError) {
      setAuthFeedback(loginValidationError);
      setAuthFeedbackType("error");
      return;
    }

    setLoading(true);
    updateMessage("info", "");
    setAuthFeedback("");

    try {
      const data = await login({
        email: trimmedEmail,
        password: trimmedPassword,
      });
      setToken(data.token);
      setProfile(data.user);
      setAuthFeedback(`Logged in as ${data.user.email}.`);
      setAuthFeedbackType("success");
      updateMessage("success", `Authenticated as ${data.user.email}`);
    } catch (error) {
      setAuthFeedback(error.message);
      setAuthFeedbackType("error");
      updateMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (registerValidationError) {
      setAuthFeedback(registerValidationError);
      setAuthFeedbackType("error");
      return;
    }

    setLoading(true);
    updateMessage("info", "");
    setAuthFeedback("");

    try {
      const data = await register({
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
      });
      setAuthFeedback(`Registered ${data.user.email}. You can log in now.`);
      setAuthFeedbackType("success");
      setAuthMode("login");
      updateMessage("success", `Registered ${data.user.email}. You can log in now.`);
    } catch (error) {
      setAuthFeedback(error.message);
      setAuthFeedbackType("error");
      updateMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePredict(event) {
    event.preventDefault();
    if (!isPromptValid) {
      setPrompt(defaultPrompt);
      updateMessage("error", "Prompt was empty. A sample prompt has been restored.");
      return;
    }

    setLoading(true);
    updateMessage("info", "");

    try {
      const data = await createPrediction(token, {
        prompt: trimmedPrompt,
      });
      setResult(data);
      const [historyData, statsData] = await Promise.all([
        getPredictionHistory(token),
        getPredictionStats(token),
      ]);
      setHistory(historyData.items);
      setStats(statsData);
      updateMessage("success", "Prediction created successfully.");
    } catch (error) {
      updateMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setToken("");
    setResult(null);
    setAuthFeedback("");
    updateMessage("info", "Logged out.");
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">AI-powered DevOps</p>
          <h1>Microservices Platform on EKS with GitOps CI/CD</h1>
          <p className="subtitle">
            Portfolio-style control panel for authentication, AI prediction
            workflows, dependency health, and service-level telemetry.
          </p>
          <div className="hero-badges">
            <span className="hero-badge">React + Vite</span>
            <span className="hero-badge">Node.js microservices</span>
            <span className="hero-badge">FastAPI inference</span>
            <span className="hero-badge">Docker Compose ready</span>
          </div>
        </div>
        <aside className="hero-panel">
          <p className="panel-label">Platform snapshot</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>5</strong>
              <span>Services</span>
            </div>
            <div className="hero-stat">
              <strong>{healthyDependencyCount}/{dependencyItems.length || 2}</strong>
              <span>Dependencies healthy</span>
            </div>
            <div className="hero-stat">
              <strong>{totalPredictions}</strong>
              <span>Predictions stored</span>
            </div>
            <div className="hero-stat">
              <strong>{averageConfidence}</strong>
              <span>Average confidence</span>
            </div>
          </div>
        </aside>
      </header>

      <main className="dashboard">
        <section className="card card-auth">
          <div className="section-head">
            <div>
              <p className="section-kicker">Access</p>
              <h2>Authentication</h2>
            </div>
            <span className={`status-pill ${token ? "ok" : "idle"}`}>
              {token ? "Authenticated" : "Signed out"}
            </span>
          </div>
          <div className="tab-row" role="tablist" aria-label="Authentication modes">
            <button
              type="button"
              className={authMode === "login" ? "tab-button active" : "tab-button"}
              onClick={() => {
                setAuthMode("login");
                setAuthFeedback("");
                setAuthFeedbackType("error");
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === "register" ? "tab-button active" : "tab-button"}
              onClick={() => {
                setAuthMode("register");
                setAuthFeedback("");
                setAuthFeedbackType("error");
              }}
            >
              Register
            </button>
          </div>
          <form onSubmit={handleLogin} className="stack">
            {authMode === "register" && (
              <label>
                Name
                <input name="name" value={authForm.name} onChange={updateForm} />
              </label>
            )}
            <label>
              Email
              <input
                name="email"
                type="email"
                value={authForm.email}
                onChange={updateForm}
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                value={authForm.password}
                onChange={updateForm}
              />
            </label>
            <div className="row">
              {authMode === "login" ? (
                <button disabled={!canLogin} type="submit">
                  Login
                </button>
              ) : (
                <button
                  disabled={!canRegister}
                  type="button"
                  className="secondary"
                  onClick={handleRegister}
                >
                  Create account
                </button>
              )}
            </div>
          </form>
          {authFeedback && (
            <p className={`form-feedback ${authFeedbackType}`}>{authFeedback}</p>
          )}
          {!authFeedback && authMode === "login" && loginValidationError && (
            <p className="form-feedback muted">{loginValidationError}</p>
          )}
          {!authFeedback && authMode === "register" && registerValidationError && (
            <p className="form-feedback muted">{registerValidationError}</p>
          )}
          <p className="hint">JWT token: {token ? "issued" : "not issued"}</p>
          {profile && (
            <div className="profile-box">
              <div className="profile-head">
                <div>
                  <p className="profile-name">{profile.name}</p>
                  <p className="profile-email">{profile.email}</p>
                </div>
                <span className="role-pill">{profile.role}</span>
              </div>
              <button type="button" className="secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </section>

        <section className="card card-predict">
          <div className="section-head">
            <div>
              <p className="section-kicker">Inference</p>
              <h2>Prediction Request</h2>
            </div>
            <span className={`status-pill ${isPromptValid ? "ok" : "warn"}`}>
              {isPromptValid ? "Prompt ready" : "Needs input"}
            </span>
          </div>
          <form onSubmit={handlePredict} className="stack">
            <label>
              Prompt
              <textarea
                rows="6"
                placeholder={defaultPrompt}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
            </label>
            <p className="hint">Prompt must be at least 5 characters.</p>
            <button
              disabled={loading || !token || !isPromptValid}
              type="submit"
            >
              Run prediction
            </button>
          </form>
          {result && (
            <div className="result-box">
              <div className="result-top">
                <div>
                  <p className="section-kicker">Latest output</p>
                  <h3>{titleCase(result.label)} signal detected</h3>
                </div>
                <span className={`result-badge ${result.label}`}>{result.label}</span>
              </div>
              <div className="result-grid">
                <div className="result-metric">
                  <span>Confidence</span>
                  <strong>{result.confidence}</strong>
                </div>
                <div className="result-metric">
                  <span>Urgency</span>
                  <strong>{titleCase(result.urgency)}</strong>
                </div>
                <div className="result-metric">
                  <span>Category</span>
                  <strong>{titleCase(result.category)}</strong>
                </div>
                <div className="result-metric">
                  <span>Model</span>
                  <strong>{result.model}</strong>
                </div>
              </div>
              <div className="insight-box">
                <p className="insight-title">Recommended action</p>
                <p>{result.recommendedAction}</p>
              </div>
              <div className="keyword-row">
                {(result.keywords || []).map((keyword) => (
                  <span className="keyword-chip" key={keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="card card-stats">
          <div className="section-head">
            <div>
              <p className="section-kicker">Telemetry</p>
              <h2>Platform Stats</h2>
            </div>
            <span className={`status-pill ${stats ? "ok" : "idle"}`}>
              {stats ? "Live summary" : "Awaiting login"}
            </span>
          </div>
          {stats ? (
            <div className="stats-grid">
              <div className="stat-tile">
                <strong>{stats.totalPredictions}</strong>
                <span>Total predictions</span>
              </div>
              <div className="stat-tile">
                <strong>{stats.averageConfidence}</strong>
                <span>Average confidence</span>
              </div>
              <div className="stat-tile">
                <strong>{stats.totalsByLabel?.positive || 0}</strong>
                <span>Positive</span>
              </div>
              <div className="stat-tile">
                <strong>{stats.totalsByLabel?.negative || 0}</strong>
                <span>Negative</span>
              </div>
            </div>
          ) : (
            <p className="hint">Login to load prediction statistics.</p>
          )}
          <div className="dependency-box">
            <div className="section-head compact">
              <h3>Gateway Dependencies</h3>
              <span
                className={`status-pill ${healthyDependencyCount === dependencyItems.length ? "ok" : "warn"}`}
              >
                {healthyDependencyCount}/{dependencyItems.length || 2} healthy
              </span>
            </div>
            {dependencies?.dependencies?.map((item) => (
              <div className="dependency-item" key={item.service}>
                <div>
                  <strong>{item.service}</strong>
                  <p className="dependency-detail">
                    {item.details?.service || item.error || "No detail"}
                  </p>
                </div>
                <span className={`status-pill ${item.status === "ok" ? "ok" : "warn"}`}>
                  {item.status}
                </span>
              </div>
            )) || <p className="hint">Loading dependency health...</p>}
          </div>
        </section>

        <section className="card history-card">
          <div className="section-head">
            <div>
              <p className="section-kicker">Archive</p>
              <h2>Prediction History</h2>
            </div>
            <span className={`status-pill ${history.length ? "ok" : "idle"}`}>
              {history.length} records
            </span>
          </div>
          {history.length === 0 ? (
            <p className="hint">No predictions yet.</p>
          ) : (
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id}>
                  <div className="history-head">
                    <strong>{titleCase(item.label)}</strong>
                    <span className="confidence-pill">{item.confidence}</span>
                  </div>
                  <span>{item.summary || item.prompt}</span>
                  <div className="history-meta">
                    <small>{item.category}</small>
                    <small>urgency {item.urgency}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card card-insight">
          <div className="section-head">
            <div>
              <p className="section-kicker">Highlights</p>
              <h2>Latest Snapshot</h2>
            </div>
          </div>
          {latestPrediction ? (
            <div className="snapshot-box">
              <span className={`result-badge ${latestPrediction.label}`}>
                {latestPrediction.label}
              </span>
              <p className="snapshot-summary">
                {latestPrediction.summary || latestPrediction.prompt}
              </p>
              <p className="snapshot-action">
                {latestPrediction.recommendedAction || "No recommendation yet."}
              </p>
            </div>
          ) : (
            <p className="hint">
              Run your first prediction to populate the portfolio snapshot panel.
            </p>
          )}
        </section>
      </main>

      <footer className={`status-bar ${messageType}`}>
        {loading ? "Working..." : message}
      </footer>
    </div>
  );
}
