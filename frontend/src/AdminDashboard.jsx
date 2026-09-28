import { useEffect, useState } from "react";

import {
  Brain,
  Users,
  FileText,
  Database,
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LogOut,
  BarChart3,
} from "lucide-react";

import "./AdminDashboard.css";


function AdminDashboard() {
  const [user, setUser] = useState(null);

  const [dataset, setDataset] = useState(null);
  const [loadingDataset, setLoadingDataset] = useState(true);
  const [datasetError, setDatasetError] = useState("");

  useEffect(() => {
  const storedUser = localStorage.getItem("wikiquality_user");
  const token = localStorage.getItem("wikiquality_token");

  if (!storedUser || !token) {
    window.location.href = "/";
    return;
  }

  try {
    const parsedUser = JSON.parse(storedUser);

    if (parsedUser.role !== "admin") {
      window.location.href = "/dashboard";
      return;
    }

    setUser(parsedUser);
    loadDatasetQuality();
  } catch (error) {
    console.error("Unable to read stored user:", error);

    localStorage.removeItem("wikiquality_token");
    localStorage.removeItem("wikiquality_user");

    window.location.href = "/";
  }
}, []);

  const loadDatasetQuality = async () => {
    setLoadingDataset(true);
    setDatasetError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/ml/dataset-quality"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load dataset information."
        );
      }

      setDataset(data);

    } catch (error) {
      console.error(
        "Dataset quality error:",
        error
      );

      setDatasetError(
        error.message ||
        "Unable to connect to backend."
      );

    } finally {
      setLoadingDataset(false);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem(
      "wikiquality_token"
    );

    localStorage.removeItem(
      "wikiquality_user"
    );

    window.location.href = "/";
  };


  const totalArticles =
    dataset?.total_articles ?? 0;

  const qualityClasses =
    dataset?.represented_classes?.length ?? 0;

  const trainingReady =
    dataset?.ml_readiness?.training_ready ?? false;

  const duplicateCount =
    dataset?.duplicate_article_ids?.length ?? 0;


  return (
    <div className="admin-layout">

      {/* SIDEBAR */}

      <aside className="admin-sidebar">

        <div className="admin-brand">

          <div className="admin-brand-icon">
            <Brain size={25} />
          </div>

          <div>
            <h2>
              WikiQuality <span>AI</span>
            </h2>

            <p>
              Administration
            </p>
          </div>

        </div>


        <nav className="admin-navigation">

          <div className="admin-nav-item active">
            <BarChart3 size={19} />
            <span>System Overview</span>
          </div>

          <div className="admin-nav-item">
            <Users size={19} />
            <span>Users</span>
          </div>

          <div className="admin-nav-item">
            <FileText size={19} />
            <span>Analyses</span>
          </div>

          <div className="admin-nav-item">
            <Database size={19} />
            <span>Dataset</span>
          </div>

          <div className="admin-nav-item">
            <Brain size={19} />
            <span>Model Information</span>
          </div>

        </nav>


        <div className="admin-sidebar-bottom">

          <div className="admin-user">

            <div className="admin-user-avatar">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>
                {user?.name || "Administrator"}
              </strong>

              <span>
                {user?.email || "admin@wikiquality.ai"}
              </span>
            </div>

          </div>


          <button
            className="admin-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <main className="admin-main">

        {/* HEADER */}

        <header className="admin-header">

          <div>

            <span className="admin-eyebrow">
              ADMIN DASHBOARD
            </span>

            <h1>
              System Overview
            </h1>

            <p>
              Monitor WikiQuality AI analysis,
              dataset quality and system readiness.
            </p>

          </div>


          <div className="admin-header-user">

            <div className="admin-header-avatar">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>
                {user?.name || "Administrator"}
              </strong>

              <span>
                Administrator
              </span>
            </div>

          </div>

        </header>


        {/* TOP STATISTICS */}

        <section className="admin-stats">

          <div className="admin-stat-card">

            <div className="admin-stat-icon blue">
              <Database size={23} />
            </div>

            <div>
              <span>
                Dataset Articles
              </span>

              <strong>
                {loadingDataset
                  ? "..."
                  : totalArticles}
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon purple">
              <Brain size={23} />
            </div>

            <div>
              <span>
                Quality Classes
              </span>

              <strong>
                {loadingDataset
                  ? "..."
                  : qualityClasses}
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon green">
              <Activity size={23} />
            </div>

            <div>
              <span>
                Analysis Engine
              </span>

              <strong>
                Operational
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon orange">
              <ShieldCheck size={23} />
            </div>

            <div>
              <span>
                ML Readiness
              </span>

              <strong>
                {loadingDataset
                  ? "..."
                  : trainingReady
                  ? "Ready"
                  : "Prototype"}
              </strong>
            </div>

          </div>

        </section>


        {/* SYSTEM STATUS + DATASET */}

        <section className="admin-grid">

          {/* SYSTEM STATUS */}

          <div className="admin-panel">

            <div className="panel-header">

              <div>
                <h2>
                  System Status
                </h2>

                <p>
                  Current WikiQuality AI services
                </p>
              </div>

              <span className="status-badge operational">
                <span></span>
                Operational
              </span>

            </div>


            <div className="status-list">

              <div className="status-row">

                <div>
                  <CheckCircle2 size={18} />
                  <span>
                    FastAPI Backend
                  </span>
                </div>

                <strong>
                  Operational
                </strong>

              </div>


              <div className="status-row">

                <div>
                  <CheckCircle2 size={18} />
                  <span>
                    NLP Analysis
                  </span>
                </div>

                <strong>
                  Available
                </strong>

              </div>


              <div className="status-row">

                <div>
                  <CheckCircle2 size={18} />
                  <span>
                    Semantic Analysis
                  </span>
                </div>

                <strong>
                  Available
                </strong>

              </div>


              <div className="status-row">

                <div>
                  <CheckCircle2 size={18} />
                  <span>
                    Entity Analysis
                  </span>
                </div>

                <strong>
                  Available
                </strong>

              </div>


              <div className="status-row">

                <div>
                  <CheckCircle2 size={18} />
                  <span>
                    Evidence Engine
                  </span>
                </div>

                <strong>
                  Available
                </strong>

              </div>

            </div>

          </div>


          {/* DATASET QUALITY */}

          <div className="admin-panel">

            <div className="panel-header">

              <div>
                <h2>
                  Dataset Quality
                </h2>

                <p>
                  Current ML training dataset
                </p>
              </div>

              <button
                className="refresh-button"
                onClick={loadDatasetQuality}
                disabled={loadingDataset}
              >
                <RefreshCw
                  size={17}
                  className={
                    loadingDataset
                      ? "spinning"
                      : ""
                  }
                />
              </button>

            </div>


            {datasetError ? (

              <div className="dataset-error">

                <AlertTriangle size={20} />

                <div>
                  <strong>
                    Dataset unavailable
                  </strong>

                  <p>
                    {datasetError}
                  </p>
                </div>

              </div>

            ) : (

              <div className="dataset-content">

                <div className="dataset-number">

                  <strong>
                    {loadingDataset
                      ? "..."
                      : totalArticles}
                  </strong>

                  <span>
                    labeled articles
                  </span>

                </div>


                <div className="dataset-progress">

                  <div className="progress-label">

                    <span>
                      Training readiness
                    </span>

                    <strong>
                      {trainingReady
                        ? "Ready"
                        : "Not ready"}
                    </strong>

                  </div>

                  <div className="progress-track">

                    <div
                      className={
                        trainingReady
                          ? "progress-fill ready"
                          : "progress-fill"
                      }
                      style={{
                        width: trainingReady
                          ? "100%"
                          : `${Math.min(
                              totalArticles * 3.33,
                              95
                            )}%`,
                      }}
                    ></div>

                  </div>

                </div>


                <div className="dataset-warning">

                  {trainingReady ? (
                    <CheckCircle2 size={19} />
                  ) : (
                    <AlertTriangle size={19} />
                  )}

                  <span>
                    {trainingReady
                      ? "Dataset meets the current prototype training requirements."
                      : "Collect more labeled articles before training the ML model."}
                  </span>

                </div>

              </div>

            )}

          </div>

        </section>


        {/* QUALITY DISTRIBUTION */}

        <section className="admin-panel">

          <div className="panel-header">

            <div>
              <h2>
                Quality Class Distribution
              </h2>

              <p>
                Labeled Wikipedia articles currently
                available in the dataset.
              </p>
            </div>

          </div>


          <div className="quality-grid">

            {[
              "Stub",
              "Start",
              "C",
              "B",
              "GA",
              "FA",
            ].map((label) => {

              const count =
                dataset?.class_distribution?.[
                  label
                ] ?? 0;

              return (
                <div
                  className="quality-card"
                  key={label}
                >

                  <span>
                    {label}
                  </span>

                  <strong>
                    {loadingDataset
                      ? "..."
                      : count}
                  </strong>

                  <small>
                    articles
                  </small>

                </div>
              );

            })}

          </div>

        </section>


        {/* MONITORING */}

        <section className="admin-grid">

          <div className="admin-panel">

            <div className="panel-header">

              <div>
                <h2>
                  Analysis Monitoring
                </h2>

                <p>
                  Core analysis services
                </p>
              </div>

            </div>


            <div className="monitoring-list">

              <div className="monitoring-item">
                <Brain size={19} />
                <span>
                  NLP Engine
                </span>
                <strong>
                  Active
                </strong>
              </div>

              <div className="monitoring-item">
                <Activity size={19} />
                <span>
                  Semantic Engine
                </span>
                <strong>
                  Active
                </strong>
              </div>

              <div className="monitoring-item">
                <ShieldCheck size={19} />
                <span>
                  Evidence Engine
                </span>
                <strong>
                  Active
                </strong>
              </div>

            </div>

          </div>


          <div className="admin-panel">

            <div className="panel-header">

              <div>
                <h2>
                  Data Integrity
                </h2>

                <p>
                  Dataset validation indicators
                </p>
              </div>

            </div>


            <div className="integrity-list">

              <div>

                {duplicateCount === 0 ? (
                  <CheckCircle2 />
                ) : (
                  <XCircle />
                )}

                <span>
                  Duplicate articles
                </span>

                <strong>
                  {duplicateCount}
                </strong>

              </div>


              <div>

                <CheckCircle2 />

                <span>
                  Feature values
                </span>

                <strong>
                  Valid
                </strong>

              </div>


              <div>

                <CheckCircle2 />

                <span>
                  Dataset structure
                </span>

                <strong>
                  Valid
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* FOOTER */}

        <footer className="admin-footer">

          <span>
            WikiQuality AI
          </span>

          <span>
            AI-Powered Knowledge Quality Analysis
          </span>

          <span>
            Admin Panel
          </span>

        </footer>

      </main>

    </div>
  );
}

export default AdminDashboard;