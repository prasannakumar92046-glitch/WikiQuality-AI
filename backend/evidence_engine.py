def build_evidence(
    structure_analysis: dict,
    nlp_analysis: dict,
    semantic_analysis: dict,
    information_analysis: dict,
    entity_analysis: dict,
    topic_coverage_analysis: dict,
    citation_analysis: dict
) -> list:

    evidence = []

    # --------------------------------------------------
    # 1. STRUCTURE EVIDENCE
    # --------------------------------------------------

    structure_statistics = structure_analysis.get(
        "statistics",
        structure_analysis.get("metrics", {})
    )

    section_count = structure_statistics.get(
        "section_count",
        0
    )

    sections = structure_analysis.get(
        "sections",
        []
    )

    evidence.append({
        "area": "structure",
        "title": "Article structure",
        "data": {
            "section_count": section_count,
            "sections": sections
        }
    })

    # --------------------------------------------------
    # 2. NLP / REPETITION EVIDENCE
    # --------------------------------------------------

    nlp_metrics = nlp_analysis.get(
        "nlp_analysis",
        nlp_analysis
    )

    repetition_ratio = nlp_metrics.get(
        "repetition_ratio",
        0
    )

    vocabulary_diversity = nlp_metrics.get(
        "vocabulary_diversity",
        0
    )

    repeated_sentences = nlp_metrics.get(
        "repeated_sentences",
        []
    )

    frequent_content_words = nlp_metrics.get(
        "frequent_content_words",
        []
    )

    evidence.append({
        "area": "repetition",
        "title": "Word-level repetition evidence",
        "data": {
            "repetition_ratio": repetition_ratio,
            "repeated_sentences": repeated_sentences,
            "frequent_content_words": frequent_content_words
        }
    })

    evidence.append({
        "area": "vocabulary_diversity",
        "title": "Vocabulary diversity evidence",
        "data": {
            "vocabulary_diversity": vocabulary_diversity,
            "unique_content_word_count": nlp_metrics.get(
                "unique_content_word_count",
                0
            ),
            "content_word_count": nlp_metrics.get(
                "content_word_count",
                0
            )
        }
    })

    # --------------------------------------------------
    # 3. SEMANTIC EVIDENCE
    # --------------------------------------------------

    semantic_metrics = semantic_analysis.get(
        "semantic_analysis",
        semantic_analysis
    )

    semantic_redundancy_ratio = semantic_metrics.get(
        "semantic_redundancy_ratio",
        0
    )

    high_similarity_pairs = semantic_metrics.get(
        "high_similarity_pairs",
        []
    )

    evidence.append({
        "area": "semantic_redundancy",
        "title": "Semantic similarity evidence",
        "data": {
            "semantic_redundancy_ratio": semantic_redundancy_ratio,
            "high_similarity_pair_count": len(
                high_similarity_pairs
            ),
            "high_similarity_pairs": high_similarity_pairs
        }
    })

    # --------------------------------------------------
    # 4. INFORMATION DIVERSITY EVIDENCE
    # --------------------------------------------------

    information_metrics = information_analysis.get(
        "metrics",
        information_analysis
    )

    evidence.append({
        "area": "information_diversity",
        "title": "Information diversity evidence",
        "data": {
            "information_diversity": information_metrics.get(
                "information_diversity",
                0
            ),
            "topic_count": information_metrics.get(
                "topic_count",
                0
            ),
            "detected_topics": information_analysis.get(
                "detected_topics",
                {}
            ),
            "information_dimensions": information_analysis.get(
                "information_dimensions",
                []
            )
        }
    })

    # --------------------------------------------------
    # 5. ENTITY EVIDENCE
    # --------------------------------------------------

    entity_metrics = entity_analysis.get(
        "metrics",
        entity_analysis
    )

    evidence.append({
        "area": "entities",
        "title": "Named entity evidence",
        "data": {
            "unique_entity_count": entity_metrics.get(
                "unique_entity_count",
                0
            ),
            "entity_type_count": entity_metrics.get(
                "entity_type_count",
                0
            ),
            "unique_entities": entity_analysis.get(
                "unique_entities",
                []
            ),
            "entity_type_counts": entity_analysis.get(
                "entity_type_counts",
                {}
            ),
            "entities": entity_analysis.get(
                "entities",
                []
            )
        }
    })

    # --------------------------------------------------
    # 6. TOPIC COVERAGE EVIDENCE
    # --------------------------------------------------

    topic_metrics = topic_coverage_analysis.get(
        "metrics",
        topic_coverage_analysis
    )

    evidence.append({
        "area": "topic_coverage",
        "title": "Topic coverage evidence",
        "data": {
            "covered_topic_count": topic_metrics.get(
                "covered_topic_count",
                0
            ),
            "total_possible_topics": topic_metrics.get(
                "total_possible_topics",
                0
            ),
            "topic_coverage_ratio": topic_metrics.get(
                "topic_coverage_ratio",
                0
            ),
            "coverage_level": topic_metrics.get(
                "coverage_level",
                "unknown"
            ),
            "detected_topics": topic_coverage_analysis.get(
                "detected_topics",
                {}
            ),
            "topic_scores": topic_coverage_analysis.get(
                "topic_scores",
                {}
            )
        }
    })

    # --------------------------------------------------
    # 7. CITATION EVIDENCE
    # --------------------------------------------------

    citation_metrics = citation_analysis.get(
        "metrics",
        citation_analysis
    )

    citation_flags = citation_analysis.get(
        "evidence_flags",
        {}
    )

    evidence.append({
        "area": "citations",
        "title": "Citation and evidence signals",
        "data": {
            "citation_marker_count": citation_metrics.get(
                "citation_marker_count",
                0
            ),
            "citation_needed_count": citation_metrics.get(
                "citation_needed_count",
                0
            ),
            "url_count": citation_metrics.get(
                "url_count",
                0
            ),
            "citation_density": citation_metrics.get(
                "citation_density",
                0
            ),
            "has_reference_section": citation_flags.get(
                "has_reference_section",
                False
            ),
            "has_external_links_section": citation_flags.get(
                "has_external_links_section",
                False
            ),
            "citation_markers": citation_analysis.get(
                "citation_markers",
                []
            ),
            "urls": citation_analysis.get(
                "urls",
                []
            )
        }
    })

    return evidence