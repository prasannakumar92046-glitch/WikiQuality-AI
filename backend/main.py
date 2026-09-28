from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
from semantic_analysis import analyze_semantic_similarity
from information_analysis import analyze_information_diversity
from entity_analysis import analyze_entities
from topic_coverage import analyze_topic_coverage
from citation_analysis import analyze_citations
from quality_analysis import analyze_quality_features
from explanation_engine import generate_explanation
from evidence_engine import build_evidence
from ml_features import extract_ml_features
from ml_dataset import (
    build_dataset_record,
    save_dataset_record,
    get_dataset_size
)
from dataset_validation import validate_dataset
from dataset_statistics import get_dataset_statistics
from wikipedia_api import get_wikipedia_article
from quality_label import detect_quality_label
from wikipedia_assessment import get_wikipedia_assessment
from dataset_quality import analyze_dataset_quality
from analysis_history import (
    initialize_history_database,
    save_analysis,
    list_analyses,
    get_analysis,
)
from fastapi import Header, HTTPException
from auth import (
    initialize_auth_database,
    create_user,
    authenticate_user,
    create_token,
    verify_token,
    get_user_by_id,
    get_all_users,
)
from fastapi.middleware.cors import CORSMiddleware

class WikipediaDatasetRequest(BaseModel):
    title: str

class WikipediaBatchDatasetRequest(BaseModel):
    titles: list[str]

app = FastAPI(
    title="WikiQuality AI API",
    description="Backend API for Wikipedia article quality analysis",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

initialize_auth_database()
initialize_history_database()


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Request model
# --------------------------------------------------

class TextAnalysisRequest(BaseModel):
    text: str
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str
    role: str


class TokenRequest(BaseModel):
    token: str

# --------------------------------------------------
# Helper functions
# --------------------------------------------------

def clean_text(text: str) -> str:
    """Normalize unnecessary whitespace."""
    return re.sub(r"[ \t]+", " ", text).strip()


def split_sentences(text: str) -> list[str]:
    """Split text approximately into sentences."""
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    return [sentence.strip() for sentence in sentences if sentence.strip()]


def split_paragraphs(text: str) -> list[str]:
    """Split text into non-empty paragraphs."""
    paragraphs = re.split(r"\n\s*\n+", text.strip())
    return [paragraph.strip() for paragraph in paragraphs if paragraph.strip()]


def extract_sections(text: str) -> list[dict]:
    """
    Detect simple article headings.

    Supported examples:

    Introduction
    History
    Geography

    ## History
    ### Geography

    History:
    """
    lines = text.splitlines()

    sections = []
    current_title = "Introduction"
    current_content = []

    heading_pattern = re.compile(
        r"^\s*(?:#{1,6}\s+)?([A-Za-z][A-Za-z0-9 ,&'()\-]{1,80})\s*:?\s*$"
    )

    common_headings = {
        "introduction",
        "history",
        "geography",
        "climate",
        "economy",
        "transportation",
        "education",
        "culture",
        "tourism",
        "politics",
        "demographics",
        "references",
        "external links",
        "administration",
        "etymology",
        "infrastructure",
        "sports",
        "media",
    }

    for line in lines:
        stripped = line.strip()

        if not stripped:
            continue

        match = heading_pattern.match(stripped)

        if match:
            possible_heading = match.group(1).strip()
            normalized_heading = possible_heading.lower()

            # Treat it as a heading when:
            # 1. It starts with #, or
            # 2. It matches a common article heading.
            is_markdown_heading = stripped.startswith("#")
            is_common_heading = normalized_heading in common_headings

            if is_markdown_heading or is_common_heading:
                if current_content:
                    sections.append(
                        {
                            "title": current_title,
                            "content": " ".join(current_content).strip(),
                        }
                    )

                current_title = possible_heading
                current_content = []
                continue

        current_content.append(stripped)

    # Add final section
    if current_content:
        sections.append(
            {
                "title": current_title,
                "content": " ".join(current_content).strip(),
            }
        )

    return sections


def analyze_sections(sections: list[dict]) -> list[dict]:
    """Calculate basic statistics for each section."""
    analyzed_sections = []

    for section in sections:
        content = section["content"]
        words = content.split()
        sentences = split_sentences(content)

        analyzed_sections.append(
            {
                "title": section["title"],
                "word_count": len(words),
                "sentence_count": len(sentences),
                "content_preview": (
                    content[:150] + "..."
                    if len(content) > 150
                    else content
                ),
            }
        )

    return analyzed_sections


# --------------------------------------------------
# Health check
# --------------------------------------------------

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "project": "WikiQuality AI",
        "version": "0.2.0",
    }


# --------------------------------------------------
# Basic text analysis
# --------------------------------------------------

@app.post("/api/analyze/text")
def analyze_text(request: TextAnalysisRequest):

    text = request.text.strip()

    if not text:
        return {
            "success": False,
            "message": "No text was provided.",
        }

    words = text.split()

    sentences = split_sentences(text)

    paragraphs = [
        paragraph.strip()
        for paragraph in text.split("\n")
        if paragraph.strip()
    ]

    unique_words = set(
        word.lower().strip(".,!?;:\"'()[]{}")
        for word in words
        if word.strip(".,!?;:\"'()[]{}")
    )

    return {
        "success": True,
        "source_type": "pasted_text",
        "statistics": {
            "word_count": len(words),
            "sentence_count": len(sentences),
            "paragraph_count": len(paragraphs),
            "unique_word_count": len(unique_words),
        },
    }


# --------------------------------------------------
# Article structure analysis
# --------------------------------------------------

