import { useState } from "react";
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
} from "lucide-react";

import "./UserFeaturePage.css";
import "./ComparePage.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function readStoredUser() {
  try {
    const stored = localStorage.getItem("wikiquality_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
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
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : "";

    throw new Error(
      data.message ||
        detail ||
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
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : "";

    throw new Error(
      data.message ||
        detail ||
        `Request failed: ${path}`
    );
  }

  return data;
}

function normalizeWikipediaArticle(data) {
  const article =
    data?.article ||
    data?.data ||
    data?.result ||
    data;

  return {
    title:
      article?.title ||
      data?.title ||
      "",
    text:
      article?.clean_text ||
      article?.text ||
      article?.content ||
      article?.extract ||
      article?.wikitext ||
      data?.text ||
      "",
    sourceUrl:
      article?.source_url ||
      article?.url ||
      data?.source_url ||
      "",
  };
}

function formatValue(value, digits = 3) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number.toFixed(digits)
    : "—";
}

function formatPercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  const percentage =
    number <= 1
      ? number * 100
      : number;

  return `${percentage.toFixed(1)}%`;
}

function formatDelta(valueA, valueB, digits = 3) {
  const a = Number(valueA);
  const b = Number(valueB);

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return "—";
  }

  const difference = b - a;

  if (Math.abs(difference) < 0.0005) {
    return "0";
  }

  return difference > 0
    ? `+${difference.toFixed(digits)}`
    : difference.toFixed(digits);
}

/*
 * Important:
 * The current backend /api/analyze/quality-features response keeps
 * individual numeric metrics inside:
 *
 *   information_analysis.metrics
 *   entity_analysis.metrics
 *   topic_coverage_analysis.metrics
 *   citation_analysis.metrics
 *
 * This accessor supports that structure and also tolerates an older
 * top-level response so the UI does not break if the backend changes.
 */
function getMetrics(result) {
  const structure =
    result?.structure_analysis?.statistics ||
    {};

  const nlp =
    result?.nlp_analysis?.metrics ||
    result?.nlp_analysis ||
    {};

  const semantic =
    result?.semantic_analysis?.metrics ||
    result?.semantic_analysis ||
    {};

  const information =
    result?.information_analysis?.metrics ||
    result?.information_analysis ||
    {};

  const entities =
    result?.entity_analysis?.metrics ||
    result?.entity_analysis ||
    {};

  const topics =
    result?.topic_coverage_analysis?.metrics ||
    result?.topic_coverage_analysis ||
    {};

  const citations =
    result?.citation_analysis?.metrics ||
    result?.citation_analysis ||
    {};

  const quality =
    result?.quality_analysis ||
    {};

  const summary =
    quality?.summary ||
    {};

  return {
    words:
      structure.word_count ??
      nlp.word_count ??
      0,

    sections:
      structure.section_count ??
      0,

    vocabulary:
      nlp.vocabulary_diversity,

    repetition:
      nlp.repetition_ratio,

    avgSentence:
      nlp.average_sentence_length,

    semanticRedundancy:
      semantic.semantic_redundancy_ratio,

    informationDiversity:
      information.information_diversity,

    entityDiversity:
      entities.entity_diversity,

    topicCoverage:
      topics.topic_coverage_ratio,

    citationDensity:
      citations.citation_density,

    findings:
      summary.total_findings ??
      quality?.findings?.length ??
      0,

    highFindings:
      summary.high_findings ??
      0,

    mediumFindings:
      summary.medium_findings ??
      0,

    strengths:
      summary.total_strengths ??
      quality?.strengths?.length ??
      0,
  };
}

