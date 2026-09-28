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
import "./KnowledgeGraphPage.css";

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
    headers: { "Content-Type": "application/json" },
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

function getEntityText(entity) {
  if (typeof entity === "string") return entity;

  return String(
    entity?.text ||
      entity?.entity ||
      entity?.name ||
      ""
  );
}

function getTopics(informationAnalysis) {
  const detected = informationAnalysis?.detected_topics;

  if (Array.isArray(detected)) {
    return detected.filter(Boolean);
  }

  if (detected && typeof detected === "object") {
    return Object.keys(detected).filter(Boolean);
  }

  return [];
}

function getUniqueEntities(entityAnalysis, centerTitle) {
  const raw = Array.isArray(entityAnalysis?.unique_entities)
    ? entityAnalysis.unique_entities
    : Array.isArray(entityAnalysis?.entities)
    ? entityAnalysis.entities
    : [];

  const center = centerTitle.trim().toLowerCase();
  const seen = new Set();
  const entities = [];

  for (const entity of raw) {
    const text = getEntityText(entity).trim();

    if (!text) continue;

    const key = text.toLowerCase();

    // Avoid drawing the article title again as an entity node.
    if (key === center) continue;

    if (seen.has(key)) continue;

    seen.add(key);

    entities.push({
      text,
      type:
        typeof entity === "object"
          ? entity.label || entity.type || "ENTITY"
          : "ENTITY",
    });

    if (entities.length >= 24) break;
  }

  return entities;
}

function buildGraphNodes(center, topics, entities) {
  const nodes = [
    {
      id: "center",
      label: center,
      type: "ARTICLE",
      x: 350,
      y: 250,
      radius: 48,
      className: "article-node",
    },
  ];

  const topicRadiusX = 215;
  const topicRadiusY = 170;

  topics.forEach((topic, index) => {
    const angle =
      (index / Math.max(topics.length, 1)) *
        Math.PI *
        2 -
      Math.PI / 2;

    nodes.push({
      id: `topic-${index}`,
      label: topic,
      type: "TOPIC",
      x: 350 + Math.cos(angle) * topicRadiusX,
      y: 250 + Math.sin(angle) * topicRadiusY,
      radius: 32,
      className: "topic-node",
    });
  });

  const entityStart = topics.length;
  const entityRadiusX = 310;
  const entityRadiusY = 210;

  entities.forEach((entity, index) => {
    const angle =
      ((index + entityStart) /
        Math.max(
          entities.length + entityStart,
          1
        )) *
        Math.PI *
        2 -
      Math.PI / 2;

    nodes.push({
      id: `entity-${index}`,
      label: entity.text,
      type: entity.type,
      x: 350 + Math.cos(angle) * entityRadiusX,
      y: 250 + Math.sin(angle) * entityRadiusY,
      radius: 25,
      className: "entity-node",
    });
  });

  return nodes;
}

