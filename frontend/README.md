# WikiQuality AI

> AI-powered Wikipedia article quality, completeness, evidence, and knowledge analysis platform.

WikiQuality AI is a full-stack educational project that analyzes Wikipedia article content using NLP, semantic, information-coverage, entity, topic, citation, evidence, and rule-based quality signals.

It also includes user authentication, analysis history, article comparison, a knowledge graph view, reports, Wikipedia API integration, and an experimental dataset/ML preparation pipeline.

---

## What this project does

WikiQuality AI is designed to answer questions such as:

- How well structured is an article?
- Is the vocabulary sufficiently diverse?
- Is information being repeated?
- Are different sentences semantically redundant?
- How diverse is the information covered by the article?
- Which named entities appear in the article?
- Which topic areas are covered?
- Are citation/evidence signals present?
- What strengths and potential issues can be identified from the available signals?
- What evidence supports each analysis result?

**Important:** this is an independent educational/experimental analysis system. It does not reproduce or certify Wikipedia's official editorial quality assessment.

---

## Current features

### User features

- User registration and login
- User/admin roles
- Protected dashboard
- Wikipedia article retrieval
- Article/text analysis
- Analysis history
- Article comparison
- Knowledge graph visualization
- Detailed reports
- Evidence and explanation sections

### Analysis pipeline

1. Structure analysis
2. NLP metrics
3. Semantic similarity / redundancy
4. Information diversity
5. Named-entity analysis
6. Topic coverage
7. Citation analysis
8. Quality findings
9. Explanation generation
10. Evidence construction
11. ML feature extraction

### Wikipedia integration

The backend can retrieve:

- Article title
- Page ID
- Revision information
- Source URL
- Raw wikitext
- Cleaned article text
- Wikipedia PageAssessments
- Explicit quality templates such as GA/FA when available

### Admin / dataset tools

The project includes checks for:

- Dataset size
- Quality-class representation
- Duplicate article IDs
- Missing feature values
- Invalid numeric values
- Dataset validation
- ML-readiness

---

## Technology stack

| Area | Technology |
|---|---|
| Frontend | React 19, JavaScript/JSX, Vite 8, CSS |
| Backend | Python, FastAPI, Uvicorn, Pydantic |
| NLP | spaCy, `en_core_web_sm` |
| ML/data | scikit-learn, TF-IDF, cosine similarity, feature engineering |
| HTTP/API | Requests |
| Database | SQLite |
| External data | Wikipedia MediaWiki REST API, PageAssessments API |
| Icons/UI | Lucide React |
| Dataset | CSV |

---

## Project structure

```text
WikiQuality-AI/
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── wikipedia_api.py
│   ├── wikipedia_assessment.py
│   ├── analysis_history.py
│   ├── citation_analysis.py
│   ├── entity_analysis.py
│   ├── information_analysis.py
│   ├── semantic_analysis.py
│   ├── topic_coverage.py
│   ├── quality_analysis.py
│   ├── explanation_engine.py
│   ├── evidence_engine.py
│   ├── ml_features.py
│   ├── ml_dataset.py
│   ├── dataset_validation.py
│   ├── dataset_statistics.py
│   ├── dataset_quality.py
│   ├── quality_label.py
│   ├── ml_training_dataset.csv
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Dashboard.jsx
│   │   ├── UserFeaturePage.jsx
│   │   ├── ComparePage.jsx
│   │   ├── KnowledgeGraphPage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── ...
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# How to run locally

## Requirements

- Python 3.10+
- Node.js 18+
- npm
- Internet connection for Wikipedia API requests

### 1. Clone

```bash
git clone https://github.com/YOUR-USERNAME/WikiQuality-AI.git
cd WikiQuality-AI
```

### 2. Backend

```bash
cd backend
python -m venv .venv
```

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Install the spaCy English model:

```bash
python -m spacy download en_core_web_sm
```

Start FastAPI:

```bash
uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite normally runs at:

```text
http://localhost:5173
```

Open that address in a browser.

---

# How to use

1. Open the frontend.
2. Select **User**.
3. Create an account.
4. Log in.
5. Open **Analyze Article**.
6. Provide article text or use the Wikipedia article workflow.
7. Run the analysis.
8. Review structure, NLP, semantic analysis, information diversity, entities, topics, citations, quality findings, explanations, and evidence.
9. Open **History/Reports** to review saved analyses.
10. Use **Compare Articles** and **Knowledge Graph** for additional exploration.
11. Admin users can inspect dataset/system information from the admin area.

---

# Current limitations

### 1. ML is not production-ready

The project contains ML feature extraction and a dataset pipeline, but it does **not** currently contain a trained, evaluated production-quality classifier.

The included dataset is small. The backend's dataset-quality logic requires substantially more labeled data before considering training ready.

Therefore, the current application should be described as an **analysis-signal/rule-based prototype with ML preparation**, not as a finished ML quality classifier.

### 2. Dataset is small

The included CSV currently contains only a small demonstration dataset.

More labeled Wikipedia articles are required for meaningful training, validation, and testing.

