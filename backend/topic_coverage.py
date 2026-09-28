import re


TOPIC_KEYWORDS = {
    "history": [
        "history", "historical", "founded", "established",
        "ancient", "medieval", "dynasty", "century"
    ],
    "geography": [
        "geography", "location", "located", "coastal",
        "river", "mountain", "sea", "region", "district"
    ],
    "climate": [
        "climate", "rainfall", "temperature", "monsoon",
        "weather", "humid", "season"
    ],
    "economy": [
        "economy", "economic", "industry", "industries",
        "business", "banking", "trade", "commerce"
    ],
    "education": [
        "education", "university", "universities",
        "college", "school", "institution", "academic"
    ],
    "transportation": [
        "transport", "transportation", "railway", "rail",
        "airport", "bus", "road", "highway", "port"
    ],
    "culture": [
        "culture", "cultural", "festival", "festivals",
        "tradition", "religion", "music", "dance", "food"
    ],
    "tourism": [
        "tourism", "tourist", "tourists", "attraction",
        "attractions", "travel", "destination"
    ],
    "politics": [
        "politics", "political", "government", "election",
        "elections", "politician", "administration"
    ],
    "demographics": [
        "population", "census", "demographic", "demographics",
        "people", "population density"
    ],
    "environment": [
        "environment", "environmental", "forest", "forests",
        "wildlife", "biodiversity", "pollution", "ecosystem"
    ],
    "science": [
        "science", "scientific", "research", "technology",
        "experiment", "laboratory", "innovation"
    ]
}


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def detect_topic_evidence(text: str) -> dict:
    normalized_text = normalize_text(text)

    detected_topics = {}
    topic_scores = {}

    for topic, keywords in TOPIC_KEYWORDS.items():
        matched_keywords = []

        for keyword in keywords:
            pattern = r"\b" + re.escape(keyword.lower()) + r"\b"

            if re.search(pattern, normalized_text):
                matched_keywords.append(keyword)

        if matched_keywords:
            detected_topics[topic] = matched_keywords
            topic_scores[topic] = len(matched_keywords)

    return detected_topics, topic_scores


def analyze_topic_coverage(text: str) -> dict:
    if not text.strip():
        return {
            "success": False,
            "message": "No text was provided."
        }

    detected_topics, topic_scores = detect_topic_evidence(text)

    total_possible_topics = len(TOPIC_KEYWORDS)
    covered_topic_count = len(detected_topics)

    topic_coverage_ratio = (
        covered_topic_count / total_possible_topics
        if total_possible_topics > 0
        else 0.0
    )

    if covered_topic_count == 0:
        coverage_level = "very_low"
    elif covered_topic_count <= 2:
        coverage_level = "low"
    elif covered_topic_count <= 5:
        coverage_level = "moderate"
    elif covered_topic_count <= 8:
        coverage_level = "good"
    else:
        coverage_level = "broad"

    topic_flags = {
        "has_topic_coverage": covered_topic_count > 0,
        "has_multiple_topics": covered_topic_count >= 3,
        "low_topic_coverage": covered_topic_count <= 2,
        "broad_topic_coverage": covered_topic_count >= 6
    }

    return {
        "success": True,
        "metrics": {
            "total_possible_topics": total_possible_topics,
            "covered_topic_count": covered_topic_count,
            "topic_coverage_ratio": round(topic_coverage_ratio, 3),
            "coverage_level": coverage_level
        },
        "detected_topics": detected_topics,
        "topic_scores": topic_scores,
        "topic_flags": topic_flags
    }