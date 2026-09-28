def generate_explanation(
    quality_analysis: dict,
    structure_analysis: dict,
    nlp_analysis: dict,
    semantic_analysis: dict,
    information_analysis: dict,
    entity_analysis: dict,
    topic_coverage_analysis: dict,
    citation_analysis: dict
) -> dict:

    if not quality_analysis.get("success", False):
        return {
            "success": False,
            "message": "Quality analysis is not available."
        }

    findings = quality_analysis.get("findings", [])
    strengths = quality_analysis.get("strengths", [])

    explanation_strengths = []
    explanation_concerns = []
    improvement_suggestions = []
    evidence = []

    # --------------------------------------------------
    # 1. STRUCTURE
    # --------------------------------------------------

    structure_statistics = structure_analysis.get(
        "statistics",
        structure_analysis.get("metrics", {})
    )

    section_count = structure_statistics.get("section_count", 0)

    if section_count > 1:
        explanation_strengths.append(
            f"The article contains {section_count} detected sections, "
            "indicating explicit structural organization."
        )

        evidence.append({
            "area": "structure",
            "type": "positive",
            "title": "Section structure",
            "details": f"{section_count} sections were detected."
        })

    else:
        explanation_concerns.append(
            "The article has limited explicit section structure."
        )

        improvement_suggestions.append(
            "Organize the content into clearly defined sections "
            "so different information areas can be distinguished."
        )

        evidence.append({
            "area": "structure",
            "type": "concern",
            "title": "Limited section structure",
            "details": f"Only {section_count} section was detected."
        })

    # --------------------------------------------------
    # 2. NLP
    # --------------------------------------------------

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

    if vocabulary_diversity >= 0.45:
        explanation_strengths.append(
            "The text shows reasonable vocabulary diversity, "
            "with relatively varied content words."
        )

        evidence.append({
            "area": "vocabulary_diversity",
            "type": "positive",
            "title": "Vocabulary diversity",
            "details": f"Vocabulary diversity: {vocabulary_diversity}"
        })
    else:
        explanation_concerns.append(
            "The text shows relatively low vocabulary diversity."
        )

        improvement_suggestions.append(
            "Review repeated terminology and consider whether "
            "additional distinct information can be added."
        )

        evidence.append({
            "area": "vocabulary_diversity",
            "type": "concern",
            "title": "Low vocabulary diversity",
            "details": f"Vocabulary diversity: {vocabulary_diversity}"
        })

    if repetition_ratio >= 0.30:
        explanation_concerns.append(
            "The text contains a high word-level repetition signal."
        )

        improvement_suggestions.append(
            "Review frequently repeated terms and sentences "
            "to determine whether they provide new information."
        )

        evidence.append({
            "area": "repetition",
            "type": "concern",
            "title": "Word-level repetition",
            "details": f"Repetition ratio: {repetition_ratio}"
        })
    else:
        explanation_strengths.append(
            "No high word-level repetition signal was detected."
        )

        evidence.append({
            "area": "repetition",
            "type": "positive",
            "title": "Word-level repetition",
            "details": f"Repetition ratio: {repetition_ratio}"
        })

    # --------------------------------------------------
    # 3. SEMANTIC ANALYSIS
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

    if semantic_redundancy_ratio >= 0.30:
        explanation_concerns.append(
            "Several sentences show high semantic similarity, "
            "which may indicate repeated information."
        )

        improvement_suggestions.append(
            "Review the highly similar sentence pairs and remove "
            "or combine statements that do not add new information."
        )

        evidence.append({
            "area": "semantic_redundancy",
            "type": "concern",
            "title": "Semantically similar sentences",
            "details": (
                f"{len(high_similarity_pairs)} high-similarity "
                "sentence pairs were detected."
            ),
            "examples": high_similarity_pairs[:3]
        })

    else:
        explanation_strengths.append(
            "No high semantic redundancy signal was detected."
        )

        evidence.append({
            "area": "semantic_redundancy",
            "type": "positive",
            "title": "Semantic redundancy",
            "details": (
                f"Semantic redundancy ratio: "
                f"{semantic_redundancy_ratio}"
            )
        })

    # --------------------------------------------------
    # 4. INFORMATION DIVERSITY
    # --------------------------------------------------

    information_metrics = information_analysis.get(
        "metrics",
        information_analysis
    )

    information_diversity = information_metrics.get(
        "information_diversity",
        0
    )

    topic_count = information_metrics.get(
        "topic_count",
        0
    )

    detected_topics = information_analysis.get(
        "detected_topics",
        {}
    )

    if information_diversity >= 0.40:
        explanation_strengths.append(
            "The article contains information across multiple "
            "detected dimensions."
        )

        evidence.append({
            "area": "information_diversity",
            "type": "positive",
            "title": "Information diversity",
            "details": (
                f"Information diversity: {information_diversity}; "
                f"detected topic count: {topic_count}."
            ),
            "topics": list(detected_topics.keys())
        })
    else:
        explanation_concerns.append(
            "The article shows limited information diversity."
        )

        improvement_suggestions.append(
            "Consider adding relevant information from additional "
            "topic or information dimensions."
        )

        evidence.append({
            "area": "information_diversity",
            "type": "concern",
            "title": "Limited information diversity",
            "details": (
                f"Information diversity: {information_diversity}"
            )
        })

    # --------------------------------------------------
    # 5. ENTITY ANALYSIS
    # --------------------------------------------------

    entity_metrics = entity_analysis.get(
        "metrics",
        entity_analysis
    )

    unique_entity_count = entity_metrics.get(
        "unique_entity_count",
        0
    )

    entity_type_count = entity_metrics.get(
        "entity_type_count",
        0
    )

    unique_entities = entity_analysis.get(
        "unique_entities",
        []
    )

    if unique_entity_count >= 3 and entity_type_count >= 2:
        explanation_strengths.append(
            "The article contains diverse named-entity information "
            "across multiple entity types."
        )

        evidence.append({
            "area": "entities",
            "type": "positive",
            "title": "Entity diversity",
            "details": (
                f"{unique_entity_count} unique entities across "
                f"{entity_type_count} entity types."
            ),
            "entities": unique_entities
        })
    else:
        explanation_concerns.append(
            "The article contains limited named-entity diversity."
        )

        improvement_suggestions.append(
            "Check whether additional relevant people, places, "
            "organizations, dates, or other entities should be included."
        )

        evidence.append({
            "area": "entities",
            "type": "concern",
            "title": "Limited entity diversity",
            "details": (
                f"{unique_entity_count} unique entities across "
                f"{entity_type_count} entity types."
            )
        })

    # --------------------------------------------------
    # 6. TOPIC COVERAGE
    # --------------------------------------------------

    topic_metrics = topic_coverage_analysis.get(
        "metrics",
        topic_coverage_analysis
    )

    covered_topic_count = topic_metrics.get(
        "covered_topic_count",
        0
    )

    topic_coverage_ratio = topic_metrics.get(
        "topic_coverage_ratio",
        0
    )

    coverage_level = topic_metrics.get(
        "coverage_level",
        "unknown"
    )

    detected_topic_names = list(
        topic_coverage_analysis.get(
            "detected_topics",
            {}
        ).keys()
    )

    if covered_topic_count >= 6:
        explanation_strengths.append(
            "The article covers multiple detected topic dimensions."
        )

        evidence.append({
            "area": "topic_coverage",
            "type": "positive",
            "title": "Broad topic coverage",
            "details": (
                f"{covered_topic_count} topic dimensions detected "
                f"with a coverage ratio of {topic_coverage_ratio}."
            ),
            "coverage_level": coverage_level,
            "topics": detected_topic_names
        })

    elif covered_topic_count <= 2:
        explanation_concerns.append(
            "The article has limited coverage across the "
            "currently detected topic dimensions."
        )

        improvement_suggestions.append(
            "Compare the article with relevant peer articles "
            "to identify potentially missing topic areas."
        )

        evidence.append({
            "area": "topic_coverage",
            "type": "concern",
            "title": "Limited topic coverage",
            "details": (
                f"{covered_topic_count} topic dimensions detected."
            ),
            "topics": detected_topic_names
        })

    else:
        explanation_concerns.append(
            "The article shows moderate topic coverage "
            "according to the current heuristic."
        )

        evidence.append({
            "area": "topic_coverage",
            "type": "neutral",
            "title": "Moderate topic coverage",
            "details": (
                f"{covered_topic_count} topic dimensions detected."
            ),
            "topics": detected_topic_names
        })

    # --------------------------------------------------
    # 7. CITATION / EVIDENCE ANALYSIS
    # --------------------------------------------------

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

    reference_section = citation_analysis.get(
        "evidence_flags",
        {}
    ).get(
        "has_reference_section",
        False
    )

    if citation_needed_count > 0:
        explanation_concerns.append(
            "The text contains explicit citation-needed markers."
        )

        improvement_suggestions.append(
            "Review the claims marked as requiring citations "
            "and provide appropriate supporting sources."
        )

        evidence.append({
            "area": "citations",
            "type": "concern",
            "title": "Citation-needed markers",
            "details": (
                f"{citation_needed_count} citation-needed "
                "marker(s) detected."
            )
        })

    elif citation_marker_count > 0 or reference_section:
        explanation_strengths.append(
            "Citation or reference signals were detected in the text."
        )

        evidence.append({
            "area": "citations",
            "type": "positive",
            "title": "Citation signals",
            "details": (
                f"{citation_marker_count} citation marker(s) detected; "
                f"reference section present: {reference_section}."
            )
        })

    else:
        explanation_concerns.append(
            "No citation or reference signals were detected."
        )

        improvement_suggestions.append(
            "Review factual claims and add appropriate references "
            "where supporting evidence is required."
        )

        evidence.append({
            "area": "citations",
            "type": "concern",
            "title": "Evidence signals",
            "details": "No citation or reference signals detected."
        })

    # --------------------------------------------------
    # 8. BUILD SUMMARY
    # --------------------------------------------------

    if explanation_concerns and explanation_strengths:
        headline = (
            "The analysis detected several content strengths "
            "along with areas that may need improvement."
        )
    elif explanation_strengths:
        headline = (
            "The analysis detected several positive content signals."
        )
    else:
        headline = (
            "The analysis detected multiple areas that may need review."
        )

    summary_parts = []

    if explanation_strengths:
        summary_parts.append(
            f"{len(explanation_strengths)} positive signals were detected."
        )

    if explanation_concerns:
        summary_parts.append(
            f"{len(explanation_concerns)} areas may need review."
        )

    summary = " ".join(summary_parts)

    return {
        "success": True,
        "explanation": {
            "headline": headline,
            "summary": summary,
            "strengths": explanation_strengths,
            "concerns": explanation_concerns,
            "improvement_suggestions": improvement_suggestions,
            "evidence": evidence
        }
    }