function GraphPage() {
  const user = readStoredUser();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graph, setGraph] = useState(null);

  const navigate = (path) => {
    window.location.href = path;
  };

  const logout = () => {
    localStorage.removeItem("wikiquality_token");
    localStorage.removeItem("wikiquality_user");
    window.location.href = "/";
  };

  const buildGraph = async (event) => {
    event.preventDefault();

    if (!text.trim()) {
      setError(
        "Paste article text before building the graph."
      );
      return;
    }

    setError("");
    setGraph(null);
    setLoading(true);

    try {
      const [
        entityData,
        informationData,
      ] = await Promise.all([
        postJson(
          "/api/analyze/entities",
          text.trim()
        ),
        postJson(
          "/api/analyze/information",
          text.trim()
        ),
      ]);

      const entityAnalysis =
        entityData?.entity_analysis ||
        entityData ||
        {};

      const informationAnalysis =
        informationData?.information_analysis ||
        informationData ||
        {};

      const metrics =
        entityAnalysis?.metrics ||
        {};

      const center =
        title.trim() || "Article";

      const topics =
        getTopics(informationAnalysis);

      const entities =
        getUniqueEntities(
          entityAnalysis,
          center
        );

      setGraph({
        center,
        topics,
        entities,
        metrics,
      });
    } catch (graphError) {
      console.error(
        "Knowledge graph error:",
        graphError
      );

      setError(
        graphError.message ||
          "Unable to build the knowledge graph. Check the backend terminal."
      );
    } finally {
      setLoading(false);
    }
  };

  const nodes = graph
    ? buildGraphNodes(
        graph.center,
        graph.topics,
        graph.entities
      )
    : [];

  const centerNode =
    nodes.find(
      (node) => node.id === "center"
    ) || null;

  const topicNodes = nodes.filter(
    (node) => node.id.startsWith("topic-")
  );

  const entityNodes = nodes.filter(
    (node) => node.id.startsWith("entity-")
  );

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
            className="feature-nav-item active"
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

      <main className="feature-main">
        <header className="feature-header">
          <div>
            <p className="feature-eyebrow">
              USER DASHBOARD
            </p>
            <h1>Knowledge Graph</h1>
            <p>
              Explore relationships between the
              article, detected topics and named
              entities.
            </p>
          </div>

          <div className="feature-api-status">
            <span className="feature-status-dot" />
            Live backend
          </div>
        </header>

        <section className="kg-input-card">
          <div>
            <span className="feature-kicker">
              GRAPH INPUT
            </span>

            <h2>
              Build a knowledge graph
            </h2>

            <p>
              The graph reuses the existing
              entity and information-analysis
              results from your backend.
            </p>
          </div>

          <form onSubmit={buildGraph}>
            <div className="kg-title-row">
              <label htmlFor="kg-title">
                Article title
              </label>

              <input
                id="kg-title"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Example: Mangaluru"
                disabled={loading}
              />
            </div>

            <label htmlFor="kg-text">
              Article content
            </label>

            <textarea
              id="kg-text"
              value={text}
              onChange={(event) =>
                setText(event.target.value)
              }
              placeholder="Paste article text here..."
              rows={8}
              disabled={loading}
            />

            {error && (
              <div className="analysis-error">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            <div className="kg-action-row">
              <div className="pipeline-hint">
                <ShieldCheck size={16} />
                Entity extraction + topic extraction
              </div>

              <button
                type="submit"
                className="primary-analysis-button"
                disabled={
                  loading ||
                  !text.trim()
                }
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="spin"
                    />
                    Building graph...
                  </>
                ) : (
                  <>
                    <Network size={17} />
                    Build Knowledge Graph
                    <ChevronRight
                      size={17}
                    />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {graph && (
          <>
            <section className="kg-summary-grid">
              <div className="analysis-stat-card">
                <span>Entity mentions</span>
                <strong>
                  {graph.metrics
                    ?.total_entity_mentions ??
                    "—"}
                </strong>
              </div>

              <div className="analysis-stat-card">
                <span>Unique entities</span>
                <strong>
                  {graph.metrics
                    ?.unique_entity_count ??
                    "—"}
                </strong>
              </div>

              <div className="analysis-stat-card">
                <span>Entity types</span>
                <strong>
                  {graph.metrics
                    ?.entity_type_count ??
                    "—"}
                </strong>
              </div>

              <div className="analysis-stat-card">
                <span>Topic nodes</span>
                <strong>
                  {graph.topics.length}
                </strong>
              </div>
            </section>

            <section className="kg-graph-card">
              <div className="kg-heading">
                <div>
                  <p className="feature-eyebrow">
                    KNOWLEDGE GRAPH
                  </p>

                  <h2>{graph.center}</h2>

                  <p>
                    Relationships shown here are
                    derived from extracted analysis
                    results; they are not presented
                    as external factual relationships.
                  </p>
                </div>

                <div className="kg-legend">
                  <span>
                    <i className="kg-dot article" />
                    Article
                  </span>

                  <span>
                    <i className="kg-dot topic" />
                    Topic
                  </span>

                  <span>
                    <i className="kg-dot entity" />
                    Entity
                  </span>
                </div>
              </div>

              <div className="kg-canvas">
                <svg
                  viewBox="0 0 700 500"
                  role="img"
                  aria-label="Knowledge graph visualization"
                >
                  {centerNode &&
                    topicNodes.map(
                      (node) => (
                        <line
                          key={`${centerNode.id}-${node.id}`}
                          x1={centerNode.x}
                          y1={centerNode.y}
                          x2={node.x}
                          y2={node.y}
                          className="kg-edge"
                        />
                      )
                    )}

                  {centerNode &&
                    entityNodes.map(
                      (node) => (
                        <line
                          key={`${centerNode.id}-${node.id}`}
                          x1={centerNode.x}
                          y1={centerNode.y}
                          x2={node.x}
                          y2={node.y}
                          className="kg-edge entity-edge"
                        />
                      )
                    )}

                  {nodes.map(
                    (node) => (
                      <g key={node.id}>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.radius}
                          className={`kg-node ${node.className}`}
                        />

                        <text
                          x={node.x}
                          y={
                            node.y +
                            node.radius +
                            14
                          }
                          textAnchor="middle"
                          className="kg-node-label"
                        >
                          {node.label.length >
                          20
                            ? `${node.label.slice(
                                0,
                                19
                              )}…`
                            : node.label}
                        </text>
                      </g>
                    )
                  )}
                </svg>
              </div>
            </section>

            <section className="kg-support-grid">
              <div className="kg-support-card">
                <div className="list-panel-heading">
                  <Sparkles size={17} />
                  <h3>
                    Detected topics
                  </h3>
                </div>

                {graph.topics.length >
                0 ? (
                  <div className="tag-list">
                    {graph.topics.map(
                      (topic) => (
                        <span
                          className="metric-tag"
                          key={topic}
                        >
                          {topic}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="kg-empty-note">
                    No topic keywords were detected
                    in this article.
                  </p>
                )}
              </div>

              <div className="kg-support-card">
                <div className="list-panel-heading">
                  <Network size={17} />
                  <h3>
                    Detected entities
                  </h3>
                </div>

                {graph.entities.length >
                0 ? (
                  <div className="entity-chip-list">
                    {graph.entities.map(
                      (entity) => (
                        <span
                          className="entity-chip"
                          key={entity.text}
                        >
                          {entity.text}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="kg-empty-note">
                    No unique named entities were
                    detected.
                  </p>
                )}
              </div>
            </section>
          </>
        )}

        {!graph && !loading && (
          <section className="compare-empty-card">
            <div className="feature-icon-large">
              <Network size={29} />
            </div>

            <div>
              <span className="feature-kicker">
                READY
              </span>

              <h2>
                Knowledge graph results will
                appear here
              </h2>

              <p>
                Paste an article and build the graph
                to visualize its detected topics and
                named entities.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default GraphPage;
