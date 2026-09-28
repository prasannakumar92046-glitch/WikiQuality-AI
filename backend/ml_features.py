def extract_ml_features(
    structure_analysis: dict,
    nlp_analysis: dict,
    semantic_analysis: dict,
    information_analysis: dict,
    entity_analysis: dict,
    topic_coverage_analysis: dict,
    citation_analysis: dict
) -> dict:

    # ----------------------------------------------
    # Structure
    # ----------------------------------------------

    structure_metrics = structure_analysis.get(
        "statistics",
        structure_analysis.get("metrics", {})
    )

    section_count = structure_metrics.get(
        "section_count",
        0
    )

    word_count = structure_metrics.get(
        "word_count",
        0
    )

    sentence_count = structure_metrics.get(
        "sentence_count",
        0
    )

    short_section_count = structure_metrics.get(
        "short_section_count",
        0
    )

    # ----------------------------------------------
    # NLP
    # ----------------------------------------------

    nlp_metrics = nlp_analysis.get(
        "nlp_analysis",
        nlp_analysis
    )

    vocabulary_diversity = nlp_metrics.get(
        "vocabulary_diversity",
        0
    )

    repetition_ratio = nlp_metrics.get(
        "repetition_ratio",
        0
    )

    content_word_ratio = nlp_metrics.get(
        "content_word_ratio",
        0
    )

    average_sentence_length = nlp_metrics.get(
        "average_sentence_length",
        0
    )

    # ----------------------------------------------
    # Semantic
    # ----------------------------------------------

    semantic_metrics = semantic_analysis.get(
        "semantic_analysis",
        semantic_analysis
    )

    average_similarity = semantic_metrics.get(
        "average_similarity",
        0
    )

    semantic_redundancy_ratio = semantic_metrics.get(
        "semantic_redundancy_ratio",
        0
    )

    # ----------------------------------------------
    # Information Diversity
    # ----------------------------------------------

    information_metrics = information_analysis.get(
        "metrics",
        information_analysis
    )

    lexical_diversity = information_metrics.get(
        "lexical_diversity",
        0
    )

    topic_count = information_metrics.get(
        "topic_count",
        0
    )

    topic_diversity = information_metrics.get(
        "topic_diversity",
        0
    )

    information_dimension_count = information_metrics.get(
        "information_dimension_count",
        0
    )

    information_diversity = information_metrics.get(
        "information_diversity",
        0
    )

    # ----------------------------------------------
    # Entities
    # ----------------------------------------------

    entity_metrics = entity_analysis.get(
        "metrics",
        entity_analysis
    )

    total_entity_mentions = entity_metrics.get(
        "total_entity_mentions",
        0
    )

    unique_entity_count = entity_metrics.get(
        "unique_entity_count",
        0
    )

    entity_type_count = entity_metrics.get(
        "entity_type_count",
        0
    )

    entity_diversity = entity_metrics.get(
        "entity_diversity",
        0
    )

    # ----------------------------------------------
    # Topic Coverage
    # ----------------------------------------------

    topic_metrics = topic_coverage_analysis.get(
        "metrics",
        topic_coverage_analysis
    )

    covered_topic_count = topic_metrics.get(
        "covered_topic_count",
        0
    )

    total_possible_topics = topic_metrics.get(
        "total_possible_topics",
        0
    )

    topic_coverage_ratio = topic_metrics.get(
        "topic_coverage_ratio",
        0
    )

    # ----------------------------------------------
    # Citation Analysis
    # ----------------------------------------------

    citation_metrics = citation_analysis.get(
        "metrics",
        citation_analysis
    )

    citation_marker_count = citation_metrics.get(
        "citation_marker_count",
        0
    )

    citation_needed_count = citation_metrics.get(
        "citation_needed_count",
        0
    )

    url_count = citation_metrics.get(
        "url_count",
        0
    )

    citation_density = citation_metrics.get(
        "citation_density",
        0
    )

    evidence_signal_count = citation_metrics.get(
        "evidence_signal_count",
        0
    )

    # ----------------------------------------------
    # Final ML feature vector
    # ----------------------------------------------

    features = {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "section_count": section_count,
        "short_section_count": short_section_count,

        "vocabulary_diversity": vocabulary_diversity,
        "repetition_ratio": repetition_ratio,
        "content_word_ratio": content_word_ratio,
        "average_sentence_length": average_sentence_length,

        "average_similarity": average_similarity,
        "semantic_redundancy_ratio": semantic_redundancy_ratio,

        "lexical_diversity": lexical_diversity,
        "topic_count": topic_count,
        "topic_diversity": topic_diversity,
        "information_dimension_count": information_dimension_count,
        "information_diversity": information_diversity,

        "total_entity_mentions": total_entity_mentions,
        "unique_entity_count": unique_entity_count,
        "entity_type_count": entity_type_count,
        "entity_diversity": entity_diversity,

        "covered_topic_count": covered_topic_count,
        "total_possible_topics": total_possible_topics,
        "topic_coverage_ratio": topic_coverage_ratio,

        "citation_marker_count": citation_marker_count,
        "citation_needed_count": citation_needed_count,
        "url_count": url_count,
        "citation_density": citation_density,
        "evidence_signal_count": evidence_signal_count
    }

    return {
        "success": True,
        "feature_count": len(features),
        "features": features
    }