const METRICS = [
  {
    key: "words",
    label: "Words",
    formatter: (value) => formatValue(value, 0),
    digits: 0,
  },
  {
    key: "sections",
    label: "Sections",
    formatter: (value) => formatValue(value, 0),
    digits: 0,
  },
  {
    key: "vocabulary",
    label: "Vocabulary diversity",
    formatter: (value) => formatValue(value, 3),
    digits: 3,
  },
  {
    key: "repetition",
    label: "Repetition ratio",
    formatter: (value) => formatValue(value, 3),
    digits: 3,
  },
  {
    key: "avgSentence",
    label: "Average sentence length",
    formatter: (value) => formatValue(value, 2),
    digits: 2,
  },
  {
    key: "semanticRedundancy",
    label: "Semantic redundancy",
    formatter: (value) => formatValue(value, 3),
    digits: 3,
  },
  {
    key: "informationDiversity",
    label: "Information diversity",
    formatter: (value) => formatValue(value, 3),
    digits: 3,
  },
  {
    key: "entityDiversity",
    label: "Entity diversity",
    formatter: (value) => formatValue(value, 3),
    digits: 3,
  },
  {
    key: "topicCoverage",
    label: "Topic coverage",
    formatter: (value) => formatPercent(value),
    digits: 3,
  },
  {
    key: "citationDensity",
    label: "Citation density",
    formatter: (value) => formatValue(value, 3),
    digits: 3,
  },
  {
    key: "findings",
    label: "Total findings",
    formatter: (value) => formatValue(value, 0),
    digits: 0,
  },
  {
    key: "highFindings",
    label: "High findings",
    formatter: (value) => formatValue(value, 0),
    digits: 0,
  },
  {
    key: "mediumFindings",
    label: "Medium findings",
    formatter: (value) => formatValue(value, 0),
    digits: 0,
  },
  {
    key: "strengths",
    label: "Strengths",
    formatter: (value) => formatValue(value, 0),
    digits: 0,
  },
];

function Sidebar({ user }) {
  const navigate = (path) => {
    window.location.href = path;
  };

  const logout = () => {
    localStorage.removeItem("wikiquality_token");
    localStorage.removeItem("wikiquality_user");
    window.location.href = "/";
  };

  return (
    <aside className="feature-sidebar">
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

      <nav
        className="feature-nav"
        aria-label="User navigation"
      >
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
          className="feature-nav-item active"
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
            navigate("/knowledge-graph")
          }
        >
          <Network size={18} />
          <span>Knowledge Graph</span>
        </button>

        <button
          type="button"
          className="feature-nav-item"
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
            {(user?.name || "User")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="feature-user-copy">
            <strong>
              {user?.name || "User"}
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
  );
}

