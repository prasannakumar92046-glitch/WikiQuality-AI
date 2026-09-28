import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  History,
  Home,
  LoaderCircle,
  LogOut,
  Network,
  Printer,
  Search,
  ShieldCheck,
} from "lucide-react";

import "./UserFeaturePage.css";
import "./ReportsPage.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function readStoredUser() {
  try {
    const stored =
      localStorage.getItem(
        "wikiquality_user"
      );

    return stored
      ? JSON.parse(stored)
      : null;
  } catch {
    return null;
  }
}

async function authenticatedRequest(path) {
  const token =
    localStorage.getItem(
      "wikiquality_token"
    );

  if (!token) {
    throw new Error(
      "Your login session is missing. Please log in again."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      headers: {
        "X-Auth-Token": token,
      },
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (
    !response.ok ||
    data.success === false
  ) {
    throw new Error(
      data.message ||
        (typeof data.detail === "string"
          ? data.detail
          : "") ||
        "Unable to load the report."
    );
  }

  return data;
}

function formatDate(value) {
  if (!value) return "Unknown date";

  const date = new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? value
    : date.toLocaleString();
}

function countWords(text) {
  return text?.trim()
    ? text
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    : 0;
}

function getAnalysisValue(
  result,
  path
) {
  let current = result;

  for (const key of path) {
    current =
      current?.[key];
  }

  return current;
}

function Metric({
  label,
  value,
}) {
  return (
    <div className="report-metric">
      <span>{label}</span>
      <strong>
        {value === null ||
        value === undefined ||
        value === ""
          ? "—"
          : String(value)}
      </strong>
    </div>
  );
}

function ReportPage() {
  const user = readStoredUser();

  const [analyses, setAnalyses] =
    useState([]);

  const [selected, setSelected] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const navigate = (path) => {
    window.location.href =
      path;
  };

  const logout = () => {
    localStorage.removeItem(
      "wikiquality_token"
    );

    localStorage.removeItem(
      "wikiquality_user"
    );

    window.location.href = "/";
  };

  const loadReports =
    async () => {
      try {
        setError("");

        const data =
          await authenticatedRequest(
            "/api/history?limit=50"
          );

        setAnalyses(
          Array.isArray(
            data.analyses
          )
            ? data.analyses
            : []
        );
      } catch (loadError) {
        console.error(
          "Reports history error:",
          loadError
        );

        setError(
          loadError.message ||
            "Unable to load reports."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadReports();
  }, []);

  const openReport =
    async (id) => {
      setDetailLoading(true);
      setError("");

      try {
        const data =
          await authenticatedRequest(
            `/api/history/${encodeURIComponent(
              id
            )}`
          );

        setSelected(
          data.analysis || null
        );
      } catch (detailError) {
        console.error(
          "Report detail error:",
          detailError
        );

        setError(
          detailError.message ||
            "Unable to load the selected report."
        );
      } finally {
        setDetailLoading(false);
      }
    };

  const analysis =
    selected?.analysis_result || {};

  const quality =
    analysis?.quality_analysis || {};

  const structure =
    analysis?.structure_analysis
      ?.statistics || {};

  const nlp =
    analysis?.nlp_analysis
      ?.metrics ||
    analysis?.nlp_analysis ||
    {};

  const semantic =
    analysis?.semantic_analysis
      ?.metrics ||
    analysis?.semantic_analysis ||
    {};

  const information =
    analysis?.information_analysis
      ?.metrics ||
    analysis?.information_analysis ||
    {};

  const entities =
    analysis?.entity_analysis
      ?.metrics ||
    analysis?.entity_analysis ||
    {};

  const topics =
    analysis
      ?.topic_coverage_analysis
      ?.metrics ||
    analysis?.topic_coverage_analysis ||
    {};

  const citations =
    analysis?.citation_analysis
      ?.metrics ||
    analysis?.citation_analysis ||
    {};

  const explanation =
    analysis?.ai_explanation
      ?.explanation ||
    analysis?.ai_explanation ||
    {};

  const findings =
    Array.isArray(
      quality?.findings
    )
      ? quality.findings
      : [];

  const strengths =
    Array.isArray(
      quality?.strengths
    )
      ? quality.strengths
      : [];

  const evidence =
    Array.isArray(
      analysis?.evidence
    )
      ? analysis.evidence
      : [];

  const summary =
    quality?.summary || {};

  const downloadJson =
    () => {
      if (!selected) return;

      const report = {
        title:
          selected.title,
        source_type:
          selected.source_type,
        source_url:
          selected.source_url,
        created_at:
          selected.created_at,
        word_count:
          countWords(
            selected.article_text
          ),
        summary,
        analysis_result:
          selected.analysis_result,
      };

      const blob =
        new Blob(
          [
            JSON.stringify(
              report,
              null,
              2
            ),
          ],
          {
            type:
              "application/json",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        `${(
          selected.title ||
          "wikiquality-report"
        )
          .replace(
            /[^a-z0-9]+/gi,
            "-"
          )
          .replace(
            /^-|-$/g,
            ""
          )
          .toLowerCase() ||
          "wikiquality-report"}.json`;

      link.click();

      URL.revokeObjectURL(
        url
      );
    };

  const printReport =
    () => {
      if (!selected) return;
      window.print();
    };

  const generatedAt =
    useMemo(
      () =>
        selected
          ? formatDate(
              selected.created_at
            )
          : "",
      [selected]
    );

  return (
    <div className="feature-page">
      <aside className="feature-sidebar no-print">
        <div className="feature-brand">
          <div className="feature-brand-icon">
            <Brain size={22} />
          </div>

          <div className="feature-brand-copy">
            <strong>
              WikiQuality <span>AI</span>
            </strong>
            <small>
              Knowledge Quality Platform
            </small>
          </div>
        </div>

        <nav className="feature-nav">
          <button
            type="button"
            className="feature-nav-item"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <Home size={18} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className="feature-nav-item"
            onClick={() =>
              navigate("/analyze")
            }
          >
            <Search size={18} />
            <span>Analyze Article</span>
          </button>

          <button
            type="button"
            className="feature-nav-item"
            onClick={() =>
              navigate("/history")
            }
          >
            <History size={18} />
            <span>Analysis History</span>
          </button>

          <button
            type="button"
            className="feature-nav-item"
            onClick={() =>
              navigate("/compare")
            }
          >
            <BarChart3 size={18} />
            <span>Compare Articles</span>
          </button>

          <button
            type="button"
            className="feature-nav-item"
            onClick={() =>
              navigate(
                "/knowledge-graph"
              )
            }
          >
            <Network size={18} />
            <span>
              Knowledge Graph
            </span>
          </button>

          <button
            type="button"
            className="feature-nav-item active"
            onClick={() =>
              navigate("/reports")
            }
          >
            <FileText size={18} />
            <span>Reports</span>
          </button>
        </nav>

        <div className="feature-sidebar-bottom">
          <div className="feature-user">
            <div className="feature-user-avatar">
              {(user?.name ||
                "User")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="feature-user-copy">
              <strong>
                {user?.name ||
                  "User"}
              </strong>
              <span>User</span>
            </div>
          </div>

          <button
            type="button"
            className="feature-logout"
            onClick={logout}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="feature-main report-print-area">
        <header className="feature-header">
          <div>
            <p className="feature-eyebrow">
              USER DASHBOARD
            </p>

            <h1>Reports</h1>

            <p>
              Turn a saved analysis into a
              judge-friendly technical report.
            </p>
          </div>

          {selected && (
            <div className="report-actions no-print">
              <button
                type="button"
                onClick={downloadJson}
              >
                <Download size={15} />
                Download JSON
              </button>

              <button
                type="button"
                onClick={printReport}
              >
                <Printer size={15} />
                Print / Save PDF
              </button>
            </div>
          )}
        </header>

        {error && (
          <div className="analysis-error no-print">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <section className="history-loading-card">
            <LoaderCircle
              size={28}
              className="spin"
            />
            <h2>
              Loading reports...
            </h2>
            <p>
              Retrieving saved analyses
              from the backend database.
            </p>
          </section>
        ) : selected ? (
          <>
            <section className="report-title-card">
              <div>
                <p className="feature-kicker">
                  WIKIQUALITY AI REPORT
                </p>

                <h2>
                  {selected.title}
                </h2>

                <p>
                  <strong>
                    Source:
                  </strong>{" "}
                  {selected.source_type}
                  {" · "}
                  {generatedAt}
                </p>

                {selected.source_url && (
                  <a
                    href={
                      selected.source_url
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open source
                  </a>
                )}
              </div>

              <div className="report-status-badge">
                <CheckCircle2 size={15} />
                Saved analysis
              </div>
            </section>

            <section className="report-summary-grid">
              <Metric
                label="Words"
                value={countWords(
                  selected.article_text
                )}
              />

              <Metric
                label="Sections"
                value={
                  structure.section_count
                }
              />

              <Metric
                label="Findings"
                value={
                  summary.total_findings ??
                  findings.length ??
                  0
                }
              />

              <Metric
                label="Strengths"
                value={
                  summary.total_strengths ??
                  strengths.length ??
                  0
                }
              />
            </section>

            <section className="report-content-card">
              <div className="report-section-heading">
                <div>
                  <ShieldCheck size={18} />

                  <div>
                    <h3>
                      Quality summary
                    </h3>

                    <p>
                      Key results from the
                      saved WikiQuality AI
                      analysis.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="report-back-button no-print"
                  onClick={() =>
                    setSelected(null)
                  }
                >
                  ← Back
                </button>
              </div>

              <div className="report-metric-section">
                <h4>
                  Core measurements
                </h4>

                <div className="report-detail-metric-grid">
                  <Metric
                    label="Vocabulary diversity"
                    value={
                      nlp.vocabulary_diversity
                    }
                  />

                  <Metric
                    label="Repetition ratio"
                    value={
                      nlp.repetition_ratio
                    }
                  />

                  <Metric
                    label="Semantic redundancy"
                    value={
                      semantic.semantic_redundancy_ratio
                    }
                  />

                  <Metric
                    label="Information diversity"
                    value={
                      information.information_diversity
                    }
                  />

                  <Metric
                    label="Entity diversity"
                    value={
                      entities.entity_diversity
                    }
                  />

                  <Metric
                    label="Topic coverage"
                    value={
                      topics.topic_coverage_ratio
                    }
                  />

                  <Metric
                    label="Citation density"
                    value={
                      citations.citation_density
                    }
                  />

                  <Metric
                    label="Entity mentions"
                    value={
                      entities.total_entity_mentions
                    }
                  />
                </div>
              </div>

              {strengths.length >
                0 && (
                <div className="report-section-block positive-report-block">
                  <div className="report-block-heading">
                    <CheckCircle2
                      size={17}
                    />
                    <h4>
                      Strengths
                    </h4>
                  </div>

                  <div className="report-bullet-list">
                    {strengths
                      .slice(
                        0,
                        10
                      )
                      .map(
                        (
                          item,
                          index
                        ) => (
                          <div
                            key={
                              `strength-${index}`
                            }
                          >
                            <span>
                              {index +
                                1}
                            </span>
                            <p>
                              {typeof item ===
                              "string"
                                ? item
                                : item?.message ||
                                  item?.description ||
                                  JSON.stringify(
                                    item
                                  )}
                            </p>
                          </div>
                        )
                      )}
                  </div>
                </div>
              )}

              {findings.length >
                0 && (
                <div className="report-section-block finding-report-block">
                  <div className="report-block-heading">
                    <AlertCircle
                      size={17}
                    />
                    <h4>
                      Findings requiring review
                    </h4>
                  </div>

                  <div className="report-bullet-list">
                    {findings
                      .slice(
                        0,
                        10
                      )
                      .map(
                        (
                          item,
                          index
                        ) => (
                          <div
                            key={
                              `finding-${index}`
                            }
                          >
                            <span>
                              {index +
                                1}
                            </span>
                            <p>
                              {typeof item ===
                              "string"
                                ? item
                                : item?.message ||
                                  item?.description ||
                                  JSON.stringify(
                                    item
                                  )}
                            </p>
                          </div>
                        )
                      )}
                  </div>
                </div>
              )}

              {(explanation?.headline ||
                explanation?.summary) && (
                <div className="report-section-block explanation-report-block">
                  <div className="report-block-heading">
                    <Brain
                      size={17}
                    />
                    <h4>
                      AI explanation
                    </h4>
                  </div>

                  {explanation.headline && (
                    <h5>
                      {explanation.headline}
                    </h5>
                  )}

                  {explanation.summary && (
                    <p className="report-long-text">
                      {explanation.summary}
                    </p>
                  )}

                  {Array.isArray(
                    explanation.concerns
                  ) &&
                    explanation.concerns
                      .length >
                      0 && (
                      <div className="report-mini-column">
                        <strong>
                          Concerns
                        </strong>

                        {explanation.concerns
                          .slice(
                            0,
                            8
                          )
                          .map(
                            (
                              item,
                              index
                            ) => (
                              <span
                                key={
                                  `concern-${index}`
                                }
                              >
                                •{" "}
                                {typeof item ===
                                "string"
                                  ? item
                                  : item?.message ||
                                    item?.description ||
                                    JSON.stringify(
                                      item
                                    )}
                              </span>
                            )
                          )}
                      </div>
                    )}

                  {Array.isArray(
                    explanation.improvement_suggestions
                  ) &&
                    explanation
                      .improvement_suggestions
                      .length >
                      0 && (
                      <div className="report-mini-column">
                        <strong>
                          Improvement suggestions
                        </strong>

                        {explanation
                          .improvement_suggestions
                          .slice(
                            0,
                            8
                          )
                          .map(
                            (
                              item,
                              index
                            ) => (
                              <span
                                key={
                                  `suggestion-${index}`
                                }
                              >
                                •{" "}
                                {typeof item ===
                                "string"
                                  ? item
                                  : item?.message ||
                                    item?.description ||
                                    JSON.stringify(
                                      item
                                    )}
                              </span>
                            )
                          )}
                      </div>
                    )}
                </div>
              )}

              {evidence.length >
                0 && (
                <div className="report-section-block">
                  <div className="report-block-heading">
                    <ShieldCheck
                      size={17}
                    />
                    <h4>
                      Evidence
                    </h4>
                  </div>

                  <div className="report-evidence-grid">
                    {evidence
                      .slice(
                        0,
                        12
                      )
                      .map(
                        (
                          item,
                          index
                        ) => (
                          <div
                            key={
                              `evidence-${index}`
                            }
                          >
                            <strong>
                              {item?.title ||
                                item?.metric ||
                                item?.category ||
                                "Evidence"}
                            </strong>

                            <p>
                              {typeof item ===
                              "string"
                                ? item
                                : item?.message ||
                                  item?.description ||
                                  item?.detail ||
                                  JSON.stringify(
                                    item
                                  )}
                            </p>
                          </div>
                        )
                      )}
                  </div>
                </div>
              )}

              <div className="report-technical-note no-print">
                <FileText size={16} />

                <p>
                  The report presents computed analysis
                  results. It does not treat heuristic
                  signals as proof that an article is
                  factually true or false.
                </p>
              </div>
            </section>
          </>
        ) : (
          <section className="report-list-card">
            <div className="report-list-header">
              <div>
                <p className="feature-kicker">
                  SAVED ANALYSES
                </p>

                <h2>
                  {analyses.length} available report
                  {analyses.length === 1
                    ? ""
                    : "s"}
                </h2>

                <p>
                  Select an analysis to create its
                  readable report.
                </p>
              </div>
            </div>

            {analyses.length ===
            0 ? (
              <div className="history-empty">
                <div className="history-empty-icon">
                  <FileText
                    size={25}
                  />
                </div>

                <h3>
                  No reports yet
                </h3>

                <p>
                  Complete an article
                  analysis first.
                </p>

                <button
                  type="button"
                  className="primary-analysis-button no-print"
                  onClick={() =>
                    navigate(
                      "/analyze"
                    )
                  }
                >
                  <Search size={17} />
                  Go to Analyze Article
                  <ChevronRight
                    size={17}
                  />
                </button>
              </div>
            ) : (
              <div className="report-list">
                {analyses.map(
                  (analysisItem) => (
                    <button
                      type="button"
                      className="report-list-row"
                      key={
                        analysisItem.id
                      }
                      onClick={() =>
                        openReport(
                          analysisItem.id
                        )
                      }
                      disabled={
                        detailLoading
                      }
                    >
                      <div className="report-row-icon">
                        <FileText
                          size={17}
                        />
                      </div>

                      <div className="report-row-main">
                        <strong>
                          {
                            analysisItem.title
                          }
                        </strong>

                        <span>
                          {
                            analysisItem.source_type
                          }
                          {" · "}
                          {formatDate(
                            analysisItem.created_at
                          )}
                          {" · "}
                          {
                            analysisItem.word_count
                          }{" "}
                          words
                        </span>
                      </div>

                      <div className="report-row-stats">
                        <span>
                          {
                            analysisItem.total_findings
                          }{" "}
                          findings
                        </span>

                        <span>
                          {
                            analysisItem.total_strengths
                          }{" "}
                          strengths
                        </span>
                      </div>

                      <ChevronRight
                        size={17}
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </section>
        )}

        {detailLoading && (
          <div className="report-detail-loading no-print">
            <LoaderCircle
              size={20}
              className="spin"
            />
            Loading report...
          </div>
        )}
      </main>
    </div>
  );
}

export default ReportPage;
