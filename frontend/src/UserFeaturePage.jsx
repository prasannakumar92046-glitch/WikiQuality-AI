import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  FileText,
  History,
  Home,
  LoaderCircle,
  LogOut,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

import "./UserFeaturePage.css";

const API_BASE_URL = "http://127.0.0.1:8000";

const PAGES = {
  analyze: {
    title: "Analyze Article",
    subtitle:
      "Run the complete WikiQuality AI analysis pipeline on article content.",
    icon: Search,
    label: "Article Analysis",
  },
  history: {
    title: "Analysis History",
    subtitle: "View your previous article analysis results.",
    icon: History,
    label: "Analysis History",
  },
  compare: {
    title: "Compare Articles",
    subtitle:
      "Compare two Wikipedia articles across quality and knowledge metrics.",
    icon: BarChart3,
    label: "Article Comparison",
  },
  graph: {
    title: "Knowledge Graph",
    subtitle:
      "Explore relationships between entities, topics and articles.",
    icon: Network,
    label: "Knowledge Graph",
  },
  reports: {
    title: "Reports",
    subtitle: "View and generate detailed WikiQuality AI reports.",
    icon: FileText,
    label: "Analysis Reports",
  },
};

const ANALYSIS_STEPS = [
  ["structure_analysis", "Structure"],
  ["nlp_analysis", "NLP"],
  ["semantic_analysis", "Semantic"],
  ["information_analysis", "Information"],
  ["entity_analysis", "Entities"],
  ["topic_coverage_analysis", "Topic coverage"],
  ["citation_analysis", "Citations"],
  ["quality_analysis", "Quality features"],
  ["ai_explanation", "AI explanation"],
  ["evidence", "Evidence"],
];

function readStoredUser() {
  try {
    const stored = localStorage.getItem("wikiquality_user");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Unable to read saved user data:", error);
    return null;
  }
}

async function postJson(path, text) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
        (typeof data.detail === "string" ? data.detail : "") ||
        `Request failed: ${path}`
    );
  }

  return data;
}

async function getJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
        (typeof data.detail === "string" ? data.detail : "") ||
        `Request failed: ${path}`
    );
  }

  return data;
}

function valueOrDash(value) {
  return value === null || value === undefined || value === ""
    ? "—"
    : value;
}

function formatPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "—";
  }

  const normalized = number <= 1 ? number * 100 : number;
  return `${normalized.toFixed(1)}%`;
}

function formatRatio(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "—";
  }
  return number.toFixed(3);
}

function itemText(item) {
  if (typeof item === "string") {
    return item;
  }

  if (!item || typeof item !== "object") {
    return String(item ?? "");
  }

  return (
    item.message ||
    item.description ||
    item.detail ||
    item.title ||
    JSON.stringify(item)
  );
}

function normalizeWikipediaArticle(data) {
  const article =
    data?.article ||
    data?.data ||
    data?.result ||
    data;

  const text =
    article?.text ||
    article?.content ||
    article?.extract ||
    article?.wikitext ||
    data?.text ||
    "";

  const title =
    article?.title ||
    data?.title ||
    "";

  const sourceUrl =
    article?.source_url ||
    article?.url ||
    data?.source_url ||
    "";

  return {
    title,
    text,
    sourceUrl,
    articleId: article?.article_id || article?.pageid || "",
    revisionId: article?.revision_id || "",
    timestamp: article?.timestamp || "",
  };
}

function StatCard({ label, value }) {
  return (
    <div className="analysis-stat-card">
      <span>{label}</span>
      <strong>{valueOrDash(value)}</strong>
    </div>
  );
}

function DetailCard({ icon: Icon, title, subtitle, children }) {
  return (
    <article className="detail-analysis-card">
      <div className="detail-card-heading">
        <div className="detail-card-icon">
          <Icon size={17} />
        </div>

        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>

      {children}
    </article>
  );
}

function MetricGrid({ items }) {
  return (
    <div className="metric-grid">
      {items.map(([label, value], index) => (
        <div className="metric-item" key={`${label}-${index}`}>
          <span>{label}</span>
          <strong>{valueOrDash(value)}</strong>
        </div>
      ))}
    </div>
  );
}

