import re


QUALITY_LABELS = [
    "Stub",
    "Start",
    "C",
    "B",
    "GA",
    "FA"
]


ARTICLE_QUALITY_TEMPLATES = {
    "good article": "GA",
    "featured article": "FA"
}


def detect_quality_label(raw_wikitext: str) -> dict:
    """
    Detect an explicitly declared Wikipedia article quality/status
    from article wikitext.

    This function does NOT infer a quality class when no explicit
    evidence is available.
    """

    if not raw_wikitext or not raw_wikitext.strip():
        return {
            "success": False,
            "quality_label": None,
            "label_source": None,
            "message": "Raw Wikipedia wikitext is empty."
        }

    text = raw_wikitext.lower()

    detected_templates = []

    for template_name, quality_label in ARTICLE_QUALITY_TEMPLATES.items():
        pattern = (
            r"\{\{\s*"
            + re.escape(template_name)
            + r"(?:\s*\|[^}]*)?\s*\}\}"
        )

        if re.search(pattern, text, flags=re.IGNORECASE):
            detected_templates.append({
                "template": template_name,
                "quality_label": quality_label
            })

    # Featured Article takes precedence if multiple status
    # templates are encountered.
    if any(
        item["quality_label"] == "FA"
        for item in detected_templates
    ):
        quality_label = "FA"

    elif any(
        item["quality_label"] == "GA"
        for item in detected_templates
    ):
        quality_label = "GA"

    else:
        quality_label = None

    if quality_label:
        return {
            "success": True,
            "quality_label": quality_label,
            "label_source": "wikipedia_article_template",
            "detected_templates": detected_templates,
            "label_confidence": "source_defined"
        }

    return {
        "success": True,
        "quality_label": None,
        "label_source": None,
        "detected_templates": [],
        "label_confidence": None,
        "message": (
            "No explicit article quality/status template "
            "was detected in the supplied wikitext."
        )
    }