@app.post("/api/analyze/structure")
def analyze_structure(request: TextAnalysisRequest):

    text = clean_text(request.text)

    if not text:
        return {
            "success": False,
            "message": "No text was provided.",
        }

    sections = extract_sections(text)
    analyzed_sections = analyze_sections(sections)

    total_words = len(text.split())
    total_sentences = len(split_sentences(text))
    total_paragraphs = len(split_paragraphs(text))

    section_word_counts = [
        section["word_count"]
        for section in analyzed_sections
    ]

    if section_word_counts:
        largest_section_words = max(section_word_counts)
        smallest_section_words = min(section_word_counts)
    else:
        largest_section_words = 0
        smallest_section_words = 0

    short_sections = [
        section["title"]
        for section in analyzed_sections
        if 0 < section["word_count"] < 30
    ]

    return {
        "success": True,
        "source_type": "pasted_text",

        "statistics": {
            "word_count": total_words,
            "sentence_count": total_sentences,
            "paragraph_count": total_paragraphs,
            "section_count": len(analyzed_sections),
            "largest_section_word_count": largest_section_words,
            "smallest_section_word_count": smallest_section_words,
            "short_section_count": len(short_sections),
        },

        "sections": analyzed_sections,

        "structure_flags": {
            "has_multiple_sections": len(analyzed_sections) > 1,
            "has_short_sections": len(short_sections) > 0,
            "short_sections": short_sections,
        },
    }
# --------------------------------------------------
# NLP analysis helpers
# --------------------------------------------------

STOP_WORDS = {
    "a", "an", "and", "are", "as", "at", "be", "been", "being",
    "but", "by", "for", "from", "had", "has", "have", "he",
    "her", "here", "hers", "him", "his", "how", "i", "if",
    "in", "into", "is", "it", "its", "itself", "me", "more",
    "most", "my", "no", "not", "of", "on", "or", "our", "ours",
    "she", "so", "some", "such", "than", "that", "the", "their",
    "theirs", "them", "then", "there", "these", "they", "this",
    "those", "to", "too", "was", "we", "were", "what", "when",
    "where", "which", "who", "why", "will", "with", "you",
    "your", "yours"
}


def tokenize_words(text: str) -> list[str]:
    """
    Extract alphabetic words from the text.

    Example:
    "Mangaluru is beautiful!" -> ["mangaluru", "is", "beautiful"]
    """
    return re.findall(r"[A-Za-z]+(?:['-][A-Za-z]+)?", text.lower())


def get_content_words(words: list[str]) -> list[str]:
    """
    Remove common stop words so that we can focus on
    information-bearing vocabulary.
    """
    return [
        word
        for word in words
        if word not in STOP_WORDS and len(word) > 1
    ]


def calculate_word_frequencies(words: list[str]) -> dict:
    """Calculate word frequency counts."""
    frequencies = {}

    for word in words:
        frequencies[word] = frequencies.get(word, 0) + 1

    return frequencies


def analyze_nlp_metrics(text: str) -> dict:
    """
    Perform lightweight NLP analysis without requiring
    an external NLP model.
    """

    words = tokenize_words(text)
    content_words = get_content_words(words)

    total_words = len(words)
    total_content_words = len(content_words)

    unique_words = set(words)
    unique_content_words = set(content_words)

    # Type-token ratio
    vocabulary_diversity = (
        len(unique_content_words) / total_content_words
        if total_content_words > 0
        else 0.0
    )

    # Repetition beyond the first occurrence
    repeated_word_occurrences = sum(
        count - 1
        for count in calculate_word_frequencies(content_words).values()
        if count > 1
    )

    repetition_ratio = (
        repeated_word_occurrences / total_content_words
        if total_content_words > 0
        else 0.0
    )

    # Content-word ratio
    content_word_ratio = (
        total_content_words / total_words
        if total_words > 0
        else 0.0
    )

    sentences = split_sentences(text)

    sentence_lengths = [
        len(tokenize_words(sentence))
        for sentence in sentences
        if tokenize_words(sentence)
    ]

    if sentence_lengths:
        average_sentence_length = (
            sum(sentence_lengths) / len(sentence_lengths)
        )
        shortest_sentence_length = min(sentence_lengths)
        longest_sentence_length = max(sentence_lengths)
    else:
        average_sentence_length = 0.0
        shortest_sentence_length = 0
        longest_sentence_length = 0

    # Exact duplicate sentences
    normalized_sentences = [
        " ".join(tokenize_words(sentence))
        for sentence in sentences
    ]

    sentence_frequencies = calculate_word_frequencies(
        normalized_sentences
    )

    repeated_sentences = [
        {
            "sentence": sentence,
            "count": count
        }
        for sentence, count in sentence_frequencies.items()
        if count > 1
    ]

    # Most repeated content words
    content_word_frequencies = calculate_word_frequencies(
        content_words
    )

    frequent_words = sorted(
        [
            {
                "word": word,
                "count": count
            }
            for word, count in content_word_frequencies.items()
            if count >= 2
        ],
        key=lambda item: (-item["count"], item["word"])
    )

    # Keep the response manageable
    frequent_words = frequent_words[:15]

    # Basic interpretation flags
    high_repetition = repetition_ratio >= 0.30
    low_vocabulary_diversity = vocabulary_diversity < 0.45
    high_content_ratio = content_word_ratio >= 0.50

    return {
        "word_count": total_words,
        "content_word_count": total_content_words,
        "unique_word_count": len(unique_words),
        "unique_content_word_count": len(unique_content_words),

        "vocabulary_diversity": round(
            vocabulary_diversity, 3
        ),

        "repetition_ratio": round(
            repetition_ratio, 3
        ),

        "content_word_ratio": round(
            content_word_ratio, 3
        ),

        "sentence_count": len(sentences),

        "average_sentence_length": round(
            average_sentence_length, 2
        ),

        "shortest_sentence_length": shortest_sentence_length,
        "longest_sentence_length": longest_sentence_length,

        "repeated_sentences": repeated_sentences,

        "frequent_content_words": frequent_words,

        "nlp_flags": {
            "high_repetition": high_repetition,
            "low_vocabulary_diversity": low_vocabulary_diversity,
            "strong_content_word_ratio": high_content_ratio,
            "has_exact_repeated_sentences": len(repeated_sentences) > 0
        }
    }


# --------------------------------------------------
# NLP analysis endpoint
# --------------------------------------------------

@app.post("/api/analyze/nlp")
def analyze_nlp(request: TextAnalysisRequest):

    text = request.text.strip()

    if not text:
        return {
            "success": False,
            "message": "No text was provided."
        }

    nlp_results = analyze_nlp_metrics(text)

    return {
        "success": True,
        "source_type": "pasted_text",
        "nlp_analysis": nlp_results
    }
# --------------------------------------------------
# Semantic similarity analysis
# --------------------------------------------------

@app.post("/api/analyze/semantic")
def analyze_semantic(request: TextAnalysisRequest):

    text = request.text.strip()

    if not text:
        return {
            "success": False,
            "message": "No text was provided."
        }

    sentences = [
        sentence.strip()
        for sentence in text.replace("!", ".")
        .replace("?", ".")
        .split(".")
        if sentence.strip()
    ]

    result = analyze_semantic_similarity(sentences)

    return {
        "success": True,
        "source_type": "pasted_text",
        "semantic_analysis": result
    }
# --------------------------------------------------
# Information diversity analysis
# --------------------------------------------------

@app.post("/api/analyze/information")
def analyze_information(request: TextAnalysisRequest):

    text = request.text.strip()

    if not text:
        return {
            "success": False,
            "message": "No text was provided."
        }

    result = analyze_information_diversity(text)

    return {
        "success": True,
        "source_type": "pasted_text",
        "information_analysis": result
    }
# --------------------------------------------------
# Entity analysis
# --------------------------------------------------

@app.post("/api/analyze/entities")
def analyze_entity_endpoint(request: TextAnalysisRequest):

    text = request.text.strip()

    if not text:
        return {
            "success": False,
            "message": "No text was provided."
        }

    result = analyze_entities(text)

    return {
        "success": True,
        "source_type": "pasted_text",
        "entity_analysis": result
    }

# --------------------------------------------------
# Topic coverage analysis endpoint
# --------------------------------------------------

@app.post("/api/analyze/topic-coverage")
def analyze_topic_coverage_endpoint(request: TextAnalysisRequest):

    text = request.text.strip()

    if not text:
        return {
            "success": False,
            "message": "No text was provided."
        }

    result = analyze_topic_coverage(text)

    return {
        "success": True,
        "source_type": "pasted_text",
        "topic_coverage_analysis": result
    }


# --------------------------------------------------
# Citation analysis endpoint
# --------------------------------------------------

@app.post("/api/analyze/citations")
def analyze_citations_endpoint(request: TextAnalysisRequest):

    text = request.text.strip()

    if not text:
        return {
            "success": False,
            "message": "No text was provided."
        }

    result = analyze_citations(text)

    return {
        "success": True,
        "source_type": "pasted_text",
        "citation_analysis": result
    }

# --------------------------------------------------
# Quality analysis
# --------------------------------------------------

@app.post("/api/analyze/quality-features")
def analyze_quality_features_endpoint(request: TextAnalysisRequest):

    text = request.text.strip()

    if not text:
        return {
            "success": False,
            "message": "No text was provided."
        }

    # --------------------------------------------------
    # 1. STRUCTURE ANALYSIS
    # --------------------------------------------------

    sections = extract_sections(text)
    analyzed_sections = analyze_sections(sections)

    section_word_counts = [
        section["word_count"]
        for section in analyzed_sections
    ]

    largest_section_words = (
        max(section_word_counts)
        if section_word_counts
        else 0
    )

    smallest_section_words = (
        min(section_word_counts)
        if section_word_counts
        else 0
    )

    short_sections = [
        section["title"]
        for section in analyzed_sections
        if 0 < section["word_count"] < 30
    ]

    structure_result = {
        "success": True,
        "source_type": "pasted_text",

        "statistics": {
            "word_count": len(text.split()),
            "sentence_count": len(split_sentences(text)),
            "paragraph_count": len(split_paragraphs(text)),
            "section_count": len(analyzed_sections),
            "largest_section_word_count": largest_section_words,
            "smallest_section_word_count": smallest_section_words,
            "short_section_count": len(short_sections)
        },

        "sections": analyzed_sections,

        "structure_flags": {
            "has_multiple_sections": len(analyzed_sections) > 1,
            "has_short_sections": len(short_sections) > 0,
            "short_sections": short_sections
        }
    }

    # --------------------------------------------------
    # 2. NLP ANALYSIS
    # --------------------------------------------------

    nlp_result = analyze_nlp_metrics(text)

    # --------------------------------------------------
    # 3. SEMANTIC ANALYSIS
    # --------------------------------------------------

    sentences = split_sentences(text)

    semantic_result = analyze_semantic_similarity(
        sentences
    )

    # --------------------------------------------------
    # 4. INFORMATION DIVERSITY
    # --------------------------------------------------

    information_result = analyze_information_diversity(
        text
    )

    # --------------------------------------------------
    # 5. ENTITY ANALYSIS
    # --------------------------------------------------

    entity_result = analyze_entities(
        text
    )

    # --------------------------------------------------
    # 6. TOPIC COVERAGE
    # --------------------------------------------------

    topic_result = analyze_topic_coverage(
        text
    )

    # --------------------------------------------------
    # 7. CITATION ANALYSIS
    # --------------------------------------------------

    citation_result = analyze_citations(
        text
    )

    # --------------------------------------------------
    # 8. COMBINED QUALITY ANALYSIS
    # --------------------------------------------------

    quality_result = analyze_quality_features(
        structure_analysis=structure_result,
        nlp_analysis=nlp_result,
        semantic_analysis=semantic_result,
        information_analysis=information_result,
        entity_analysis=entity_result,
        topic_coverage_analysis=topic_result,
        citation_analysis=citation_result
    )

    # --------------------------------------------------
    # 9. AI EXPLANATION
    # --------------------------------------------------

    explanation_result = generate_explanation(
        quality_analysis=quality_result,
        structure_analysis=structure_result,
        nlp_analysis=nlp_result,
        semantic_analysis=semantic_result,
        information_analysis=information_result,
        entity_analysis=entity_result,
        topic_coverage_analysis=topic_result,
        citation_analysis=citation_result
    )

    # --------------------------------------------------
    # 10. EVIDENCE
    # --------------------------------------------------

    evidence_result = build_evidence(
        structure_analysis=structure_result,
        nlp_analysis=nlp_result,
        semantic_analysis=semantic_result,
        information_analysis=information_result,
        entity_analysis=entity_result,
        topic_coverage_analysis=topic_result,
        citation_analysis=citation_result
    )

    # --------------------------------------------------
    # FINAL RESPONSE
    # --------------------------------------------------

    return {
        "success": True,
        "source_type": "pasted_text",

        # Combined quality result
        "quality_analysis": quality_result,

        # Individual analysis results
        "structure_analysis": structure_result,
        "nlp_analysis": nlp_result,
        "semantic_analysis": semantic_result,
        "information_analysis": information_result,
        "entity_analysis": entity_result,
        "topic_coverage_analysis": topic_result,
        "citation_analysis": citation_result,

        # AI explanation
        "ai_explanation": explanation_result,

        # Evidence
        "evidence": evidence_result
    }

# --------------------------------------------------
# explanation analysis
# --------------------------------------------------

@app.post("/api/analyze/explanation")
def analyze_explanation_endpoint(request: TextAnalysisRequest):

    text = request.text.strip()

    if not text:
        return {
            "success": False,
            "message": "No text was provided."
        }

    # ----------------------------------------------
    # 1. Structure
    # ----------------------------------------------

    sections = extract_sections(text)
    analyzed_sections = analyze_sections(sections)

    section_word_counts = [
        section["word_count"]
        for section in analyzed_sections
    ]

    largest_section_words = (
        max(section_word_counts)
        if section_word_counts
        else 0
    )

    smallest_section_words = (
        min(section_word_counts)
        if section_word_counts
        else 0
    )

    short_sections = [
        section["title"]
        for section in analyzed_sections
        if 0 < section["word_count"] < 30
    ]

    structure_result = {
        "success": True,
        "source_type": "pasted_text",
        "statistics": {
            "word_count": len(text.split()),
            "sentence_count": len(split_sentences(text)),
            "paragraph_count": len(split_paragraphs(text)),
            "section_count": len(analyzed_sections),
            "largest_section_word_count": largest_section_words,
            "smallest_section_word_count": smallest_section_words,
            "short_section_count": len(short_sections)
        },
        "sections": analyzed_sections,
        "structure_flags": {
            "has_multiple_sections": len(analyzed_sections) > 1,
            "has_short_sections": len(short_sections) > 0,
            "short_sections": short_sections
        }
    }

    # ----------------------------------------------
    # 2. NLP
    # ----------------------------------------------

    nlp_result = analyze_nlp_metrics(text)

    # ----------------------------------------------
    # 3. Semantic
    # ----------------------------------------------

    sentences = split_sentences(text)

    semantic_result = analyze_semantic_similarity(
        sentences
    )

    # ----------------------------------------------
    # 4. Information
    # ----------------------------------------------

    information_result = analyze_information_diversity(
        text
    )

    # ----------------------------------------------
    # 5. Entities
    # ----------------------------------------------

    entity_result = analyze_entities(text)

    # ----------------------------------------------
    # 6. Topics
    # ----------------------------------------------

    topic_result = analyze_topic_coverage(text)

    # ----------------------------------------------
    # 7. Citations
    # ----------------------------------------------

    citation_result = analyze_citations(text)

    # ----------------------------------------------
    # 8. Quality
    # ----------------------------------------------

    quality_result = analyze_quality_features(
        structure_analysis=structure_result,
        nlp_analysis=nlp_result,
        semantic_analysis=semantic_result,
        information_analysis=information_result,
        entity_analysis=entity_result,
        topic_coverage_analysis=topic_result,
        citation_analysis=citation_result
    )

    # ----------------------------------------------
    # 9. AI Explanation
    # ----------------------------------------------

    explanation_result = generate_explanation(
        quality_analysis=quality_result,
        structure_analysis=structure_result,
        nlp_analysis=nlp_result,
        semantic_analysis=semantic_result,
        information_analysis=information_result,
        entity_analysis=entity_result,
        topic_coverage_analysis=topic_result,
        citation_analysis=citation_result
   )

    # ----------------------------------------------
    # 10. Detailed Evidence
    # ----------------------------------------------

    evidence_result = build_evidence(
        structure_analysis=structure_result,
        nlp_analysis=nlp_result,
        semantic_analysis=semantic_result,
        information_analysis=information_result,
        entity_analysis=entity_result,
        topic_coverage_analysis=topic_result,
        citation_analysis=citation_result
   )

    return {
        "success": True,
        "source_type": "pasted_text",
        "ai_explanation": explanation_result,
        "evidence": evidence_result
    }

# --------------------------------------------------
# ML features
# --------------------------------------------------

@app.post("/api/analyze/ml-features")
def analyze_ml_features_endpoint(request: TextAnalysisRequest):

    text = request.text.strip()

    if not text:
        return {
            "success": False,
            "message": "No text was provided."
        }

    # ----------------------------------------------
    # Structure
    # ----------------------------------------------

    sections = extract_sections(text)
    analyzed_sections = analyze_sections(sections)

    section_word_counts = [
        section["word_count"]
        for section in analyzed_sections
    ]

    largest_section_words = (
        max(section_word_counts)
        if section_word_counts
        else 0
    )

    smallest_section_words = (
        min(section_word_counts)
        if section_word_counts
        else 0
    )

    short_sections = [
        section["title"]
        for section in analyzed_sections
        if 0 < section["word_count"] < 30
    ]

    structure_result = {
        "success": True,
        "source_type": "pasted_text",
        "statistics": {
            "word_count": len(text.split()),
            "sentence_count": len(split_sentences(text)),
            "paragraph_count": len(split_paragraphs(text)),
            "section_count": len(analyzed_sections),
            "largest_section_word_count": largest_section_words,
            "smallest_section_word_count": smallest_section_words,
            "short_section_count": len(short_sections)
        },
        "sections": analyzed_sections,
        "structure_flags": {
            "has_multiple_sections": len(analyzed_sections) > 1,
            "has_short_sections": len(short_sections) > 0,
            "short_sections": short_sections
        }
    }

    # ----------------------------------------------
    # Existing analysis modules
    # ----------------------------------------------

    nlp_result = analyze_nlp_metrics(text)

    sentences = split_sentences(text)

    semantic_result = analyze_semantic_similarity(
        sentences
    )

    information_result = analyze_information_diversity(
        text
    )

    entity_result = analyze_entities(
        text
    )

    topic_result = analyze_topic_coverage(
        text
    )

    citation_result = analyze_citations(
        text
    )

    # ----------------------------------------------
    # Feature engineering
    # ----------------------------------------------

    feature_result = extract_ml_features(
        structure_analysis=structure_result,
        nlp_analysis=nlp_result,
        semantic_analysis=semantic_result,
        information_analysis=information_result,
        entity_analysis=entity_result,
        topic_coverage_analysis=topic_result,
        citation_analysis=citation_result
    )

    return {
        "success": True,
        "source_type": "pasted_text",
        "ml_features": feature_result
    }

class MLDatasetRequest(BaseModel):
    article_id: str
    title: str
    source_url: str = ""
    source_type: str = "wikipedia"
    quality_label: str
    text: str

# --------------------------------------------------
# Dataset record
# --------------------------------------------------

@app.post("/api/ml/dataset-record")
def create_dataset_record(request: MLDatasetRequest):

    try:
        sections = extract_sections(request.text)
        analyzed_sections = analyze_sections(sections)

        structure_analysis = {
            "success": True,
            "sections": analyzed_sections,
            "statistics": {
                "section_count": len(analyzed_sections),
                "total_word_count": sum(
                    section["word_count"]
                    for section in analyzed_sections
                ),
                "total_sentence_count": sum(
                    section["sentence_count"]
                    for section in analyzed_sections
                )
            }
        }

        nlp_analysis = analyze_nlp_metrics(request.text)

        semantic_analysis = analyze_semantic_similarity(
            split_sentences(request.text)
        )

        information_analysis = analyze_information_diversity(
            request.text
        )

        entity_analysis = analyze_entities(
            request.text
        )

        topic_coverage_analysis = analyze_topic_coverage(
            request.text
        )

        citation_analysis = analyze_citations(
            request.text
        )

        ml_result = extract_ml_features(
            structure_analysis,
            nlp_analysis,
            semantic_analysis,
            information_analysis,
            entity_analysis,
            topic_coverage_analysis,
            citation_analysis
        )

        if not ml_result.get("success"):
            return {
                "success": False,
                "message": "Feature extraction failed."
            }

        record = build_dataset_record(
            article_id=request.article_id,
            title=request.title,
            source_url=request.source_url,
            source_type=request.source_type,
            quality_label=request.quality_label,
            features=ml_result["features"]
        )

        save_dataset_record(record)

        return {
            "success": True,
            "message": "Dataset record created successfully.",
            "article_id": request.article_id,
            "quality_label": request.quality_label,
            "feature_count": len(ml_result["features"]),
            "dataset_size": get_dataset_size()
        }

    except ValueError as error:

        return {
            "success": False,
            "message": str(error)
        }

    except Exception as error:

        return {
            "success": False,
            "message": f"Dataset creation failed: {str(error)}"
        }

# --------------------------------------------------
# Dataset validation
# --------------------------------------------------
@app.get("/api/ml/dataset-validation")
def dataset_validation_endpoint():

    return validate_dataset()

# --------------------------------------------------
# Dataset statistics
# --------------------------------------------------
@app.get("/api/ml/dataset-statistics")
def dataset_statistics_endpoint():
    return get_dataset_statistics()

# --------------------------------------------------
# wikipedia article
# --------------------------------------------------
@app.get("/api/wikipedia/article")
def wikipedia_article_endpoint(title: str):
    return get_wikipedia_article(title)

# --------------------------------------------------
# detect quality label
# --------------------------------------------------
@app.post("/api/ml/detect-quality-label")
def detect_quality_label_endpoint(request: dict):
    raw_wikitext = request.get("raw_wikitext", "")

    return detect_quality_label(raw_wikitext)

# --------------------------------------------------
# wikipedia assessment
# --------------------------------------------------
@app.get("/api/wikipedia/assessment")
def wikipedia_assessment_endpoint(title: str):
    return get_wikipedia_assessment(title)

# --------------------------------------------------
# duplicate check helper
# --------------------------------------------------
def dataset_contains_article(article_id: str) -> bool:
    import csv
    import os

    dataset_file = "ml_training_dataset.csv"

    if not os.path.exists(dataset_file):
        return False

    with open(
        dataset_file,
        "r",
        encoding="utf-8"
    ) as file:

        reader = csv.DictReader(file)

        for row in reader:
            if row.get("article_id", "").strip() == str(article_id):
                return True

    return False

# --------------------------------------------------
# wikipedia aouto collector
# --------------------------------------------------
@app.post("/api/ml/collect-wikipedia")
def collect_wikipedia_dataset_record(
    request: WikipediaDatasetRequest
):

    try:
        title = request.title.strip()

        if not title:
            return {
                "success": False,
                "message": "Wikipedia article title is required."
            }

        # ----------------------------------------------
        # Step 1: Retrieve Wikipedia article
        # ----------------------------------------------

        wikipedia_result = get_wikipedia_article(title)

        if not wikipedia_result.get("success"):
            return {
                "success": False,
                "stage": "wikipedia_retrieval",
                "message": wikipedia_result.get(
                    "message",
                    "Wikipedia article retrieval failed."
                )
            }

        article = wikipedia_result["article"]

        article_id = str(article.get("id"))
        article_title = article.get("title", title)
        source_url = article.get("source_url", "")
        raw_wikitext = article.get("raw_wikitext", "")
        clean_text = article.get("clean_text", "")

        if not article_id or article_id == "None":
            return {
                "success": False,
                "stage": "article_validation",
                "message": "Wikipedia article ID is missing."
            }

        if not clean_text.strip():
            return {
                "success": False,
                "stage": "article_validation",
                "message": "Wikipedia article has no usable text."
            }

        # ----------------------------------------------
        # Step 2: Prevent duplicate dataset records
        # ----------------------------------------------

        if dataset_contains_article(article_id):
            return {
                "success": False,
                "stage": "duplicate_check",
                "message": "This Wikipedia article is already in the dataset.",
                "article_id": article_id,
                "title": article_title
            }

        # ----------------------------------------------
        # Step 3: Retrieve Wikipedia assessment
        # ----------------------------------------------

        assessment_result = get_wikipedia_assessment(
            article_title
        )

        if not assessment_result.get("success"):
            return {
                "success": False,
                "stage": "assessment",
                "message": assessment_result.get(
                    "message",
                    "Wikipedia assessment retrieval failed."
                ),
                "article_id": article_id,
                "title": article_title
            }

        quality_label = assessment_result.get(
            "quality_label"
        )

        recognized_quality_classes = assessment_result.get(
            "recognized_quality_classes",
            []
        )

        multiple_quality_classes = assessment_result.get(
            "multiple_quality_classes",
            False
        )

        # ----------------------------------------------
        # Step 4: Reject ambiguous assessments
        # ----------------------------------------------

        if multiple_quality_classes:
            return {
                "success": False,
                "stage": "assessment",
                "message": (
                    "Multiple different Wikipedia quality classes "
                    "were found. The article was not added."
                ),
                "article_id": article_id,
                "title": article_title,
                "recognized_quality_classes": (
                    recognized_quality_classes
                )
            }

        if not quality_label:
            return {
                "success": False,
                "stage": "assessment",
                "message": (
                    "No recognized Wikipedia quality class "
                    "was available. The article was not added."
                ),
                "article_id": article_id,
                "title": article_title
            }

        # ----------------------------------------------
        # Step 5: Structure analysis
        # ----------------------------------------------

        sections = extract_sections(clean_text)

        analyzed_sections = analyze_sections(sections)

        structure_analysis = {
            "success": True,
            "sections": analyzed_sections,
            "statistics": {
                "section_count": len(analyzed_sections),
                "total_word_count": sum(
                    section["word_count"]
                    for section in analyzed_sections
                ),
                "total_sentence_count": sum(
                    section["sentence_count"]
                    for section in analyzed_sections
                )
            }
        }

        # ----------------------------------------------
        # Step 6: NLP analysis
        # ----------------------------------------------

        nlp_analysis = analyze_nlp_metrics(
            clean_text
        )

        # ----------------------------------------------
        # Step 7: Semantic analysis
        # ----------------------------------------------

        semantic_analysis = analyze_semantic_similarity(
            split_sentences(clean_text)
        )

        # ----------------------------------------------
        # Step 8: Information diversity
        # ----------------------------------------------

        information_analysis = analyze_information_diversity(
            clean_text
        )

        # ----------------------------------------------
        # Step 9: Entity analysis
        # ----------------------------------------------

        entity_analysis = analyze_entities(
            clean_text
        )

        # ----------------------------------------------
        # Step 10: Topic coverage
        # ----------------------------------------------

        topic_coverage_analysis = analyze_topic_coverage(
            clean_text
        )

        # ----------------------------------------------
        # Step 11: Citation analysis
        # ----------------------------------------------

        citation_analysis = analyze_citations(
            clean_text
        )

        # ----------------------------------------------
        # Step 12: ML feature extraction
        # ----------------------------------------------

        ml_result = extract_ml_features(
            structure_analysis=structure_analysis,
            nlp_analysis=nlp_analysis,
            semantic_analysis=semantic_analysis,
            information_analysis=information_analysis,
            entity_analysis=entity_analysis,
            topic_coverage_analysis=topic_coverage_analysis,
            citation_analysis=citation_analysis
        )

        if not ml_result.get("success"):
            return {
                "success": False,
                "stage": "feature_extraction",
                "message": "ML feature extraction failed."
            }

        # ----------------------------------------------
        # Step 13: Build dataset record
        # ----------------------------------------------

        record = build_dataset_record(
            article_id=article_id,
            title=article_title,
            source_url=source_url,
            source_type="wikipedia",
            quality_label=quality_label,
            features=ml_result["features"]
        )

        # ----------------------------------------------
        # Step 14: Save dataset record
        # ----------------------------------------------

        save_dataset_record(record)

        # ----------------------------------------------
        # Step 15: Return result
        # ----------------------------------------------

        return {
            "success": True,
            "message": (
                "Wikipedia article analyzed and added "
                "to the training dataset."
            ),
            "article_id": article_id,
            "title": article_title,
            "source_url": source_url,
            "quality_label": quality_label,
            "assessment_source": (
                assessment_result.get("label_source")
            ),
            "feature_count": len(
                ml_result["features"]
            ),
            "dataset_size": get_dataset_size()
        }

    except ValueError as error:

        return {
            "success": False,
            "message": str(error)
        }

    except Exception as error:

        return {
            "success": False,
            "stage": "collector",
            "message": (
                f"Wikipedia dataset collection failed: {str(error)}"
            )
        }
    
# --------------------------------------------------
# ml wikipedia collector
# --------------------------------------------------
@app.post("/api/ml/collect-wikipedia-batch")
def collect_wikipedia_dataset_batch(
    request: WikipediaBatchDatasetRequest
):
    results = []

    for title in request.titles:
        title = title.strip()

        if not title:
            continue

        try:
            wikipedia_result = get_wikipedia_article(title)

            if not wikipedia_result.get("success"):
                results.append({
                    "success": False,
                    "title": title,
                    "stage": "wikipedia_retrieval",
                    "message": wikipedia_result.get(
                        "message",
                        "Wikipedia article retrieval failed."
                    )
                })
                continue

            article = wikipedia_result["article"]

            article_id = str(article.get("id"))
            article_title = article.get("title", title)
            source_url = article.get("source_url", "")
            clean_text = article.get("clean_text", "")

            if not article_id or article_id == "None":
                results.append({
                    "success": False,
                    "title": title,
                    "stage": "article_validation",
                    "message": "Wikipedia article ID is missing."
                })
                continue

            if not clean_text.strip():
                results.append({
                    "success": False,
                    "title": article_title,
                    "stage": "article_validation",
                    "message": "Wikipedia article has no usable text."
                })
                continue

            if dataset_contains_article(article_id):
                results.append({
                    "success": False,
                    "title": article_title,
                    "stage": "duplicate_check",
                    "message": "Article is already in the dataset.",
                    "article_id": article_id
                })
                continue

            assessment_result = get_wikipedia_assessment(
                article_title
            )

            if not assessment_result.get("success"):
                results.append({
                    "success": False,
                    "title": article_title,
                    "stage": "assessment",
                    "message": assessment_result.get(
                        "message",
                        "Wikipedia assessment retrieval failed."
                    )
                })
                continue

            quality_label = assessment_result.get(
                "quality_label"
            )

            recognized_classes = assessment_result.get(
                "recognized_quality_classes",
                []
            )

            multiple_classes = assessment_result.get(
                "multiple_quality_classes",
                False
            )

            if multiple_classes:
                results.append({
                    "success": False,
                    "title": article_title,
                    "stage": "assessment",
                    "message": (
                        "Multiple different Wikipedia quality "
                        "classes were found."
                    ),
                    "recognized_quality_classes": recognized_classes
                })
                continue

            if not quality_label:
                results.append({
                    "success": False,
                    "title": article_title,
                    "stage": "assessment",
                    "message": (
                        "No recognized Wikipedia quality "
                        "class was available."
                    )
                })
                continue

            sections = extract_sections(clean_text)
            analyzed_sections = analyze_sections(sections)

            structure_analysis = {
                "success": True,
                "sections": analyzed_sections,
                "statistics": {
                    "section_count": len(analyzed_sections),
                    "total_word_count": sum(
                        section["word_count"]
                        for section in analyzed_sections
                    ),
                    "total_sentence_count": sum(
                        section["sentence_count"]
                        for section in analyzed_sections
                    )
                }
            }

            nlp_analysis = analyze_nlp_metrics(clean_text)

            semantic_analysis = analyze_semantic_similarity(
                split_sentences(clean_text)
            )

            information_analysis = analyze_information_diversity(
                clean_text
            )

            entity_analysis = analyze_entities(
                clean_text
            )

            topic_coverage_analysis = analyze_topic_coverage(
                clean_text
            )

            citation_analysis = analyze_citations(
                clean_text
            )

            ml_result = extract_ml_features(
                structure_analysis=structure_analysis,
                nlp_analysis=nlp_analysis,
                semantic_analysis=semantic_analysis,
                information_analysis=information_analysis,
                entity_analysis=entity_analysis,
                topic_coverage_analysis=topic_coverage_analysis,
                citation_analysis=citation_analysis
            )

            if not ml_result.get("success"):
                results.append({
                    "success": False,
                    "title": article_title,
                    "stage": "feature_extraction",
                    "message": "ML feature extraction failed."
                })
                continue

            record = build_dataset_record(
                article_id=article_id,
                title=article_title,
                source_url=source_url,
                source_type="wikipedia",
                quality_label=quality_label,
                features=ml_result["features"]
            )

            save_dataset_record(record)

            results.append({
                "success": True,
                "title": article_title,
                "article_id": article_id,
                "quality_label": quality_label,
                "assessment_source": assessment_result.get(
                    "label_source"
                ),
                "feature_count": len(
                    ml_result["features"]
                )
            })

        except Exception as error:
            results.append({
                "success": False,
                "title": title,
                "stage": "collector",
                "message": str(error)
            })

    successful = sum(
        1 for result in results
        if result.get("success")
    )

    failed = sum(
        1 for result in results
        if not result.get("success")
    )

    return {
        "success": True,
        "message": "Batch Wikipedia dataset collection completed.",
        "requested_count": len(request.titles),
        "processed_count": len(results),
        "successful_count": successful,
        "failed_count": failed,
        "dataset_size": get_dataset_size(),
        "results": results
    }



