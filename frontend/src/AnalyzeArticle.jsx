import { useState } from "react";
import {
  Sparkles,
  FileText,
  Search,
  Link,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Brain,
} from "lucide-react";
import "./AnalyzeArticle.css";

const API_BASE = "http://127.0.0.1:8000";

function AnalyzeArticle() {
  const [sourceType, setSourceType] = useState("paste");
  const [articleText, setArticleText] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyzeArticle = async () => {
    setError("");
    setResult(null);

    if (!articleText.trim()) {
      setError("Please enter article text before starting the analysis.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/analyze/explanation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: articleText,
            source_type: "pasted_text",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data.detail === "string"
            ? data.detail
            : "Article analysis failed.";

        throw new Error(message);
      }

      if (!data.success) {
        throw new Error(
          data.message || "The analysis could not be completed."
        );
      }

      setResult(data);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.message || "Unable to connect to the analysis API.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".txt")) {
      setError("For now, please select a .txt file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      setArticleText(e.target.result || "");
      setArticleTitle(file.name.replace(/\.txt$/i, ""));
      setError("");
    };

    reader.onerror = () => {
      setError("Unable to read the selected file.");
    };

    reader.readAsText(file);
  };

  const getFindingClass = (severity) => {
    if (severity === "high") {
      return "finding-high";
    }

    if (severity === "medium") {
      return "finding-medium";
    }

    return "finding-low";
  };

  return (
    <div className="analyze-page">
      <div className="analyze-header">
        <div>
          <div className="page-label">ARTICLE ANALYSIS</div>

          <h1>Analyze an Article</h1>

          <p>
            Analyze article quality using NLP, semantic analysis,
            information diversity and evidence-based metrics.
          </p>
        </div>

        <div className="analysis-engine-status">
          <span></span>
          Live Analysis Engine
        </div>
      </div>

      <div className="source-card">
        <div className="source-tabs">
          <button
            className={sourceType === "paste" ? "source-tab active" : "source-tab"}
            onClick={() => {
              setSourceType("paste");
              setError("");
            }}
          >
            <FileText size={18} />
            Paste Text
          </button>

          <button
            className={sourceType === "wikipedia" ? "source-tab active" : "source-tab"}
            onClick={() => {
              setSourceType("wikipedia");
              setError("");
            }}
          >
            <Search size={18} />
            Wikipedia
          </button>

          <button
            className={sourceType === "url" ? "source-tab active" : "source-tab"}
            onClick={() => {
              setSourceType("url");
              setError("");
            }}
          >
            <Link size={18} />
            URL
          </button>

          <button
            className={sourceType === "txt" ? "source-tab active" : "source-tab"}
            onClick={() => {
              setSourceType("txt");
              setError("");
            }}
          >
            <Upload size={18} />
            TXT
          </button>
        </div>

        <div className="source-content">
          {sourceType === "paste" && (
            <>
              <div className="input-group">
                <label>Article title</label>

                <input
                  type="text"
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                  placeholder="Example: Mangaluru"
                />
              </div>

              <div className="input-group">
                <label>Article content</label>

                <textarea
                  value={articleText}
                  onChange={(e) => setArticleText(e.target.value)}
                  placeholder="Paste the article content here..."
                  rows={15}
                />
              </div>
            </>
          )}

          {sourceType === "wikipedia" && (
            <div className="coming-soon-box">
              <Search size={38} />

              <h3>Wikipedia Analysis</h3>

              <p>
                Wikipedia article search will connect directly to the
                WikiQuality AI Wikipedia retrieval engine.
              </p>

              <span>Next integration layer</span>
            </div>
          )}

          {sourceType === "url" && (
            <div className="coming-soon-box">
              <Link size={38} />

              <h3>Wikipedia URL</h3>

              <p>
                URL-based article retrieval will be connected to the
                existing Wikipedia API layer.
              </p>

              <span>Next integration layer</span>
            </div>
          )}

          {sourceType === "txt" && (
            <>
              <div className="upload-area">
                <Upload size={38} />

                <h3>Upload a TXT article</h3>

                <p>
                  Select a text document and WikiQuality AI will
                  load it into the analysis engine.
                </p>

                <label className="upload-button">
                  Choose TXT File
                  <input
                    type="file"
                    accept=".txt,text/plain"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {articleText && (
                <div className="file-preview">
                  <FileText size={18} />

                  <span>
                    {articleTitle || "Text document loaded"}
                  </span>

                  <CheckCircle2 size={18} />
                </div>
              )}
            </>
          )}

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {(sourceType === "paste" ||
            (sourceType === "txt" && articleText)) && (
            <div className="analysis-action">
              <div className="analysis-info">
                <Brain size={19} />

                <span>
                  NLP • Semantic • Information • Entity • Citation
                  analysis
                </span>
              </div>

              <button
                className="analyze-button"
                onClick={analyzeArticle}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Analyze Article
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="results-section">
          <div className="results-header">
            <div>
              <div className="page-label">ANALYSIS COMPLETE</div>

              <h2>
                {articleTitle || "Article Analysis Results"}
              </h2>

              <p>
                WikiQuality AI generated an evidence-based analysis
                of the submitted content.
              </p>
            </div>

            <div className="complete-badge">
              <CheckCircle2 size={18} />
              Completed
            </div>
          </div>

          {result.ai_explanation && (
            <div className="explanation-card">
              <div className="explanation-icon">
                <Sparkles size={22} />
              </div>

              <div>
                <h3>{result.ai_explanation.headline}</h3>

                <p>{result.ai_explanation.summary}</p>
              </div>
            </div>
          )}

          {result.ai_explanation?.strengths?.length > 0 && (
            <div className="result-card">
              <div className="result-card-title">
                <CheckCircle2 size={20} />
                Detected Strengths
              </div>

              <div className="result-list">
                {result.ai_explanation.strengths.map(
                  (strength, index) => (
                    <div className="strength-item" key={index}>
                      <CheckCircle2 size={17} />
                      <span>{strength}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {result.ai_explanation?.concerns?.length > 0 && (
            <div className="result-card">
              <div className="result-card-title">
                <AlertCircle size={20} />
                Findings Requiring Review
              </div>

              <div className="result-list">
                {result.ai_explanation.concerns.map(
                  (concern, index) => (
                    <div
                      className="concern-item"
                      key={index}
                    >
                      <AlertCircle size={17} />
                      <span>{concern}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {result.ai_explanation?.improvement_suggestions
            ?.length > 0 && (
            <div className="result-card">
              <div className="result-card-title">
                <Brain size={20} />
                Improvement Suggestions
              </div>

              <div className="suggestion-list">
                {result.ai_explanation.improvement_suggestions.map(
                  (suggestion, index) => (
                    <div
                      className="suggestion-item"
                      key={index}
                    >
                      <span>{index + 1}</span>
                      <p>{suggestion}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {result.evidence?.length > 0 && (
            <div className="result-card">
              <div className="result-card-title">
                <FileText size={20} />
                Evidence Used
              </div>

              <div className="evidence-list">
                {result.evidence.map((item, index) => (
                  <div className="evidence-item" key={index}>
                    <strong>
                      {item.metric || item.category || "Evidence"}
                    </strong>

                    <span>
                      {item.evidence ||
                        item.message ||
                        item.description ||
                        JSON.stringify(item)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AnalyzeArticle;