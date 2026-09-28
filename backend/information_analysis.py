import re
from collections import Counter


# --------------------------------------------------
# Topic keyword groups
# --------------------------------------------------

TOPIC_KEYWORDS = {
    "history": [
        "history",
        "historical",
        "dynasty",
        "empire",
        "kingdom",
        "war",
        "battle",
        "ancient",
        "century",
        "founded",
        "established",
    ],

    "geography": [
        "geography",
        "located",
        "location",
        "coast",
        "coastal",
        "river",
        "mountain",
        "district",
        "region",
        "area",
        "border",
        "sea",
        "ocean",
    ],

    "climate": [
        "climate",
        "weather",
        "rainfall",
        "temperature",
        "monsoon",
        "humidity",
        "season",
        "summer",
        "winter",
    ],

    "economy": [
        "economy",
        "economic",
        "industry",
        "industries",
        "business",
        "trade",
        "banking",
        "market",
        "company",
        "employment",
        "commerce",
    ],

    "education": [
        "education",
        "school",
        "schools",
        "college",
        "colleges",
        "university",
        "universities",
        "institution",
        "institutions",
        "student",
        "students",
    ],

    "transportation": [
        "transport",
        "transportation",
        "railway",
        "rail",
        "bus",
        "airport",
        "highway",
        "road",
        "port",
        "station",
    ],

    "culture": [
        "culture",
        "cultural",
        "tradition",
        "traditions",
        "festival",
        "festivals",
        "language",
        "religion",
        "music",
        "dance",
        "art",
        "heritage",
    ],

    "tourism": [
        "tourism",
        "tourist",
        "tourists",
        "tourist attractions",
        "attraction",
        "attractions",
        "travel",
        "temple",
        "beach",
        "museum",
        "monument",
    ],

    "politics": [
        "politics",
        "political",
        "government",
        "governance",
        "election",
        "elections",
        "minister",
        "mayor",
        "administration",
        "political party",
    ],

    "demographics": [
        "population",
        "demographic",
        "demographics",
        "people",
        "population density",
        "households",
        "literacy",
        "census",
        "gender",
        "male",
        "female",
    ],

    "science": [
        "science",
        "scientific",
        "research",
        "experiment",
        "laboratory",
        "technology",
        "discovery",
        "theory",
    ],

    "environment": [
        "environment",
        "environmental",
        "forest",
        "forests",
        "wildlife",
        "biodiversity",
        "pollution",
        "ecosystem",
        "conservation",
        "species",
    ],
}


# --------------------------------------------------
# Utility functions
# --------------------------------------------------

def normalize_words(text):
    """Return lowercase word tokens."""

    return re.findall(r"\b[a-zA-Z]+\b", text.lower())


def detect_numbers(text):
    """Detect numerical information."""

    return re.findall(
        r"\b\d+(?:\.\d+)?(?:\s?%|\s?(?:km|km²|m|m²|°C|years?|million|billion))?\b",
        text,
        flags=re.IGNORECASE,
    )


def detect_dates(text):
    """Detect common date/year patterns."""

    date_patterns = [
        r"\b(?:19|20)\d{2}\b",
        r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
        r"\b(?:January|February|March|April|May|June|July|August|"
        r"September|October|November|December)\s+\d{1,2},?\s+\d{4}\b",
    ]

    dates = []

    for pattern in date_patterns:
        dates.extend(
            re.findall(
                pattern,
                text,
                flags=re.IGNORECASE,
            )
        )

    return dates


def detect_capitalized_terms(text):
    """
    Detect possible named entities using capitalization.

    This is only a lightweight first-stage signal.
    A proper NER model will replace this later.
    """

    pattern = r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\b"

    terms = re.findall(pattern, text)

    # Remove common sentence-start words
    ignored = {
        "The",
        "This",
        "It",
        "Its",
        "A",
        "An",
        "In",
        "On",
        "For",
        "And",
        "But",
        "Mangaluru",
    }

    return [
        term
        for term in terms
        if term not in ignored
    ]


# --------------------------------------------------
# Topic detection
# --------------------------------------------------

def detect_topics(text):
    """Detect information dimensions represented in the text."""

    normalized_text = text.lower()

    detected_topics = {}
    topic_counts = {}

    for topic, keywords in TOPIC_KEYWORDS.items():

        matched_keywords = []

        for keyword in keywords:

            # Handle multi-word phrases and individual words
            pattern = r"\b" + re.escape(keyword.lower()) + r"\b"

            matches = re.findall(
                pattern,
                normalized_text,
                flags=re.IGNORECASE,
            )

            if matches:
                matched_keywords.append(keyword)

        if matched_keywords:
            detected_topics[topic] = matched_keywords
            topic_counts[topic] = len(matched_keywords)

    return detected_topics, topic_counts


# --------------------------------------------------
# Information diversity
# --------------------------------------------------

def analyze_information_diversity(text):
    """
    Analyze different types of information contained in an article.

    This is an interpretable heuristic layer.
    It is not the final ML quality score.
    """

    text = text.strip()

    if not text:
        return {
            "success": False,
            "message": "No text was provided."
        }

    words = normalize_words(text)

    if not words:
        return {
            "success": False,
            "message": "No analyzable words were found."
        }

    # --------------------------------------------------
    # Lexical diversity
    # --------------------------------------------------

    word_counts = Counter(words)

    unique_words = set(words)

    lexical_diversity = (
        len(unique_words) / len(words)
        if words
        else 0.0
    )

    # --------------------------------------------------
    # Topic diversity
    # --------------------------------------------------

    detected_topics, topic_counts = detect_topics(text)

    topic_count = len(detected_topics)

    max_topics = len(TOPIC_KEYWORDS)

    topic_diversity = (
        topic_count / max_topics
        if max_topics > 0
        else 0.0
    )

    # --------------------------------------------------
    # Numeric information
    # --------------------------------------------------

    numbers = detect_numbers(text)

    # --------------------------------------------------
    # Date information
    # --------------------------------------------------

    dates = detect_dates(text)

    # --------------------------------------------------
    # Possible named entities
    # --------------------------------------------------

    capitalized_terms = detect_capitalized_terms(text)

    unique_capitalized_terms = sorted(
        set(capitalized_terms)
    )

    # --------------------------------------------------
    # Information dimensions
    # --------------------------------------------------

    dimensions = []

    if topic_count > 0:
        dimensions.append("topics")

    if unique_capitalized_terms:
        dimensions.append("named_entities")

    if numbers:
        dimensions.append("numerical_information")

    if dates:
        dimensions.append("temporal_information")

    # --------------------------------------------------
    # Information dimension diversity
    # --------------------------------------------------

    total_dimension_types = 4

    dimension_diversity = (
        len(dimensions) / total_dimension_types
    )

    # --------------------------------------------------
    # Combined diversity evidence
    # --------------------------------------------------

    # We deliberately keep this as an interpretable
    # descriptive metric rather than a final quality score.

    information_diversity = (
        (lexical_diversity * 0.30)
        + (topic_diversity * 0.40)
        + (dimension_diversity * 0.30)
    )

    # --------------------------------------------------
    # Flags
    # --------------------------------------------------

    information_flags = {
        "low_topic_diversity": topic_count <= 1,
        "low_lexical_diversity": lexical_diversity < 0.40,
        "limited_information_dimensions": (
            len(dimensions) <= 1
        ),
        "has_multiple_topics": topic_count >= 3,
        "has_numerical_information": bool(numbers),
        "has_temporal_information": bool(dates),
        "has_possible_named_entities": bool(
            unique_capitalized_terms
        ),
    }

    return {
        "success": True,

        "metrics": {
            "word_count": len(words),
            "unique_word_count": len(unique_words),
            "lexical_diversity": round(
                lexical_diversity,
                3
            ),

            "topic_count": topic_count,
            "topic_diversity": round(
                topic_diversity,
                3
            ),

            "information_dimension_count": len(
                dimensions
            ),

            "dimension_diversity": round(
                dimension_diversity,
                3
            ),

            "information_diversity": round(
                information_diversity,
                3
            ),
        },

        "detected_topics": detected_topics,

        "topic_frequency": topic_counts,

        "possible_named_entities": unique_capitalized_terms,

        "numeric_information": numbers,

        "temporal_information": dates,

        "information_dimensions": dimensions,

        "information_flags": information_flags,
    }