# --------------------------------------------------
# Analysis history
# --------------------------------------------------

class HistoryCreateRequest(BaseModel):
    title: str = "Untitled analysis"
    source_type: str = "pasted_text"
    source_url: str = ""
    article_text: str
    analysis_result: dict


def get_authenticated_user_from_token(token: str | None):
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Authentication token is required.",
        )

    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token.",
        )

    user = get_user_by_id(payload["user_id"])

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User account no longer exists.",
        )

    if user["status"] != "active":
        raise HTTPException(
            status_code=403,
            detail="User account is not active.",
        )

    return user


@app.post("/api/history")
def create_history_endpoint(
    request: HistoryCreateRequest,
    x_auth_token: str | None = Header(default=None, alias="X-Auth-Token"),
):
    user = get_authenticated_user_from_token(x_auth_token)

    text = request.article_text.strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Article text is required.",
        )

    history_id = save_analysis(
        user_id=str(user["id"]),
        title=request.title,
        source_type=request.source_type,
        source_url=request.source_url,
        article_text=text,
        analysis_result=request.analysis_result,
    )

    return {
        "success": True,
        "message": "Analysis saved to history.",
        "analysis_id": history_id,
    }


@app.get("/api/history")
def list_history_endpoint(
    limit: int = 50,
    x_auth_token: str | None = Header(default=None, alias="X-Auth-Token"),
):
    user = get_authenticated_user_from_token(x_auth_token)

    return {
        "success": True,
        "analyses": list_analyses(
            user_id=str(user["id"]),
            limit=limit,
        ),
    }


@app.get("/api/history/{analysis_id}")
def get_history_endpoint(
    analysis_id: int,
    x_auth_token: str | None = Header(default=None, alias="X-Auth-Token"),
):
    user = get_authenticated_user_from_token(x_auth_token)

    record = get_analysis(
        user_id=str(user["id"]),
        analysis_id=analysis_id,
    )

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Analysis history record not found.",
        )

    return {
        "success": True,
        "analysis": record,
    }


# --------------------------------------------------
# ml dataset quality
# --------------------------------------------------
@app.get("/api/ml/dataset-quality")
def dataset_quality_endpoint():
    return analyze_dataset_quality()

@app.post("/api/auth/register")
def register_user(request: RegisterRequest):
    if len(request.name.strip()) < 2:
        raise HTTPException(
            status_code=400,
            detail="Name must contain at least 2 characters.",
        )

    if len(request.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters.",
        )

    email = request.email.strip().lower()

    if "@" not in email:
        raise HTTPException(
            status_code=400,
            detail="Please provide a valid email address.",
        )

    user_id, error = create_user(
        request.name,
        email,
        request.password,
    )

    if error:
        raise HTTPException(
            status_code=409,
            detail=error,
        )

    return {
        "success": True,
        "message": "User account created successfully.",
        "user_id": user_id,
        "role": "user",
    }


@app.post("/api/auth/login")
def login_user(request: LoginRequest):
    role = request.role.strip().lower()

    if role not in {"user", "admin"}:
        raise HTTPException(
            status_code=400,
            detail="Role must be either 'user' or 'admin'.",
        )

    user, error = authenticate_user(
        request.email,
        request.password,
        role,
    )

    if error:
        raise HTTPException(
            status_code=401,
            detail=error,
        )

    token = create_token(
        user["id"],
        user["role"],
    )

    return {
        "success": True,
        "message": "Login successful.",
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        },
    }


@app.post("/api/auth/verify")
def verify_authentication(request: TokenRequest):
    payload = verify_token(request.token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token.",
        )

    user = get_user_by_id(payload["user_id"])

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User account no longer exists.",
        )

    if user["status"] != "active":
        raise HTTPException(
            status_code=403,
            detail="User account is not active.",
        )

    return {
        "success": True,
        "authenticated": True,
        "user": user,
    }


@app.get("/api/admin/users")
def admin_users(token: str):
    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token.",
        )

    if payload["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Administrator access required.",
        )

    return {
        "success": True,
        "users": get_all_users(),
    }
