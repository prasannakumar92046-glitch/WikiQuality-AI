def analyze_quality_features(
    structure_analysis: dict,
    nlp_analysis: dict,
    semantic_analysis: dict,
    information_analysis: dict,
    entity_analysis: dict,
    topic_coverage_analysis: dict,
    citation_analysis: dict
) -> dict:

    findings = []
    strengths = []

    # ---------------------------------------------------------
    # STRUCTURE
    # ---------------------------------------------------------

    structure_metrics = structure_analysis.get(
    "metrics",
    structure_analysis.get("statistics", {})
)
    section_count = structure_metrics.get("section_count", 0)

    if section_count >= 3:
        strengths.append({
            "area": "structure",
            "message": "The article contains multiple structured sections.",
            "evidence": {
                "section_count": section_count
            }
        })
    else:
        findings.append({
            "area": "structure",
            "severity": "medium",
            "message": "The article has limited section structure.",
            "evidence": {
                "section_count": section_count
            }
        })

    # ---------------------------------------------------------
    # NLP
    # ---------------------------------------------------------

    nlp_metrics = nlp_analysis.get("nlp_analysis", nlp_analysis)

    repetition_ratio = nlp_metrics.get("repetition_ratio", 0)
    vocabulary_diversity = nlp_metrics.get("vocabulary_diversity", 0)

    if repetition_ratio >= 0.30:
        findings.append({
            "area": "repetition",
            "severity": "high",
            "message": "The article contains a relatively high amount of repeated content words.",
            "evidence": {
                "repetition_ratio": repetition_ratio
            }
        })
    else:
        strengths.append({
            "area": "repetition",
            "message": "No high word-level repetition signal was detected.",
            "evidence": {
                "repetition_ratio": repetition_ratio
            }
        })

    if vocabulary_diversity < 0.45:
        findings.append({
            "area": "vocabulary_diversity",
            "severity": "medium",
            "message": "Vocabulary diversity is relatively low.",
            "evidence": {
                "vocabulary_diversity": vocabulary_diversity
            }
        })
    else:
        strengths.append({
            "area": "vocabulary_diversity",
            "message": "The article shows reasonable vocabulary diversity.",
            "evidence": {
                "vocabulary_diversity": vocabulary_diversity
            }
        })

    # ---------------------------------------------------------
    # SEMANTIC REDUNDANCY
    # ---------------------------------------------------------

    semantic_metrics = semantic_analysis.get(
        "semantic_analysis",
        semantic_analysis
    )

    semantic_redundancy_ratio = semantic_metrics.get(
        "semantic_redundancy_ratio",
        0
    )

    if semantic_redundancy_ratio >= 0.30:
        findings.append({
            "area": "semantic_redundancy",
            "severity": "high",
            "message": "Several sentence pairs show high semantic similarity.",
            "evidence": {
                "semantic_redundancy_ratio": semantic_redundancy_ratio,
                "high_similarity_pairs": semantic_metrics.get(
                    "high_similarity_pairs",
                    []
                )
            }
        })
    else:
        strengths.append({
            "area": "semantic_redundancy",
            "message": "No high semantic redundancy signal was detected.",
            "evidence": {
                "semantic_redundancy_ratio": semantic_redundancy_ratio
            }
        })

    # ---------------------------------------------------------
    # INFORMATION DIVERSITY
    # ---------------------------------------------------------

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

    if information_diversity < 0.40:
        findings.append({
            "area": "information_diversity",
            "severity": "medium",
            "message": "The article shows limited information diversity.",
            "evidence": {
                "information_diversity": information_diversity,
                "topic_count": topic_count
            }
        })
    else:
        strengths.append({
            "area": "information_diversity",
            "message": "The article contains information across multiple dimensions.",
            "evidence": {
                "information_diversity": information_diversity,
                "topic_count": topic_count
            }
        })

    # ---------------------------------------------------------
    # ENTITY ANALYSIS
    # ---------------------------------------------------------

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

    if unique_entity_count >= 3 and entity_type_count >= 2:
        strengths.append({
            "area": "entities",
            "message": "The article contains diverse named-entity information.",
            "evidence": {
                "unique_entity_count": unique_entity_count,
                "entity_type_count": entity_type_count
            }
        })
    else:
        findings.append({
            "area": "entities",
            "severity": "low",
            "message": "The article contains limited detected entity diversity.",
            "evidence": {
                "unique_entity_count": unique_entity_count,
                "entity_type_count": entity_type_count
            }
        })

    # ---------------------------------------------------------
    # TOPIC COVERAGE
    # ---------------------------------------------------------

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

    if covered_topic_count <= 2:
        findings.append({
            "area": "topic_coverage",
            "severity": "high",
            "message": "The article covers only a small number of detected topic dimensions.",
            "evidence": {
                "covered_topic_count": covered_topic_count,
                "topic_coverage_ratio": topic_coverage_ratio
            }
        })
    elif covered_topic_count >= 6:
        strengths.append({
            "area": "topic_coverage",
            "message": "The article covers multiple detected topic dimensions.",
            "evidence": {
                "covered_topic_count": covered_topic_count,
                "topic_coverage_ratio": topic_coverage_ratio
            }
        })
    else:
        findings.append({
            "area": "topic_coverage",
            "severity": "low",
            "message": "The article has moderate topic coverage.",
            "evidence": {
                "covered_topic_count": covered_topic_count,
                "topic_coverage_ratio": topic_coverage_ratio
            }
        })

    # ---------------------------------------------------------
    # CITATIONS / EVIDENCE
    # ---------------------------------------------------------

    citation_metrics = citation_analysis.get(
        "metrics",
        citation_analysis
    )

    citation_marker_count = citation_metrics.get(
        "citation_marker_count",
        0
    )

    evidence_signals = citation_metrics.get(
        "evidence_signal_count",
        0
    )

    if citation_marker_count > 0:
        strengths.append({
            "area": "citations",
            "message": "Citation markers were detected in the article.",
            "evidence": {
                "citation_marker_count": citation_marker_count,
                "evidence_signal_count": evidence_signals
            }
        })
    else:
        findings.append({
            "area": "citations",
            "severity": "medium",
            "message": "No citation markers were detected.",
            "evidence": {
                "citation_marker_count": citation_marker_count
            }
        })

    # ---------------------------------------------------------
    # SUMMARY
    # ---------------------------------------------------------

    high_findings = sum(
        1 for finding in findings
        if finding.get("severity") == "high"
    )

    medium_findings = sum(
        1 for finding in findings
        if finding.get("severity") == "medium"
    )

    low_findings = sum(
        1 for finding in findings
        if finding.get("severity") == "low"
    )

    return {
        "success": True,
        "summary": {
            "total_findings": len(findings),
            "high_findings": high_findings,
            "medium_findings": medium_findings,
            "low_findings": low_findings,
            "total_strengths": len(strengths)
        },
        "strengths": strengths,
        "findings": findings
    }