function ArticlePanel({
  label,
  title,
  text,
  setTitle,
  setText,
  source,
  setSource,
  disabled,
  onFetchWikipedia,
  loadingWikipedia,
}) {
  const mode =
    source?.mode || "text";

  const wordCount =
    text
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .length;

  return (
    <section className="compare-article-card">
      <div className="compare-article-heading">
        <div className="compare-article-number">
          {label}
        </div>

        <div>
          <p className="feature-kicker">
            ARTICLE INPUT
          </p>

          <h2>
            {title || label}
          </h2>

          <p>
            Use pasted text or retrieve the
            article from Wikipedia.
          </p>
        </div>

        {source?.type && (
          <span className="compare-source-badge">
            <CheckCircle2 size={14} />
            {source.type}
          </span>
        )}
      </div>

      <div className="compare-source-tabs">
        <button
          type="button"
          className={`compare-source-tab ${
            mode === "wikipedia"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setSource({
              ...source,
              mode: "wikipedia",
            })
          }
          disabled={disabled}
        >
          <Search size={15} />
          Wikipedia
        </button>

        <button
          type="button"
          className={`compare-source-tab ${
            mode === "text"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setSource({
              ...source,
              mode: "text",
              type: "Pasted text",
            })
          }
          disabled={disabled}
        >
          <FileText size={15} />
          Paste text
        </button>
      </div>

      {mode === "wikipedia" ? (
        <div className="compare-wikipedia-box">
          <label>
            Wikipedia article title
          </label>

          <div className="compare-inline-input">
            <Search size={17} />

            <input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Example: Bengaluru"
              disabled={
                disabled ||
                loadingWikipedia
              }
            />

            <button
              type="button"
              className="secondary-action-button"
              onClick={onFetchWikipedia}
              disabled={
                disabled ||
                loadingWikipedia ||
                !title.trim()
              }
            >
              {loadingWikipedia ? (
                <>
                  <LoaderCircle
                    size={15}
                    className="spin"
                  />
                  Loading
                </>
              ) : (
                <>
                  Fetch
                  <ChevronRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="compare-text-box">
          <label
            htmlFor={`${label}-text`}
          >
            Article content
          </label>

          <textarea
            id={`${label}-text`}
            value={text}
            onChange={(event) => {
              setText(event.target.value);

              setSource((current) => ({
                ...(current || {}),
                mode: "text",
                type: "Pasted text",
              }));
            }}
            placeholder={`Paste ${label.toLowerCase()} article text here...`}
            rows={12}
            disabled={disabled}
          />
        </div>
      )}

      {source?.title &&
        mode === "wikipedia" && (
          <div className="compare-source-meta">
            <strong>
              {source.title}
            </strong>

            {source.sourceUrl && (
              <a
                href={source.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open Wikipedia source
              </a>
            )}
          </div>
        )}

      <div className="compare-article-footer">
        <span>
          {wordCount} words loaded
        </span>

        <span>
          Same WikiQuality AI pipeline
        </span>
      </div>
    </section>
  );
}

function ComparisonResults({
  articleA,
  articleB,
}) {
  const metricsA =
    getMetrics(articleA.result);

  const metricsB =
    getMetrics(articleB.result);

  return (
    <section className="compare-results-card">
      <div className="compare-results-heading">
        <div>
          <p className="feature-eyebrow">
            COMPARISON RESULT
          </p>

          <h2>
            Article comparison
          </h2>

          <p>
            Both articles were evaluated
            using the same
            quality-analysis pipeline.
          </p>
        </div>

        <div className="compare-complete-badge">
          <CheckCircle2 size={16} />
          Comparison completed
        </div>
      </div>

      <div className="compare-article-summary-grid">
        <div className="compare-summary-item">
          <span>Article A</span>
          <strong>
            {articleA.title}
          </strong>
          <small>
            {articleA.source?.type ||
              "Pasted text"}
          </small>
        </div>

        <div className="compare-summary-item">
          <span>Article B</span>
          <strong>
            {articleB.title}
          </strong>
          <small>
            {articleB.source?.type ||
              "Pasted text"}
          </small>
        </div>
      </div>

      <div className="compare-table">
        <div className="compare-table-head">
          <span>Metric</span>
          <span>Article A</span>
          <span>Article B</span>
          <span>Δ B − A</span>
        </div>

        {METRICS.map(
          ({
            key,
            label,
            formatter,
            digits,
          }) => {
            const valueA =
              metricsA[key];

            const valueB =
              metricsB[key];

            const numberA =
              Number(valueA);

            const numberB =
              Number(valueB);

            const difference =
              numberB - numberA;

            const validDelta =
              Number.isFinite(
                numberA
              ) &&
              Number.isFinite(
                numberB
              );

            return (
              <div
                className="compare-table-row"
                key={key}
              >
                <span>
                  {label}
                </span>

                <strong>
                  {formatter(valueA)}
                </strong>

                <strong>
                  {formatter(valueB)}
                </strong>

                <span
                  className={
                    validDelta &&
                    difference > 0
                      ? "delta-positive"
                      : validDelta &&
                        difference < 0
                      ? "delta-negative"
                      : ""
                  }
                >
                  {formatDelta(
                    valueA,
                    valueB,
                    digits
                  )}
                </span>
              </div>
            );
          }
        )}
      </div>

      <div className="compare-metric-status">
        <div>
          <CheckCircle2 size={16} />

          <span>
            Information, entity, topic and
            citation metrics are read from
            the backend response and support
            the nested <strong>metrics</strong>{" "}
            structure.
          </span>
        </div>
      </div>

      <div className="compare-insight-grid">
        <article>
          <BarChart3 size={18} />

          <div>
            <h3>
              What this comparison shows
            </h3>

            <p>
              Measurable differences in
              size, structure, vocabulary,
              redundancy, information
              diversity, entities, topic
              coverage, citations and
              quality findings.
            </p>
          </div>
        </article>

        <article>
          <ShieldCheck size={18} />

          <div>
            <h3>
              How to interpret it
            </h3>

            <p>
              A single metric is not an
              automatic quality verdict.
              Read the values together with
              the detailed findings and
              evidence.
            </p>
          </div>
        </article>
      </div>

      <div className="compare-result-links">
        <button
          type="button"
          onClick={() => {
            window.location.href =
              "/analyze";
          }}
        >
          <Sparkles size={15} />
          Analyze another article
          <ChevronRight size={15} />
        </button>
      </div>
    </section>
  );
}

function ComparePage() {
  const user = readStoredUser();

  const [articleA, setArticleA] =
    useState("");

  const [articleB, setArticleB] =
    useState("");

  const [titleA, setTitleA] =
    useState("");

  const [titleB, setTitleB] =
    useState("");

  const [sourceA, setSourceA] =
    useState({
      mode: "text",
      type: "Pasted text",
    });

  const [sourceB, setSourceB] =
    useState({
      mode: "text",
      type: "Pasted text",
    });

  const [loadingA, setLoadingA] =
    useState(false);

  const [loadingB, setLoadingB] =
    useState(false);

  const [comparing, setComparing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState(null);

  const fetchWikipedia = async (
    side
  ) => {
    const title =
      side === "A"
        ? titleA
        : titleB;

    const setLoading =
      side === "A"
        ? setLoadingA
        : setLoadingB;

    if (!title.trim()) {
      setError(
        `Enter a Wikipedia title for Article ${side}.`
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data =
        await getJson(
          `/api/wikipedia/article?title=${encodeURIComponent(
            title.trim()
          )}`
        );

      const article =
        normalizeWikipediaArticle(
          data
        );

      if (!article.text.trim()) {
        throw new Error(
          "Wikipedia returned no analyzable text."
        );
      }

      if (side === "A") {
        setArticleA(
          article.text
        );

        setTitleA(
          article.title ||
            title.trim()
        );

        setSourceA({
          mode: "wikipedia",
          type: "Wikipedia",
          title:
            article.title ||
            title.trim(),
          sourceUrl:
            article.sourceUrl,
        });
      } else {
        setArticleB(
          article.text
        );

        setTitleB(
          article.title ||
            title.trim()
        );

        setSourceB({
          mode: "wikipedia",
          type: "Wikipedia",
          title:
            article.title ||
            title.trim(),
          sourceUrl:
            article.sourceUrl,
        });
      }
    } catch (fetchError) {
      console.error(
        `Wikipedia fetch ${side} error:`,
        fetchError
      );

      setError(
        fetchError.message ||
          `Unable to retrieve Article ${side}.`
      );
    } finally {
      setLoading(false);
    }
  };

  const compareArticles = async (
    event
  ) => {
    event.preventDefault();

    if (
      !articleA.trim() ||
      !articleB.trim()
    ) {
      setError(
        "Both articles must contain text before comparison."
      );
      return;
    }

    setError("");
    setResult(null);
    setComparing(true);

    try {
      /*
       * IMPORTANT:
       * Do NOT call a separate helper here.
       *
       * The current backend /api/analyze/quality-features
       * already returns all individual analyses in one
       * response. Using the endpoint directly avoids the
       * previous undefined-helper error and avoids running
       * the same expensive NLP pipeline eight times.
       */
      const [dataA, dataB] =
        await Promise.all([
          postJson(
            "/api/analyze/quality-features",
            articleA.trim()
          ),

          postJson(
            "/api/analyze/quality-features",
            articleB.trim()
          ),
        ]);

      if (
        !dataA?.success ||
        !dataB?.success
      ) {
        throw new Error(
          "One or both article analyses did not complete successfully."
        );
      }

      setResult({
        articleA: {
          title:
            titleA.trim() ||
            "Article A",

          source: sourceA,

          result: dataA,
        },

        articleB: {
          title:
            titleB.trim() ||
            "Article B",

          source: sourceB,

          result: dataB,
        },
      });
    } catch (comparisonError) {
      console.error(
        "Comparison error:",
        comparisonError
      );

      setError(
        comparisonError.message ||
          "Unable to compare the articles. Check the backend terminal for the failing request."
      );
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="feature-page">
      <Sidebar user={user} />

      <main className="feature-main">
        <header className="feature-header">
          <div>
            <p className="feature-eyebrow">
              USER DASHBOARD
            </p>

            <h1>
              Compare Articles
            </h1>

            <p>
              Run the same WikiQuality AI
              pipeline on two articles and
              compare their measurable
              knowledge-quality features.
            </p>
          </div>

          <div className="feature-api-status">
            <span className="feature-status-dot" />
            Live backend
          </div>
        </header>

        <form
          onSubmit={compareArticles}
        >
          <section className="compare-input-card">
            <div className="compare-input-heading">
              <div>
                <span className="feature-kicker">
                  INPUT WORKSPACE
                </span>

                <h2>
                  Compare two articles
                </h2>

                <p>
                  Use pasted text or retrieve
                  both articles directly from
                  Wikipedia.
                </p>
              </div>

              <div className="compare-method-badge">
                <ShieldCheck size={15} />
                Same metrics for both
              </div>
            </div>

            <div className="compare-articles-grid">
              <ArticlePanel
                label="ARTICLE A"
                title={titleA}
                text={articleA}
                setTitle={setTitleA}
                setText={setArticleA}
                source={sourceA}
                setSource={setSourceA}
                disabled={comparing}
                onFetchWikipedia={() =>
                  fetchWikipedia("A")
                }
                loadingWikipedia={
                  loadingA
                }
              />

              <ArticlePanel
                label="ARTICLE B"
                title={titleB}
                text={articleB}
                setTitle={setTitleB}
                setText={setArticleB}
                source={sourceB}
                setSource={setSourceB}
                disabled={comparing}
                onFetchWikipedia={() =>
                  fetchWikipedia("B")
                }
                loadingWikipedia={
                  loadingB
                }
              />
            </div>

            {error && (
              <div className="analysis-error compare-error">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            <div className="compare-action-row">
              <div className="compare-pipeline-note">
                <Sparkles size={16} />

                <span>
                  Structure • NLP • semantic •
                  information • entities • topics
                  • citations • quality features
                </span>
              </div>

              <button
                type="submit"
                className="primary-analysis-button"
                disabled={
                  comparing ||
                  loadingA ||
                  loadingB
                }
              >
                {comparing ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="spin"
                    />
                    Comparing...
                  </>
                ) : (
                  <>
                    <BarChart3 size={17} />
                    Compare Articles
                    <ChevronRight
                      size={17}
                    />
                  </>
                )}
              </button>
            </div>
          </section>
        </form>

        {comparing && (
          <section className="compare-loading-card">
            <LoaderCircle
              size={27}
              className="spin"
            />

            <div>
              <span className="feature-kicker">
                PROCESSING
              </span>

              <h2>
                Analyzing both articles
              </h2>

              <p>
                Running both articles through
                the existing WikiQuality AI
                quality-feature endpoint.
              </p>
            </div>
          </section>
        )}

        {result && (
          <ComparisonResults
            articleA={result.articleA}
            articleB={result.articleB}
          />
        )}

        {!result && !comparing && (
          <section className="compare-empty-card">
            <div className="feature-icon-large">
              <BarChart3 size={29} />
            </div>

            <div>
              <span className="feature-kicker">
                READY
              </span>

              <h2>
                Comparison results will
                appear here
              </h2>

              <p>
                Load or paste two articles,
                then run the comparison to
                inspect the same measurable
                features side by side.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default ComparePage;