function ListPanel({ title, icon: Icon, items, tone = "neutral" }) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <section className={`analysis-list-panel ${tone}`}>
      <div className="list-panel-heading">
        <Icon size={17} />
        <h3>{title}</h3>
      </div>

      <div className="analysis-list">
        {items.map((item, index) => (
          <div className="analysis-list-item" key={`${title}-${index}`}>
            <span className="list-index">{index + 1}</span>
            <p>{itemText(item)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


async function authenticatedRequest(path, options = {}) {
  const token = localStorage.getItem("wikiquality_token");

  if (!token) {
    throw new Error("Your login session is missing. Please log in again.");
  }

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
    "X-Auth-Token": token,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
        (typeof data.detail === "string" ? data.detail : "") ||
        "History request failed."
    );
  }

  return data;
}

async function saveHistoryRecord(record) {
  return authenticatedRequest("/api/history", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

function AnalysisResults({ result }) {
  const quality = result?.quality_analysis || {};
  const summary = quality?.summary || {};
  const structure = result?.structure_analysis || {};
  const structureStats = structure?.statistics || {};
  const nlp = result?.nlp_analysis || {};
  const semantic = result?.semantic_analysis || {};
  const information = result?.information_analysis || {};
  const entities = result?.entity_analysis || {};
  const topics = result?.topic_coverage_analysis || {};
  const citations = result?.citation_analysis || {};
  const explanation = result?.ai_explanation || {};
  const evidence = Array.isArray(result?.evidence) ? result.evidence : [];

  const strengths = Array.isArray(quality?.strengths)
    ? quality.strengths
    : [];

  const findings = Array.isArray(quality?.findings) ? quality.findings : [];

  const explanationStrengths = Array.isArray(explanation?.strengths)
    ? explanation.strengths
    : [];

  const explanationConcerns = Array.isArray(explanation?.concerns)
    ? explanation.concerns
    : [];

  const improvementSuggestions = Array.isArray(
    explanation?.improvement_suggestions
  )
    ? explanation.improvement_suggestions
    : [];

  const displayedStrengths =
    strengths.length > 0 ? strengths : explanationStrengths;

  return (
    <section className="analysis-results">
      <div className="analysis-results-header">
        <div>
          <p className="feature-eyebrow">ANALYSIS RESULT</p>
          <h2>WikiQuality AI Report</h2>
          <p>
            Measurements from the current analysis pipeline are shown below.
          </p>
        </div>

        <div className="analysis-complete-badge">
          <CheckCircle2 size={16} />
          Analysis completed
        </div>
      </div>

      <div className="analysis-summary-grid">
        <StatCard
          label="Total findings"
          value={summary.total_findings ?? findings.length}
        />
        <StatCard
          label="High findings"
          value={summary.high_findings ?? 0}
        />
        <StatCard
          label="Medium findings"
          value={summary.medium_findings ?? 0}
        />
        <StatCard
          label="Strengths"
          value={summary.total_strengths ?? displayedStrengths.length}
        />
      </div>

      <div className="detailed-analysis-grid">
        <DetailCard
          icon={FileText}
          title="Structure"
          subtitle="Article organization and section measurements"
        >
          <MetricGrid
            items={[
              ["Words", structureStats.word_count],
              ["Sentences", structureStats.sentence_count],
              ["Paragraphs", structureStats.paragraph_count],
              ["Sections", structureStats.section_count],
              [
                "Largest section",
                structureStats.largest_section_word_count,
              ],
              [
                "Shortest section",
                structureStats.smallest_section_word_count,
              ],
              ["Short sections", structureStats.short_section_count],
            ]}
          />

          {Array.isArray(structure?.sections) &&
            structure.sections.length > 0 && (
              <div className="section-preview-list">
                {structure.sections.slice(0, 8).map((section, index) => (
                  <div className="section-preview-row" key={index}>
                    <strong>{section.title || "Section"}</strong>
                    <span>
                      {valueOrDash(section.word_count)} words ·{" "}
                      {valueOrDash(section.sentence_count)} sentences
                    </span>
                  </div>
                ))}
              </div>
            )}
        </DetailCard>

        <DetailCard
          icon={Brain}
          title="NLP"
          subtitle="Vocabulary, repetition and sentence metrics"
        >
          <MetricGrid
            items={[
              ["Words", nlp.word_count],
              ["Unique words", nlp.unique_word_count],
              ["Content words", nlp.content_word_count],
              ["Vocabulary diversity", formatRatio(nlp.vocabulary_diversity)],
              ["Repetition ratio", formatRatio(nlp.repetition_ratio)],
              ["Content-word ratio", formatRatio(nlp.content_word_ratio)],
              ["Avg. sentence length", nlp.average_sentence_length],
            ]}
          />

          {Array.isArray(nlp?.frequent_content_words) &&
            nlp.frequent_content_words.length > 0 && (
              <div className="mini-data-block">
                <span>Repeated content words</span>
                <p>
                  {nlp.frequent_content_words
                    .slice(0, 8)
                    .map((entry) => `${entry.word} (${entry.count})`)
                    .join(" · ")}
                </p>
              </div>
            )}
        </DetailCard>

        <DetailCard
          icon={Network}
          title="Semantic analysis"
          subtitle="Sentence-level similarity and redundancy"
        >
          <MetricGrid
            items={[
              ["Sentences", semantic.sentence_count],
              ["Avg. similarity", formatRatio(semantic.average_similarity)],
              [
                "High-similarity pairs",
                semantic.high_similarity_pairs?.length ?? 0,
              ],
              [
                "Redundancy ratio",
                formatRatio(semantic.semantic_redundancy_ratio),
              ],
            ]}
          />
        </DetailCard>

        <DetailCard
          icon={Sparkles}
          title="Information diversity"
          subtitle="Topic and information-dimension coverage"
        >
          <MetricGrid
            items={[
              ["Words", information.word_count],
              ["Unique words", information.unique_word_count],
              ["Topics detected", information.topic_count],
              ["Topic diversity", formatRatio(information.topic_diversity)],
              [
                "Dimensions",
                information.information_dimension_count,
              ],
              [
                "Information diversity",
                formatRatio(information.information_diversity),
              ],
            ]}
          />

          {Array.isArray(information?.detected_topics) &&
            information.detected_topics.length > 0 && (
              <div className="tag-list">
                {information.detected_topics.map((topic) => (
                  <span className="metric-tag" key={topic}>
                    {topic}
                  </span>
                ))}
              </div>
            )}
        </DetailCard>

        <DetailCard
          icon={Network}
          title="Entities"
          subtitle="Named entities detected by the NLP model"
        >
          <MetricGrid
            items={[
              ["Entity mentions", entities.total_entity_mentions],
              ["Unique entities", entities.unique_entity_count],
              ["Entity types", entities.entity_type_count],
              ["Entity diversity", formatRatio(entities.entity_diversity)],
            ]}
          />

          {Array.isArray(entities?.unique_entities) &&
            entities.unique_entities.length > 0 && (
              <div className="entity-chip-list">
                {entities.unique_entities.slice(0, 15).map((entity, index) => {
                  const label =
                    typeof entity === "string"
                      ? entity
                      : entity.text || entity.entity || itemText(entity);

                  return (
                    <span className="entity-chip" key={`${label}-${index}`}>
                      {label}
                    </span>
                  );
                })}
              </div>
            )}
        </DetailCard>

        <DetailCard
          icon={BarChart3}
          title="Topic coverage"
          subtitle="Coverage against the current heuristic topic set"
        >
          <MetricGrid
            items={[
              ["Covered topics", topics.covered_topic_count],
              ["Possible topics", topics.total_possible_topics],
              ["Coverage", formatPercent(topics.topic_coverage_ratio)],
              ["Topic diversity", formatRatio(topics.topic_diversity)],
              ["Coverage level", topics.coverage_level],
            ]}
          />

          {Array.isArray(topics?.detected_topics) &&
            topics.detected_topics.length > 0 && (
              <div className="tag-list">
                {topics.detected_topics.map((topic) => (
                  <span className="metric-tag" key={topic}>
                    {topic}
                  </span>
                ))}
              </div>
            )}
        </DetailCard>

        <DetailCard
          icon={ShieldCheck}
          title="Citation & evidence"
          subtitle="Evidence signals detected in the submitted text"
        >
          <MetricGrid
            items={[
              ["Citation markers", citations.citation_marker_count],
              ["Citation needed", citations.citation_needed_count],
              ["URLs", citations.url_count],
              ["Evidence signals", citations.evidence_signal_count],
              ["Citation density", formatRatio(citations.citation_density)],
            ]}
          />
        </DetailCard>
      </div>

      <div className="analysis-two-column">
        <ListPanel
          title="Detected strengths"
          icon={CheckCircle2}
          items={displayedStrengths.slice(0, 8)}
          tone="positive"
        />

        <ListPanel
          title="Findings requiring review"
          icon={AlertCircle}
          items={findings.slice(0, 8)}
          tone="finding"
        />
      </div>

      {Object.keys(explanation).length > 0 && (
        <section className="ai-explanation-panel">
          <div className="list-panel-heading">
            <Sparkles size={18} />
            <div>
              <h3>AI Explanation</h3>
              <p>Evidence-grounded interpretation from the analysis engine.</p>
            </div>
          </div>

          {explanation.headline && (
            <h4 className="ai-headline">{explanation.headline}</h4>
          )}

          {explanation.summary && (
            <p className="ai-summary">{explanation.summary}</p>
          )}

          <div className="ai-columns">
            <ListPanel
              title="Concerns"
              icon={AlertCircle}
              items={explanationConcerns}
              tone="finding"
            />

            <ListPanel
              title="Improvement suggestions"
              icon={CheckCircle2}
              items={improvementSuggestions}
              tone="positive"
            />
          </div>
        </section>
      )}

      {evidence.length > 0 && (
        <section className="evidence-panel">
          <div className="list-panel-heading">
            <ShieldCheck size={18} />
            <div>
              <h3>Analysis Evidence</h3>
              <p>Measurements supporting the current result.</p>
            </div>
          </div>

          <div className="evidence-grid">
            {evidence.slice(0, 12).map((item, index) => (
              <div className="evidence-item" key={index}>
                <CheckCircle2 size={15} />
                <div>
                  <strong>
                    {item?.title ||
                      item?.metric ||
                      item?.category ||
                      "Evidence"}
                  </strong>
                  <p>{itemText(item)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}


function HistoryPage({ user }) {
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams(window.location.search);
      const selectedId = params.get("id");

      if (selectedId) {
        const data = await authenticatedRequest(
          `/api/history/${encodeURIComponent(selectedId)}`
        );
        setSelectedAnalysis(data.analysis || null);
      } else {
        const data = await authenticatedRequest("/api/history?limit=50");
        setAnalyses(Array.isArray(data.analyses) ? data.analyses : []);
      }
    } catch (historyError) {
      console.error("History load error:", historyError);
      setError(historyError.message || "Unable to load analysis history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const navigate = (path) => {
    window.location.href = path;
  };

  const logout = () => {
    localStorage.removeItem("wikiquality_token");
    localStorage.removeItem("wikiquality_user");
    window.location.href = "/";
  };

  const openAnalysis = (id) => {
    window.location.href = `/history?id=${encodeURIComponent(id)}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "Unknown date";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const detailResult = selectedAnalysis?.analysis_result || null;

  return (
    <div className="feature-page">
      <aside className="feature-sidebar">
        <div className="feature-brand">
          <div className="feature-brand-icon">
            <Brain size={22} />
          </div>

          <div className="feature-brand-copy">
            <strong>
              WikiQuality <span>AI</span>
            </strong>
            <small>Knowledge Quality Platform</small>
          </div>
        </div>

        <nav className="feature-nav" aria-label="User navigation">
          <button type="button" className="feature-nav-item" onClick={() => navigate("/dashboard")}>
            <Home size={18} />
            <span>Dashboard</span>
          </button>

          <button type="button" className="feature-nav-item" onClick={() => navigate("/analyze")}>
            <Search size={18} />
            <span>Analyze Article</span>
          </button>

          <button type="button" className="feature-nav-item active" onClick={() => navigate("/history")}>
            <History size={18} />
            <span>Analysis History</span>
          </button>

          <button type="button" className="feature-nav-item" onClick={() => navigate("/compare")}>
            <BarChart3 size={18} />
            <span>Compare Articles</span>
          </button>

          <button type="button" className="feature-nav-item" onClick={() => navigate("/knowledge-graph")}>
            <Network size={18} />
            <span>Knowledge Graph</span>
          </button>

          <button type="button" className="feature-nav-item" onClick={() => navigate("/reports")}>
            <FileText size={18} />
            <span>Reports</span>
          </button>
        </nav>

        <div className="feature-sidebar-bottom">
          <div className="feature-user">
            <div className="feature-user-avatar">
              {(user?.name || "User").charAt(0).toUpperCase()}
            </div>

            <div className="feature-user-copy">
              <strong>{user?.name || "User"}</strong>
              <span>User</span>
            </div>
          </div>

          <button type="button" className="feature-logout" onClick={logout}>
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="feature-main">
        <header className="feature-header">
          <div>
            <p className="feature-eyebrow">USER DASHBOARD</p>
            <h1>Analysis History</h1>
            <p>Review and reopen your previously completed WikiQuality AI analyses.</p>
          </div>

          <button
            type="button"
            className="secondary-action-button history-new-button"
            onClick={() => navigate("/analyze")}
          >
            <Search size={16} />
            New analysis
          </button>
        </header>

        {error && (
          <div className="analysis-error history-error">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <section className="history-loading-card">
            <LoaderCircle size={28} className="spin" />
            <h2>Loading analysis history...</h2>
            <p>Retrieving your saved analyses from the backend database.</p>
          </section>
        ) : selectedAnalysis ? (
          <>
            <div className="history-detail-toolbar">
              <button type="button" className="history-back-button" onClick={() => navigate("/history")}>
                ← Back to history
              </button>

              <span>{formatDate(selectedAnalysis.created_at)}</span>
            </div>

            <section className="history-detail-card">
              <div>
                <p className="feature-kicker">SAVED ANALYSIS</p>
                <h2>{selectedAnalysis.title}</h2>
                <p>
                  Source: <strong>{selectedAnalysis.source_type}</strong>
                  {selectedAnalysis.source_url ? ` · ${selectedAnalysis.source_url}` : ""}
                </p>
              </div>

              <div className="analysis-summary-grid history-summary-grid">
                <StatCard label="Words" value={(selectedAnalysis.summary && detailResult?.nlp_analysis?.word_count) || selectedAnalysis.article_text?.trim().split(/\s+/).length || 0} />
                <StatCard label="Findings" value={selectedAnalysis.summary?.total_findings ?? 0} />
                <StatCard label="High" value={selectedAnalysis.summary?.high_findings ?? 0} />
                <StatCard label="Strengths" value={selectedAnalysis.summary?.total_strengths ?? 0} />
              </div>
            </section>

            {detailResult ? (
              <AnalysisResults result={detailResult} />
            ) : (
              <div className="analysis-error">
                <AlertCircle size={17} />
                <span>This history record does not contain a readable analysis result.</span>
              </div>
            )}
          </>
        ) : (
          <section className="history-list-card">
            <div className="history-list-header">
              <div>
                <p className="feature-kicker">SAVED ANALYSES</p>
                <h2>{analyses.length} saved {analyses.length === 1 ? "analysis" : "analyses"}</h2>
                <p>Your analysis records are stored per signed-in user.</p>
              </div>
            </div>

            {analyses.length === 0 ? (
              <div className="history-empty">
                <div className="history-empty-icon">
                  <History size={25} />
                </div>
                <h3>No analysis history yet</h3>
                <p>Run an article analysis and it will appear here automatically.</p>
                <button type="button" className="primary-analysis-button" onClick={() => navigate("/analyze")}>
                  <Sparkles size={17} />
                  Analyze your first article
                  <ChevronRight size={17} />
                </button>
              </div>
            ) : (
              <div className="history-table">
                <div className="history-table-head">
                  <span>Article</span>
                  <span>Source</span>
                  <span>Date</span>
                  <span>Words</span>
                  <span>Findings</span>
                  <span></span>
                </div>

                {analyses.map((analysis) => (
                  <button
                    type="button"
                    className="history-table-row"
                    key={analysis.id}
                    onClick={() => openAnalysis(analysis.id)}
                  >
                    <span className="history-article-title">
                      <strong>{analysis.title}</strong>
                      <small>ID #{analysis.id}</small>
                    </span>
                    <span>{analysis.source_type}</span>
                    <span>{formatDate(analysis.created_at)}</span>
                    <span>{analysis.word_count}</span>
                    <span>
                      {analysis.total_findings}
                      {analysis.high_findings > 0 ? ` · ${analysis.high_findings} high` : ""}
                    </span>
                    <span className="history-open-icon">
                      <ChevronRight size={17} />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function UserFeaturePage({ type }) {
  const page = PAGES[type] || PAGES.analyze;
  const Icon = page.icon;
  const user = useMemo(() => readStoredUser(), []);

  const [sourceMode, setSourceMode] = useState("text");
  const [articleText, setArticleText] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [sourceInfo, setSourceInfo] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisErrors, setAnalysisErrors] = useState([]);
  const [activeSteps, setActiveSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingWikipedia, setLoadingWikipedia] = useState(false);
  const [historySaved, setHistorySaved] = useState(false);
  const [historySaveError, setHistorySaveError] = useState("");
  const [error, setError] = useState("");

  if (type === "history") {
    return <HistoryPage user={user} />;
  }

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    localStorage.removeItem("wikiquality_token");
    localStorage.removeItem("wikiquality_user");
    window.location.href = "/";
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setAnalysisErrors([]);
    setActiveSteps([]);
    setHistorySaved(false);
    setHistorySaveError("");
    setError("");
  };

  const handleTextFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".txt")) {
      setError("Please choose a .txt file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setArticleText(String(reader.result || ""));
      setArticleTitle(file.name.replace(/\.txt$/i, ""));
      setSourceInfo({
        type: "TXT file",
        title: file.name,
      });
      resetAnalysis();
    };

    reader.onerror = () => {
      setError("Unable to read the selected TXT file.");
    };

    reader.readAsText(file);
  };

  const handleWikipediaFetch = async (event) => {
    event.preventDefault();

    if (!articleTitle.trim()) {
      setError("Enter a Wikipedia article title first.");
      return;
    }

    setError("");
    setSourceInfo(null);
    setAnalysisResult(null);
    setAnalysisErrors([]);
    setLoadingWikipedia(true);

    try {
      const query = encodeURIComponent(articleTitle.trim());

      const data = await getJson(`/api/wikipedia/article?title=${query}`);
      const article = normalizeWikipediaArticle(data);

      if (!article.text.trim()) {
        throw new Error(
          "Wikipedia article was retrieved, but no analyzable text was returned."
        );
      }

      setArticleText(article.text);
      setSourceInfo({
        type: "Wikipedia",
        title: article.title || articleTitle.trim(),
        sourceUrl: article.sourceUrl,
        articleId: article.articleId,
        revisionId: article.revisionId,
        timestamp: article.timestamp,
      });
    } catch (fetchError) {
      console.error("Wikipedia fetch error:", fetchError);
      setError(fetchError.message || "Unable to retrieve the Wikipedia article.");
    } finally {
      setLoadingWikipedia(false);
    }
  };

  const runAnalysis = async (event) => {
    event.preventDefault();

    const text = articleText.trim();

    if (!text) {
      setError("Enter article text or load a source before analysis.");
      return;
    }

    setError("");
    setAnalysisResult(null);
    setAnalysisErrors([]);
    setActiveSteps([]);
    setLoading(true);

    const collected = {};

    const requests = [
      ["structure_analysis", "/api/analyze/structure"],
      ["nlp_analysis", "/api/analyze/nlp"],
      ["semantic_analysis", "/api/analyze/semantic"],
      ["information_analysis", "/api/analyze/information"],
      ["entity_analysis", "/api/analyze/entities"],
      ["topic_coverage_analysis", "/api/analyze/topic-coverage"],
      ["citation_analysis", "/api/analyze/citations"],
      ["quality_analysis", "/api/analyze/quality-features"],
      ["ai_explanation", "/api/analyze/explanation"],
    ];

    const safeRun = async (key, path) => {
      try {
        const data = await postJson(path, text);

        if (key === "structure_analysis") {
          collected.structure_analysis = data;
        } else if (key === "nlp_analysis") {
          collected.nlp_analysis = data.nlp_analysis || data;
        } else if (key === "semantic_analysis") {
          collected.semantic_analysis = data.semantic_analysis || data;
        } else if (key === "information_analysis") {
          collected.information_analysis =
            data.information_analysis || data;
        } else if (key === "entity_analysis") {
          collected.entity_analysis = data.entity_analysis || data;
        } else if (key === "topic_coverage_analysis") {
          collected.topic_coverage_analysis =
            data.topic_coverage_analysis || data;
        } else if (key === "citation_analysis") {
          collected.citation_analysis = data.citation_analysis || data;
        } else if (key === "quality_analysis") {
          collected.quality_analysis = data.quality_analysis || data;
        } else if (key === "ai_explanation") {
          collected.ai_explanation =
            data.ai_explanation?.explanation || data.ai_explanation || {};
          collected.evidence = Array.isArray(data.evidence)
            ? data.evidence
            : [];
        }

        setActiveSteps((current) => [...current, key]);
      } catch (requestError) {
        console.error(`${key} failed:`, requestError);

        setAnalysisErrors((current) => [
          ...current,
          {
            key,
            message: requestError.message || "Analysis step failed.",
          },
        ]);
      }
    };

    await Promise.all(
      requests.map(([key, path]) => safeRun(key, path))
    );

    const successfulSteps = Object.keys(collected);

    if (
      successfulSteps.length === 0 ||
      !collected.quality_analysis
    ) {
      setError(
        "The analysis pipeline could not produce a quality result. Check the backend terminal for the failing endpoint."
      );
    }

    const finalResult = {
      ...collected,
      source_type: sourceInfo?.type || "pasted_text",
      source_info: sourceInfo,
    };

    setAnalysisResult(finalResult);

    try {
      const historyResponse = await saveHistoryRecord({
        title:
          sourceInfo?.title ||
          articleTitle.trim() ||
          "Pasted article",
        source_type: sourceInfo?.type || "pasted_text",
        source_url: sourceInfo?.sourceUrl || "",
        article_text: text,
        analysis_result: finalResult,
      });

      if (historyResponse?.success) {
        setHistorySaved(true);
        setHistorySaveError("");
      }
    } catch (historyError) {
      console.error("Could not save analysis history:", historyError);
      setHistorySaved(false);
      setHistorySaveError(
        historyError.message ||
          "The analysis completed, but it could not be saved to history."
      );
    }

    setLoading(false);
  };

  if (type !== "analyze" && type !== "history") {
    return (
      <div className="feature-page">
        <aside className="feature-sidebar">
          <div className="feature-brand">
            <div className="feature-brand-icon">
              <Brain size={22} />
            </div>

            <div className="feature-brand-copy">
              <strong>
                WikiQuality <span>AI</span>
              </strong>
              <small>Knowledge Quality Platform</small>
            </div>
          </div>

          <nav className="feature-nav" aria-label="User navigation">
            <button
              type="button"
              className="feature-nav-item"
              onClick={() => handleNavigation("/dashboard")}
            >
              <Home size={18} />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className="feature-nav-item"
              onClick={() => handleNavigation("/analyze")}
            >
              <Search size={18} />
              <span>Analyze Article</span>
            </button>

            <button
              type="button"
              className={`feature-nav-item ${type === "history" ? "active" : ""}`}
              onClick={() => handleNavigation("/history")}
            >
              <History size={18} />
              <span>Analysis History</span>
            </button>

            <button
              type="button"
              className={`feature-nav-item ${type === "compare" ? "active" : ""}`}
              onClick={() => handleNavigation("/compare")}
            >
              <BarChart3 size={18} />
              <span>Compare Articles</span>
            </button>

            <button
              type="button"
              className={`feature-nav-item ${type === "graph" ? "active" : ""}`}
              onClick={() => handleNavigation("/knowledge-graph")}
            >
              <Network size={18} />
              <span>Knowledge Graph</span>
            </button>

            <button
              type="button"
              className={`feature-nav-item ${type === "reports" ? "active" : ""}`}
              onClick={() => handleNavigation("/reports")}
            >
              <FileText size={18} />
              <span>Reports</span>
            </button>
          </nav>

          <div className="feature-sidebar-bottom">
            <div className="feature-user">
              <div className="feature-user-avatar">
                {(user?.name || "User").charAt(0).toUpperCase()}
              </div>

              <div className="feature-user-copy">
                <strong>{user?.name || "User"}</strong>
                <span>{user?.role === "admin" ? "Admin" : "User"}</span>
              </div>
            </div>

            <button
              type="button"
              className="feature-logout"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="feature-main">
          <header className="feature-header">
            <div>
              <p className="feature-eyebrow">USER DASHBOARD</p>
              <h1>{page.title}</h1>
              <p>{page.subtitle}</p>
            </div>

            <div className="feature-api-status">
              <span className="feature-status-dot" />
              Backend connected
            </div>
          </header>

          <section className="feature-hero-card">
            <div className="feature-icon-large">
              <Icon size={31} />
            </div>

            <div>
              <span className="feature-kicker">WIKIQUALITY AI</span>
              <h2>{page.label}</h2>
              <p>
                This module is routed correctly. The next implementation
                stages can connect its data workflow to the existing backend.
              </p>
            </div>
          </section>

          <section className="feature-info-grid">
            <article className="feature-info-card">
              <span className="feature-card-number">01</span>
              <div>
                <h3>Navigation connected</h3>
                <p>
                  All user destinations use the same protected application
                  layout.
                </p>
              </div>
            </article>

            <article className="feature-info-card">
              <span className="feature-card-number">02</span>
              <div>
                <h3>Session protected</h3>
                <p>
                  The current signed-in user is displayed without assuming
                  storage data is always valid.
                </p>
              </div>
            </article>

            <article className="feature-info-card">
              <span className="feature-card-number">03</span>
              <div>
                <h3>Ready for the next layer</h3>
                <p>
                  The analysis module now provides the real working pattern
                  for future user features.
                </p>
              </div>
            </article>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="feature-page">
      <aside className="feature-sidebar">
        <div className="feature-brand">
          <div className="feature-brand-icon">
            <Brain size={22} />
          </div>

          <div className="feature-brand-copy">
            <strong>
              WikiQuality <span>AI</span>
            </strong>
            <small>Knowledge Quality Platform</small>
          </div>
        </div>

        <nav className="feature-nav" aria-label="User navigation">
          <button
            type="button"
            className="feature-nav-item"
            onClick={() => handleNavigation("/dashboard")}
          >
            <Home size={18} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className="feature-nav-item active"
            onClick={() => handleNavigation("/analyze")}
          >
            <Search size={18} />
            <span>Analyze Article</span>
          </button>

          <button
            type="button"
            className="feature-nav-item"
            onClick={() => handleNavigation("/history")}
          >
            <History size={18} />
            <span>Analysis History</span>
          </button>

          <button
            type="button"
            className="feature-nav-item"
            onClick={() => handleNavigation("/compare")}
          >
            <BarChart3 size={18} />
            <span>Compare Articles</span>
          </button>

          <button
            type="button"
            className="feature-nav-item"
            onClick={() => handleNavigation("/knowledge-graph")}
          >
            <Network size={18} />
            <span>Knowledge Graph</span>
          </button>

          <button
            type="button"
            className="feature-nav-item"
            onClick={() => handleNavigation("/reports")}
          >
            <FileText size={18} />
            <span>Reports</span>
          </button>
        </nav>

        <div className="feature-sidebar-bottom">
          <div className="feature-user">
            <div className="feature-user-avatar">
              {(user?.name || "User").charAt(0).toUpperCase()}
            </div>

            <div className="feature-user-copy">
              <strong>{user?.name || "User"}</strong>
              <span>User</span>
            </div>
          </div>

          <button
            type="button"
            className="feature-logout"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="feature-main">
        <header className="feature-header">
          <div>
            <p className="feature-eyebrow">USER DASHBOARD</p>
            <h1>Analyze Article</h1>
            <p>
              Run NLP, semantic, information, entity, topic, citation and
              quality analysis from one workspace.
            </p>
          </div>

          <div className="feature-api-status">
            <span className="feature-status-dot" />
            Live backend
          </div>
        </header>

        <section className="analyze-source-card">
          <div className="source-card-top">
            <div>
              <span className="feature-kicker">INPUT SOURCE</span>
              <h2>Choose article source</h2>
              <p>
                Use pasted text, a Wikipedia article, or a TXT file. All
                sources are normalized into the same analysis pipeline.
              </p>
            </div>

            {sourceInfo && (
              <div className="source-badge">
                <CheckCircle2 size={15} />
                {sourceInfo.type}
              </div>
            )}
          </div>

          <div className="source-tabs">
            <button
              type="button"
              className={`source-tab ${sourceMode === "text" ? "active" : ""}`}
              onClick={() => {
                setSourceMode("text");
                setError("");
              }}
              disabled={loading}
            >
              <FileText size={17} />
              Paste text
            </button>

            <button
              type="button"
              className={`source-tab ${
                sourceMode === "wikipedia" ? "active" : ""
              }`}
              onClick={() => {
                setSourceMode("wikipedia");
                setError("");
              }}
              disabled={loading}
            >
              <Search size={17} />
              Wikipedia
            </button>

            <button
              type="button"
              className={`source-tab ${sourceMode === "txt" ? "active" : ""}`}
              onClick={() => {
                setSourceMode("txt");
                setError("");
              }}
              disabled={loading}
            >
              <Upload size={17} />
              TXT file
            </button>
          </div>

          {sourceMode === "text" && (
            <div className="source-panel">
              <label htmlFor="article-text">Article content</label>

              <textarea
                id="article-text"
                value={articleText}
                onChange={(event) => {
                  setArticleText(event.target.value);
                  setSourceInfo(null);
                  resetAnalysis();
                }}
                placeholder={`Paste Wikipedia article text here...

Example:

Mangaluru is a city in Karnataka, India.

History
Mangaluru has a long and documented history.

Geography
The city is located on the western coast of India.`}
                rows={13}
                disabled={loading}
              />
            </div>
          )}

          {sourceMode === "wikipedia" && (
            <form className="source-panel" onSubmit={handleWikipediaFetch}>
              <label htmlFor="wikipedia-title">Wikipedia article title</label>

              <div className="inline-input">
                <Search size={18} />
                <input
                  id="wikipedia-title"
                  type="text"
                  value={articleTitle}
                  onChange={(event) => {
                    setArticleTitle(event.target.value);
                    setError("");
                  }}
                  placeholder="Example: Mangaluru"
                  disabled={loadingWikipedia || loading}
                />

                <button
                  type="submit"
                  className="secondary-action-button"
                  disabled={loadingWikipedia || loading}
                >
                  {loadingWikipedia ? (
                    <>
                      <LoaderCircle size={16} className="spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Fetch article
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>

              {sourceInfo?.type === "Wikipedia" && (
                <div className="source-meta-card">
                  <strong>{sourceInfo.title}</strong>
                  <span>
                    {sourceInfo.sourceUrl || "Wikipedia source retrieved"}
                  </span>
                  {sourceInfo.revisionId && (
                    <span>Revision: {sourceInfo.revisionId}</span>
                  )}
                </div>
              )}

              {articleText && (
                <textarea
                  className="loaded-preview"
                  value={articleText}
                  readOnly
                  rows={9}
                />
              )}
            </form>
          )}

          {sourceMode === "txt" && (
            <div className="source-panel">
              <label htmlFor="txt-file">TXT document</label>

              <div className="file-drop">
                <Upload size={26} />
                <strong>Choose a TXT file</strong>
                <p>Text is read locally and then sent to the analysis API.</p>

                <label className="file-picker-button" htmlFor="txt-file">
                  Select TXT file
                </label>

                <input
                  id="txt-file"
                  type="file"
                  accept=".txt,text/plain"
                  onChange={handleTextFile}
                  disabled={loading}
                  hidden
                />
              </div>

              {sourceInfo?.type === "TXT file" && (
                <div className="source-meta-card">
                  <strong>{sourceInfo.title}</strong>
                  <span>{articleText.length} characters loaded</span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="analysis-error">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          <div className="analyze-action-row">
            <div className="pipeline-hint">
              <ShieldCheck size={16} />
              <span>
                Full pipeline: structure • NLP • semantic • information •
                entities • topics • citations • quality • AI explanation
              </span>
            </div>

            <button
              type="button"
              className="primary-analysis-button"
              onClick={runAnalysis}
              disabled={loading || loadingWikipedia || !articleText.trim()}
            >
              {loading ? (
                <>
                  <LoaderCircle size={17} className="spin" />
                  Running analysis...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Run Full Analysis
                  <ChevronRight size={17} />
                </>
              )}
            </button>
          </div>
        </section>

        {loading && (
          <section className="analysis-progress-card">
            <div>
              <span className="feature-kicker">PROCESSING</span>
              <h2>Running WikiQuality AI</h2>
              <p>
                The frontend is calling the existing backend modules and
                collecting their measurements.
              </p>
            </div>

            <div className="progress-step-grid">
              {ANALYSIS_STEPS.map(([key, label]) => {
                const done = activeSteps.includes(key);
                const failed = analysisErrors.some(
                  (entry) => entry.key === key
                );

                return (
                  <div
                    className={`progress-step ${
                      done ? "done" : ""
                    } ${failed ? "failed" : ""}`}
                    key={key}
                  >
                    <span className="progress-step-dot">
                      {done ? <CheckCircle2 size={14} /> : null}
                    </span>
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {analysisResult && (
          <>
            {analysisErrors.length > 0 && (
              <div className="pipeline-warning">
                <AlertCircle size={17} />
                <div>
                  <strong>
                    {analysisErrors.length} analysis step
                    {analysisErrors.length === 1 ? "" : "s"} need review
                  </strong>
                  <p>
                    The page still displays every successful result. Failed
                    endpoint messages are listed for debugging.
                  </p>
                  <div className="failed-step-list">
                    {analysisErrors.map((entry) => (
                      <span key={entry.key}>
                        {entry.key.replaceAll("_", " ")}: {entry.message}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {historySaved && (
              <div className="history-saved-strip">
                <CheckCircle2 size={16} />
                <span>Analysis saved to your history.</span>
                <button type="button" onClick={() => handleNavigation("/history")}>
                  View history
                  <ChevronRight size={15} />
                </button>
              </div>
            )}

            {historySaveError && (
              <div className="analysis-error">
                <AlertCircle size={17} />
                <span>Analysis completed, but history could not be saved: {historySaveError}</span>
              </div>
            )}

            {sourceInfo && (
              <div className="result-source-strip">
                <span>
                  Source: <strong>{sourceInfo.type}</strong>
                </span>
                {sourceInfo.title && (
                  <span>
                    Article: <strong>{sourceInfo.title}</strong>
                  </span>
                )}
                {sourceInfo.sourceUrl && (
                  <a
                    href={sourceInfo.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open source
                  </a>
                )}
              </div>
            )}

            <AnalysisResults result={analysisResult} />
          </>
        )}
      </main>
    </div>
  );
}

export default UserFeaturePage;
