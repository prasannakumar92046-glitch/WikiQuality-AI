import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  FileText,
  History,
  Home,
  LogOut,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  AlertCircle,
} from "lucide-react";
import "./Dashboard.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function Dashboard() {
  const navigateTo = (path) => {
    window.location.href = path;
  };
  const [user, setUser] = useState(null);
  const [articleText, setArticleText] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [systemStatus, setSystemStatus] = useState("Checking...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("wikiquality_user");
    const token = localStorage.getItem("wikiquality_token");

    if (!storedUser || !token) {
      window.location.href = "/";
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.role !== "user") {
        window.location.href = "/admin";
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("wikiquality_user");
      localStorage.removeItem("wikiquality_token");
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    const loadSystemData = async () => {
      try {
        const healthResponse = await fetch(
          `${API_BASE_URL}/api/health`
        );

        if (healthResponse.ok) {
          setSystemStatus("Operational");
        } else {
          setSystemStatus("Unavailable");
        }
      } catch {
        setSystemStatus("Unavailable");
      }

      try {
        const datasetResponse = await fetch(
          `${API_BASE_URL}/api/ml/dataset-quality`
        );

        if (datasetResponse.ok) {
          const data = await datasetResponse.json();
          setDatasetInfo(data);
        }
      } catch {
        setDatasetInfo(null);
      }
    };

    loadSystemData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("wikiquality_token");
    localStorage.removeItem("wikiquality_user");

    window.location.href = "/";
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();

    setError("");
    setAnalysisResult(null);

    if (!articleText.trim()) {
      setError("Please enter article text before starting the analysis.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/analyze/quality-features`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: articleText,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Article analysis failed."
        );
      }

      setAnalysisResult(data);
    } catch (analysisError) {
      setError(
        analysisError.message ||
          "Unable to connect to the analysis service."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="dashboard-loading">
        <Brain size={30} />
        <p>Loading WikiQuality AI...</p>
      </div>
    );
  }

  const qualityAnalysis = analysisResult?.quality_analysis;
  const summary = qualityAnalysis?.summary;

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Brain size={23} />
          </div>

          <div>
            <strong>
              WikiQuality <span>AI</span>
            </strong>
            <small>Knowledge Quality Platform</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button type="button" className="sidebar-nav-item active" onClick={() => navigateTo("/dashboard")}>
            <Home size={18} />
            <span>Dashboard</span>
          </button>

          <button type="button" className="sidebar-nav-item" onClick={() => navigateTo("/analyze")}>
            <Search size={18} />
            <span>Analyze Article</span>
          </button>

          <button type="button" className="sidebar-nav-item" onClick={() => navigateTo("/history")}>
            <History size={18} />
            <span>Analysis History</span>
          </button>

          <button type="button" className="sidebar-nav-item" onClick={() => navigateTo("/compare")}>
            <BarChart3 size={18} />
            <span>Compare Articles</span>
          </button>

          <button type="button" className="sidebar-nav-item" onClick={() => navigateTo("/knowledge-graph")}>
            <Network size={18} />
            <span>Knowledge Graph</span>
          </button>

          <button type="button" className="sidebar-nav-item" onClick={() => navigateTo("/reports")}>
            <FileText size={18} />
            <span>Reports</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              <UserRound size={18} />
            </div>

            <div>
              <strong>{user.name}</strong>
              <span>User</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              USER DASHBOARD
            </p>

            <h1>Welcome back, {user.name.split(" ")[0]} 👋</h1>

            <p className="dashboard-subtitle">
              Analyze Wikipedia knowledge quality using NLP,
              semantic analysis and evidence-based metrics.
            </p>
          </div>

          <div className="header-user">
            <div className="header-user-avatar">
              <UserRound size={20} />
            </div>

            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
        </header>

        <section className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <BookOpen size={21} />
            </div>

            <div>
              <span>Dataset Articles</span>
              <strong>
                {datasetInfo?.total_articles ?? "—"}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <Brain size={21} />
            </div>

            <div>
              <span>Quality Classes</span>
              <strong>
                {datasetInfo?.represented_classes?.length ?? "—"}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>Analysis Engine</span>
              <strong>{systemStatus}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <ShieldCheck size={21} />
            </div>

            <div>
              <span>Your Role</span>
              <strong>User</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="analysis-card">
            <div className="section-heading">
              <div>
                <div className="section-icon">
                  <Sparkles size={19} />
                </div>

                <div>
                  <h2>Analyze an Article</h2>
                  <p>
                    Paste article text to run the WikiQuality AI
                    quality pipeline.
                  </p>
                </div>
              </div>

              <span className="live-badge">
                <span></span>
                Live API
              </span>
            </div>

            <form onSubmit={handleAnalyze}>
              <label htmlFor="article-text">
                Article content
              </label>

              <textarea
                id="article-text"
                value={articleText}
                onChange={(event) =>
                  setArticleText(event.target.value)
                }
                placeholder={`Paste Wikipedia article text here...

Example:
Mangaluru is a major city in Karnataka, India.

History
Mangaluru has a long history...

Geography
The city is located on the western coast...`}
                rows={10}
                disabled={loading}
              />

              {error && (
                <div className="analysis-error">
                  <AlertCircle size={17} />
                  <span>{error}</span>
                </div>
              )}

              <div className="analysis-actions">
                <div className="input-hint">
                  <FileText size={15} />
                  <span>
                    NLP • Semantic • Information • Entity •
                    Citation analysis
                  </span>
                </div>

                <button
                  type="submit"
                  className="analyze-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={17} />
                      Analyze Article
                      <ChevronRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="quick-actions-card">
            <div className="section-heading simple">
              <div>
                <h2>Quick Actions</h2>
                <p>Choose another analysis source.</p>
              </div>
            </div>

            <button className="quick-action">
              <div className="quick-action-icon">
                <Search size={19} />
              </div>

              <div>
                <strong>Wikipedia Search</strong>
                <span>Find and analyze an article</span>
              </div>

              <ChevronRight size={17} />
            </button>

            <button className="quick-action">
              <div className="quick-action-icon">
                <Upload size={19} />
              </div>

              <div>
                <strong>Upload PDF</strong>
                <span>Analyze a PDF document</span>
              </div>

              <ChevronRight size={17} />
            </button>

            <button className="quick-action">
              <div className="quick-action-icon">
                <FileText size={19} />
              </div>

              <div>
                <strong>Upload TXT</strong>
                <span>Analyze a text document</span>
              </div>

              <ChevronRight size={17} />
            </button>

            <button className="quick-action">
              <div className="quick-action-icon">
                <Network size={19} />
              </div>

              <div>
                <strong>Knowledge Graph</strong>
                <span>Explore article relationships</span>
              </div>

              <ChevronRight size={17} />
            </button>
          </div>
        </section>

        {analysisResult && (
          <section className="results-card">
            <div className="results-heading">
              <div>
                <p className="dashboard-eyebrow">
                  ANALYSIS COMPLETE
                </p>

                <h2>Quality Analysis Results</h2>
              </div>

              <div className="result-success">
                <CheckCircle2 size={17} />
                Completed
              </div>
            </div>

            <div className="result-stat-grid">
              <div className="result-stat">
                <span>Total Findings</span>
                <strong>
                  {summary?.total_findings ?? 0}
                </strong>
              </div>

              <div className="result-stat">
                <span>High Findings</span>
                <strong>
                  {summary?.high_findings ?? 0}
                </strong>
              </div>

              <div className="result-stat">
                <span>Medium Findings</span>
                <strong>
                  {summary?.medium_findings ?? 0}
                </strong>
              </div>

              <div className="result-stat">
                <span>Strengths</span>
                <strong>
                  {summary?.total_strengths ?? 0}
                </strong>
              </div>
            </div>

            {qualityAnalysis?.strengths?.length > 0 && (
              <div className="result-section">
                <h3>
                  <CheckCircle2 size={17} />
                  Detected Strengths
                </h3>

                <div className="result-list">
                  {qualityAnalysis.strengths
                    .slice(0, 4)
                    .map((strength, index) => (
                      <div
                        className="result-item positive"
                        key={`strength-${index}`}
                      >
                        <CheckCircle2 size={15} />
                        <span>
                          {typeof strength === "string"
                            ? strength
                            : strength.message ||
                              strength.description ||
                              JSON.stringify(strength)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {qualityAnalysis?.findings?.length > 0 && (
              <div className="result-section">
                <h3>
                  <AlertCircle size={17} />
                  Findings Requiring Review
                </h3>

                <div className="result-list">
                  {qualityAnalysis.findings
                    .slice(0, 5)
                    .map((finding, index) => (
                      <div
                        className="result-item finding"
                        key={`finding-${index}`}
                      >
                        <AlertCircle size={15} />

                        <span>
                          {finding.message ||
                            finding.description ||
                            JSON.stringify(finding)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </section>
        )}

        <section className="bottom-grid">
          <div className="history-card">
            <div className="section-heading simple">
              <div>
                <h2>Recent Analyses</h2>
                <p>Your latest article analysis activity.</p>
              </div>

              <button className="text-button">
                View all
              </button>
            </div>

            <div className="empty-history">
              <div className="empty-icon">
                <History size={23} />
              </div>

              <h3>No analysis history yet</h3>

              <p>
                Your completed analyses will appear here.
              </p>
            </div>
          </div>

          <div className="system-card">
            <div className="section-heading simple">
              <div>
                <h2>System Status</h2>
                <p>Current WikiQuality AI services.</p>
              </div>
            </div>

            <div className="system-row">
              <span>
                <span className="status-dot"></span>
                FastAPI Backend
              </span>
              <strong>{systemStatus}</strong>
            </div>

            <div className="system-row">
              <span>
                <span className="status-dot"></span>
                NLP Analysis
              </span>
              <strong>Available</strong>
            </div>

            <div className="system-row">
              <span>
                <span className="status-dot"></span>
                Semantic Analysis
              </span>
              <strong>Available</strong>
            </div>

            <div className="system-row">
              <span>
                <span className="status-dot"></span>
                Dataset
              </span>

              <strong>
                {datasetInfo?.training_ready
                  ? "Ready"
                  : "Prototype"}
              </strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;