### 3. Wikipedia labels are not invented

The application can read explicit Wikipedia assessment/template information when available. It does not claim an official Wikipedia quality label when reliable explicit evidence is unavailable.

### 4. NLP is experimental

The metrics are educational/research signals and should not be treated as an official measurement of article quality.

### 5. English NER model

Named-entity recognition currently uses spaCy's `en_core_web_sm`, so multilingual analysis is limited.

### 6. Local API configuration

The current frontend is configured for:

```text
http://127.0.0.1:8000
```

For public deployment, the frontend API URL and backend CORS configuration must be changed to the deployed backend.

### 7. Authentication needs hardening

Authentication is currently prototype-level. Before public deployment, production secrets, password policies, CORS, session/token handling, database security, rate limiting, and other security controls should be reviewed.

### 8. Runtime databases are local

SQLite runtime databases are intentionally excluded from the public repository because they may contain user information and application history.

### 9. No official Wikipedia certification

Results are independent analytical signals. They do not certify that an article is complete, correct, unbiased, or publication-ready.

---

# What has been built so far

This project has progressed from basic text analysis toward a complete knowledge-quality analysis platform.

Implemented areas include:

- React frontend
- FastAPI backend
- REST API
- Authentication
- User/admin roles
- Wikipedia API integration
- Article analysis pipeline
- NLP feature extraction
- TF-IDF semantic similarity
- Named-entity recognition
- Topic analysis
- Information-diversity analysis
- Citation/evidence analysis
- Quality findings
- Explanation generation
- Evidence generation
- Analysis history
- Article comparison
- Knowledge graph visualization
- Reports
- ML feature engineering
- Dataset collection
- Dataset validation
- Dataset statistics
- Dataset quality/readiness checks

---

# API overview

The current backend exposes endpoints for:

```text
GET  /api/health

POST /api/analyze/text
POST /api/analyze/structure
POST /api/analyze/nlp
POST /api/analyze/semantic
POST /api/analyze/information
POST /api/analyze/entities
POST /api/analyze/topic-coverage
POST /api/analyze/citations
POST /api/analyze/quality-features
POST /api/analyze/explanation
POST /api/analyze/ml-features

GET  /api/wikipedia/article
GET  /api/wikipedia/assessment

POST /api/ml/dataset-record
POST /api/ml/collect-wikipedia
POST /api/ml/collect-wikipedia-batch
POST /api/ml/detect-quality-label

GET  /api/ml/dataset-validation
GET  /api/ml/dataset-statistics
GET  /api/ml/dataset-quality

POST /api/history
GET  /api/history
GET  /api/history/{analysis_id}

POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify

GET  /api/admin/users
```

---

# Public deployment

GitHub is for the source code; **GitHub Pages alone cannot run the current full-stack application** because the React frontend needs a live FastAPI backend.

A typical public architecture is:

```text
Phone / Browser
      |
      v
Public frontend URL
      |
      v
React / Vite
      |
      v
Public FastAPI backend
      |
      +--> Wikipedia APIs
      +--> Application data
```

A practical setup is:

- GitHub → source repository
- Vercel / Netlify / Cloudflare Pages → frontend
- Render / Railway / Fly.io / similar → FastAPI backend

You then share only the **frontend URL** with other people.

For example:

```text
https://wikiquality-ai.example.app
```

The backend URL can remain an implementation detail.

Before deployment, update the frontend API URL and backend CORS settings.

---

# GitHub publishing checklist

Before making the repository public:

- [ ] Do not upload `.venv/`
- [ ] Do not upload `node_modules/`
- [ ] Do not upload `__pycache__/`
- [ ] Do not upload runtime SQLite databases
- [ ] Do not upload `.env` files
- [ ] Do not upload API keys/private credentials
- [ ] Change/remove development admin credentials
- [ ] Move production secrets to hosting-provider environment variables
- [ ] Update frontend API URL
- [ ] Update backend CORS
- [ ] Test registration/login
- [ ] Test article analysis
- [ ] Test history/reports
- [ ] Test comparison
- [ ] Test knowledge graph
- [ ] Test the public site from a phone

---

# Future improvements

- Larger labeled Wikipedia dataset
- Proper ML model training
- Train/validation/test split
- Cross-validation
- Model evaluation metrics
- Model versioning
- Better multilingual NLP
- Improved citation verification
- Improved evidence retrieval
- Production authentication
- PostgreSQL or another production database
- Background analysis jobs
- API rate limiting
- Automated tests
- CI/CD
- PWA/mobile improvements

---

# Project status

**Active educational / experimental full-stack AI project**

The current version is a working prototype with a substantial analysis pipeline. It is not presented as a finished production-grade Wikipedia quality classifier.

---

## Disclaimer

WikiQuality AI is an independent educational project.

It does not represent Wikipedia, Wikimedia Foundation, or any official Wikipedia quality-assessment system.

Analysis results are experimental signals intended for research, learning, and demonstration.

---

## Author

**Prasanna**

WikiQuality AI — AI-Powered Wikipedia Knowledge Quality & Completeness Platform
