import re


def analyze_citations(text: str) -> dict:
    if not text.strip():
        return {
            "success": False,
            "message": "No text was provided."
        }

    # Wikipedia-style citation markers such as [1], [2], [12]
    citation_markers = re.findall(r"\[\s*\d+\s*\]", text)

    # Generic reference markers such as [citation needed]
    citation_needed_markers = re.findall(
        r"\[\s*citation\s+needed\s*\]",
        text,
        flags=re.IGNORECASE
    )

    # Detect URLs
    urls = re.findall(
        r"https?://[^\s<>\"]+",
        text,
        flags=re.IGNORECASE
    )

    # Detect a References section
    references_section = bool(
        re.search(
            r"(?im)^\s*(references|sources|citations)\s*:?\s*$",
            text
        )
    )

    # Detect an External links section
    external_links_section = bool(
        re.search(
            r"(?im)^\s*(external\s+links|external\s+sources)\s*:?\s*$",
            text
        )
    )

    # Approximate sentence count
    sentences = [
        sentence.strip()
        for sentence in re.split(r"[.!?]+", text)
        if sentence.strip()
    ]

    sentence_count = len(sentences)
    citation_marker_count = len(citation_markers)
    citation_needed_count = len(citation_needed_markers)
    url_count = len(urls)

    # Citation density is an indicator, not a judgment of citation quality.
    citation_density = (
        citation_marker_count / sentence_count
        if sentence_count > 0
        else 0.0
    )

    evidence_signals = 0

    if citation_marker_count > 0:
        evidence_signals += 1

    if url_count > 0:
        evidence_signals += 1

    if references_section:
        evidence_signals += 1

    if external_links_section:
        evidence_signals += 1

    evidence_flags = {
        "has_citation_markers": citation_marker_count > 0,
        "has_reference_section": references_section,
        "has_external_links_section": external_links_section,
        "has_urls": url_count > 0,
        "has_citation_needed_markers": citation_needed_count > 0,
        "has_evidence_signals": evidence_signals > 0,
        "potential_evidence_gap": (
            sentence_count >= 3 and evidence_signals == 0
        )
    }

    return {
        "success": True,
        "metrics": {
            "sentence_count": sentence_count,
            "citation_marker_count": citation_marker_count,
            "citation_needed_count": citation_needed_count,
            "url_count": url_count,
            "citation_density": round(citation_density, 3),
            "evidence_signal_count": evidence_signals
        },
        "citation_markers": citation_markers,
        "urls": urls,
        "evidence_flags": evidence_flags
    }