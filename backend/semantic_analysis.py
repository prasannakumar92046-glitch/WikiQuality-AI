from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def analyze_semantic_similarity(sentences, similarity_threshold=0.70):
    """
    Analyze similarity between different sentences.

    Uses TF-IDF vectors and cosine similarity as the
    first-stage semantic redundancy baseline.
    """

    # Remove empty sentences
    cleaned_sentences = [
        sentence.strip()
        for sentence in sentences
        if sentence.strip()
    ]

    if len(cleaned_sentences) < 2:
        return {
            "success": True,
            "sentence_count": len(cleaned_sentences),
            "average_similarity": 0.0,
            "high_similarity_pairs": [],
            "semantic_redundancy_ratio": 0.0,
            "semantic_flags": {
                "high_semantic_redundancy": False
            }
        }

    # Convert sentences into TF-IDF vectors
    vectorizer = TfidfVectorizer(
        lowercase=True,
        stop_words="english"
    )

    try:
        tfidf_matrix = vectorizer.fit_transform(cleaned_sentences)
    except ValueError:
        return {
            "success": True,
            "sentence_count": len(cleaned_sentences),
            "average_similarity": 0.0,
            "high_similarity_pairs": [],
            "semantic_redundancy_ratio": 0.0,
            "semantic_flags": {
                "high_semantic_redundancy": False
            }
        }

    # Calculate pairwise cosine similarity
    similarity_matrix = cosine_similarity(tfidf_matrix)

    high_similarity_pairs = []
    similarity_values = []

    total_pairs = 0
    high_similarity_count = 0

    for i in range(len(cleaned_sentences)):
        for j in range(i + 1, len(cleaned_sentences)):

            similarity = float(similarity_matrix[i][j])

            similarity_values.append(similarity)
            total_pairs += 1

            if similarity >= similarity_threshold:
                high_similarity_count += 1

                high_similarity_pairs.append({
                    "sentence_1": cleaned_sentences[i],
                    "sentence_2": cleaned_sentences[j],
                    "similarity": round(similarity, 3)
                })

    average_similarity = (
        sum(similarity_values) / len(similarity_values)
        if similarity_values
        else 0.0
    )

    semantic_redundancy_ratio = (
        high_similarity_count / total_pairs
        if total_pairs > 0
        else 0.0
    )

    return {
        "success": True,
        "sentence_count": len(cleaned_sentences),
        "average_similarity": round(average_similarity, 3),
        "high_similarity_pairs": high_similarity_pairs,
        "semantic_redundancy_ratio": round(
            semantic_redundancy_ratio,
            3
        ),
        "semantic_flags": {
            "high_semantic_redundancy": (
                semantic_redundancy_ratio >= 0.30
            )
        }
    }